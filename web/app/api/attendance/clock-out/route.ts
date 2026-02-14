import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateGeofence } from '@/lib/geofence-validation'

interface ClockOutRequest {
  employeeId: string
  latitude?: number
  longitude?: number
  accuracy?: number
  photoUrl?: string
  punchMethod?: 'APP' | 'PIN' | 'QR_CODE' | 'FACIAL' | 'MANUAL' | 'KIOSK'
  deviceInfo?: string
  isOfflinePunch?: boolean
  offlineTimestamp?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ClockOutRequest = await request.json()
    const {
      employeeId,
      latitude,
      longitude,
      accuracy,
      photoUrl,
      punchMethod = 'APP',
      deviceInfo,
      isOfflinePunch = false,
      offlineTimestamp,
      notes,
    } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required' },
        { status: 400 }
      )
    }

    // Get employee with assignments for geofence validation
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        ShopAssignments: {
          include: {
            Shop: {
              include: {
                Geofences: { where: { isActive: true } },
              },
            },
          },
        },
        GeofenceAssignments: {
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

    // Check if clocked in
    const lastPunch = await prisma.punchRecord.findFirst({
      where: { employeeId },
      orderBy: { timestamp: 'desc' },
    })

    if (!lastPunch || lastPunch.type === 'CLOCK_OUT') {
      return NextResponse.json(
        { error: 'Not clocked in. Please clock in first.' },
        { status: 400 }
      )
    }

    // Find the clock-in punch for this shift
    const clockInPunch = await prisma.punchRecord.findFirst({
      where: {
        employeeId,
        type: 'CLOCK_IN',
      },
      orderBy: { timestamp: 'desc' },
      include: {
        Shop: { select: { id: true, name: true } },
      },
    })

    // Geofence validation
    const { result: geofenceResult, error: geofenceError } = validateGeofence(
      latitude,
      longitude,
      employee.ShopAssignments as any,
      employee.GeofenceAssignments as any,
    )

    if (geofenceError) {
      return NextResponse.json(
        {
          error: 'Outside geofence',
          message: geofenceError,
          distance: geofenceResult.distance,
        },
        { status: 403 }
      )
    }

    const timestamp = isOfflinePunch && offlineTimestamp
      ? new Date(offlineTimestamp)
      : new Date()

    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') || 'unknown'

    const punch = await prisma.punchRecord.create({
      data: {
        employeeId,
        type: 'CLOCK_OUT',
        timestamp,
        latitude,
        longitude,
        accuracy,
        photoUrl,
        shopId: geofenceResult.shopId || clockInPunch?.shopId,
        geofenceId: geofenceResult.geofenceId || clockInPunch?.geofenceId,
        isWithinGeofence: geofenceResult.isWithin,
        distanceFromGeofence: geofenceResult.distance,
        punchMethod,
        deviceInfo,
        ipAddress,
        isOfflinePunch,
        offlineSyncedAt: isOfflinePunch ? new Date() : null,
        notes,
      },
      include: {
        EmployeeProfile: { select: { id: true, name: true } },
        Shop: { select: { id: true, name: true } },
      },
    })

    // Calculate shift duration
    let shiftDuration = 0
    let breakDuration = 0

    if (clockInPunch) {
      const shiftMs = timestamp.getTime() - clockInPunch.timestamp.getTime()
      shiftDuration = Math.floor(shiftMs / 1000 / 60) // in minutes

      // Calculate break time
      const breakPunches = await prisma.punchRecord.findMany({
        where: {
          employeeId,
          timestamp: {
            gte: clockInPunch.timestamp,
            lte: timestamp,
          },
          type: { in: ['BREAK_START', 'BREAK_END'] },
        },
        orderBy: { timestamp: 'asc' },
      })

      let breakStart: Date | null = null
      for (const bp of breakPunches) {
        if (bp.type === 'BREAK_START') {
          breakStart = bp.timestamp
        } else if (bp.type === 'BREAK_END' && breakStart) {
          breakDuration += Math.floor(
            (bp.timestamp.getTime() - breakStart.getTime()) / 1000 / 60
          )
          breakStart = null
        }
      }
    }

    const workDuration = shiftDuration - breakDuration
    const hours = Math.floor(workDuration / 60)
    const minutes = workDuration % 60

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
        },
      },
      shiftSummary: {
        clockIn: clockInPunch?.timestamp,
        clockOut: timestamp,
        totalMinutes: shiftDuration,
        breakMinutes: breakDuration,
        workMinutes: workDuration,
        formatted: `${hours}h ${minutes}m`,
      },
      message: `Clocked out. Shift duration: ${hours}h ${minutes}m`,
    })
  } catch (error) {
    console.error('Clock out error:', error)
    return NextResponse.json(
      { error: 'Failed to clock out' },
      { status: 500 }
    )
  }
}
