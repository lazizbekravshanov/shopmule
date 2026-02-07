import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isWithinGeofence, findNearestGeofence } from '@/lib/geo-utils'

interface ClockInRequest {
  employeeId: string
  latitude?: number
  longitude?: number
  accuracy?: number
  photoUrl?: string
  workOrderId?: string
  punchMethod?: 'APP' | 'PIN' | 'QR_CODE' | 'FACIAL' | 'MANUAL' | 'KIOSK'
  deviceInfo?: string
  isOfflinePunch?: boolean
  offlineTimestamp?: string
  pin?: string
  shopId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ClockInRequest = await request.json()
    const {
      employeeId,
      latitude,
      longitude,
      accuracy,
      photoUrl,
      workOrderId,
      punchMethod = 'APP',
      deviceInfo,
      isOfflinePunch = false,
      offlineTimestamp,
      pin,
      shopId,
    } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required' },
        { status: 400 }
      )
    }

    // Get employee with assignments
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        ShopAssignment: {
          include: {
            Shop: {
              include: {
                Geofence: { where: { isActive: true } },
              },
            },
          },
        },
        GeofenceAssignment: {
          include: {
            Geofence: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Verify PIN if provided
    if (punchMethod === 'PIN' && pin && employee.pin !== pin) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      )
    }

    // Check if already clocked in
    const lastPunch = await prisma.punchRecord.findFirst({
      where: { employeeId },
      orderBy: { timestamp: 'desc' },
    })

    if (lastPunch && (lastPunch.type === 'CLOCK_IN' || lastPunch.type === 'BREAK_END')) {
      return NextResponse.json(
        { error: 'Already clocked in. Please clock out first.' },
        { status: 400 }
      )
    }

    // Geofence validation
    let geofenceResult = {
      isWithin: true,
      distance: 0,
      geofenceId: null as string | null,
      detectedShopId: shopId || null as string | null,
    }

    if (latitude !== undefined && longitude !== undefined) {
      const allGeofences = [
        ...employee.ShopAssignment.flatMap((sa) =>
          sa.Shop.Geofence.map((g) => ({ ...g, shopId: sa.Shop.id }))
        ),
        ...employee.GeofenceAssignment.map((ga) => ({
          ...ga.Geofence,
          shopId: ga.Geofence.shopId,
        })),
      ]

      const uniqueGeofences = Array.from(
        new Map(allGeofences.map((g) => [g.id, g])).values()
      )

      if (uniqueGeofences.length > 0) {
        const nearest = findNearestGeofence(
          latitude,
          longitude,
          uniqueGeofences.map((g) => ({
            id: g.id,
            latitude: g.latitude,
            longitude: g.longitude,
            radiusMeters: g.radiusMeters,
          }))
        )

        if (nearest.geofence) {
          const geoData = uniqueGeofences.find((g) => g.id === nearest.geofence!.id)
          geofenceResult = {
            isWithin: nearest.isWithin,
            distance: nearest.distance,
            geofenceId: nearest.geofence.id,
            detectedShopId: geoData?.shopId || null,
          }

          if (geoData?.isRequired && !nearest.isWithin) {
            return NextResponse.json(
              {
                error: 'Outside geofence',
                message: `You are ${nearest.distance} meters from the allowed area. Please move closer to clock in.`,
                distance: nearest.distance,
              },
              { status: 403 }
            )
          }
        }
      }
    }

    const timestamp = isOfflinePunch && offlineTimestamp
      ? new Date(offlineTimestamp)
      : new Date()

    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') || 'unknown'

    const punch = await prisma.punchRecord.create({
      data: {
        employeeId,
        type: 'CLOCK_IN',
        timestamp,
        latitude,
        longitude,
        accuracy,
        photoUrl,
        geofenceId: geofenceResult.geofenceId,
        shopId: geofenceResult.detectedShopId,
        isWithinGeofence: geofenceResult.isWithin,
        distanceFromGeofence: geofenceResult.distance,
        workOrderId,
        punchMethod,
        deviceInfo,
        ipAddress,
        isOfflinePunch,
        offlineSyncedAt: isOfflinePunch ? new Date() : null,
      },
      include: {
        EmployeeProfile: { select: { id: true, name: true } },
        Shop: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      success: true,
      punch: {
        id: punch.id,
        type: punch.type,
        timestamp: punch.timestamp,
        employee: punch.EmployeeProfile,
        shop: punch.Shop,
        location: {
          latitude: punch.latitude,
          longitude: punch.longitude,
          isWithinGeofence: punch.isWithinGeofence,
        },
      },
      message: `Clocked in at ${punch.Shop?.name || 'shop'}`,
    })
  } catch (error) {
    console.error('Clock in error:', error)
    return NextResponse.json(
      { error: 'Failed to clock in' },
      { status: 500 }
    )
  }
}
