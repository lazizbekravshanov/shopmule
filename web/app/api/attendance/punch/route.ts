import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPin } from '@/lib/pin-utils'
import { validateGeofence } from '@/lib/geofence-validation'

interface PunchRequest {
  employeeId: string
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END'
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
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PunchRequest = await request.json()
    const {
      employeeId,
      type,
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
      notes,
    } = body

    // Validate required fields
    if (!employeeId || !type) {
      return NextResponse.json(
        { error: 'employeeId and type are required' },
        { status: 400 }
      )
    }

    // Get employee with their assigned shops and geofences
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        User: true,
        ShopAssignments: {
          include: {
            Shop: {
              include: {
                Geofences: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
        GeofenceAssignments: {
          include: {
            Geofence: {
              include: {
                Shop: true,
              },
            },
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

    // Verify PIN if using PIN method
    if (punchMethod === 'PIN') {
      if (!pin) {
        return NextResponse.json(
          { error: 'PIN is required for PIN punch method' },
          { status: 400 }
        )
      }
      if (!employee.pin || !(await verifyPin(pin, employee.pin))) {
        return NextResponse.json(
          { error: 'Invalid PIN' },
          { status: 401 }
        )
      }
    }

    // Check for existing active punch (for clock-in validation)
    if (type === 'CLOCK_IN') {
      const activePunch = await prisma.punchRecord.findFirst({
        where: {
          employeeId,
          type: 'CLOCK_IN',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { timestamp: 'desc' },
      })

      // Check if there's an unclosed clock-in
      if (activePunch) {
        const hasClockOut = await prisma.punchRecord.findFirst({
          where: {
            employeeId,
            type: 'CLOCK_OUT',
            timestamp: { gt: activePunch.timestamp },
          },
        })

        if (!hasClockOut) {
          return NextResponse.json(
            {
              error: 'Already clocked in',
              message: 'You must clock out before clocking in again',
              lastClockIn: activePunch.timestamp,
            },
            { status: 400 }
          )
        }
      }
    }

    // Check for active punch (for clock-out validation)
    if (type === 'CLOCK_OUT') {
      const lastPunch = await prisma.punchRecord.findFirst({
        where: { employeeId },
        orderBy: { timestamp: 'desc' },
      })

      if (!lastPunch || lastPunch.type !== 'CLOCK_IN') {
        return NextResponse.json(
          {
            error: 'Not clocked in',
            message: 'You must clock in before clocking out',
          },
          { status: 400 }
        )
      }
    }

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
          geofenceId: geofenceResult.geofenceId,
          required: true,
        },
        { status: 403 }
      )
    }

    // Determine timestamp
    const timestamp = isOfflinePunch && offlineTimestamp
      ? new Date(offlineTimestamp)
      : new Date()

    // Get client IP
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown'

    // Create punch record
    const punch = await prisma.punchRecord.create({
      data: {
        employeeId,
        type,
        timestamp,
        latitude,
        longitude,
        accuracy,
        photoUrl,
        geofenceId: geofenceResult.geofenceId,
        shopId: geofenceResult.shopId,
        isWithinGeofence: geofenceResult.isWithin,
        distanceFromGeofence: geofenceResult.distance,
        workOrderId,
        punchMethod,
        deviceInfo,
        ipAddress,
        isOfflinePunch,
        offlineSyncedAt: isOfflinePunch ? new Date() : null,
        notes,
      },
      include: {
        EmployeeProfile: {
          select: {
            id: true,
            name: true,
          },
        },
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
        Geofence: {
          select: {
            id: true,
            name: true,
          },
        },
        WorkOrder: {
          select: {
            id: true,
            description: true,
            Vehicle: {
              select: {
                make: true,
                model: true,
                year: true,
              },
            },
          },
        },
      },
    })

    // Calculate shift duration for clock-out
    let shiftDuration: number | null = null
    if (type === 'CLOCK_OUT') {
      const lastClockIn = await prisma.punchRecord.findFirst({
        where: {
          employeeId,
          type: 'CLOCK_IN',
          timestamp: { lt: timestamp },
        },
        orderBy: { timestamp: 'desc' },
      })

      if (lastClockIn) {
        shiftDuration = Math.round(
          (timestamp.getTime() - lastClockIn.timestamp.getTime()) / 1000 / 60
        ) // in minutes
      }
    }

    return NextResponse.json({
      success: true,
      punch: {
        id: punch.id,
        type: punch.type,
        timestamp: punch.timestamp,
        employee: punch.EmployeeProfile,
        shop: punch.Shop,
        geofence: punch.Geofence,
        workOrder: punch.WorkOrder,
        location: {
          latitude: punch.latitude,
          longitude: punch.longitude,
          accuracy: punch.accuracy,
          isWithinGeofence: punch.isWithinGeofence,
          distanceFromGeofence: punch.distanceFromGeofence,
        },
        isOfflinePunch: punch.isOfflinePunch,
      },
      shiftDuration,
      message: type === 'CLOCK_IN'
        ? `Clocked in at ${punch.Shop?.name || 'shop'}`
        : type === 'CLOCK_OUT'
        ? `Clocked out. Shift duration: ${Math.floor((shiftDuration || 0) / 60)}h ${(shiftDuration || 0) % 60}m`
        : `${type.replace('_', ' ').toLowerCase()} recorded`,
    })
  } catch (error) {
    console.error('Punch error:', error)
    return NextResponse.json(
      { error: 'Failed to record punch' },
      { status: 500 }
    )
  }
}

// Get punch history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) {
        where.timestamp.gte = new Date(startDate)
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate)
      }
    }

    const punches = await prisma.punchRecord.findMany({
      where,
      include: {
        EmployeeProfile: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
        Geofence: {
          select: {
            id: true,
            name: true,
          },
        },
        WorkOrder: {
          select: {
            id: true,
            description: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    return NextResponse.json({ punches })
  } catch (error) {
    console.error('Get punches error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch punches' },
      { status: 500 }
    )
  }
}
