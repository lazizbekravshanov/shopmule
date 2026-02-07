import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface BreakStartRequest {
  employeeId: string
  latitude?: number
  longitude?: number
  accuracy?: number
  breakType?: 'LUNCH' | 'REST' | 'OTHER'
  punchMethod?: 'APP' | 'PIN' | 'QR_CODE' | 'FACIAL' | 'MANUAL' | 'KIOSK'
  deviceInfo?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BreakStartRequest = await request.json()
    const {
      employeeId,
      latitude,
      longitude,
      accuracy,
      breakType = 'REST',
      punchMethod = 'APP',
      deviceInfo,
      notes,
    } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required' },
        { status: 400 }
      )
    }

    // Check if clocked in and not already on break
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

    if (lastPunch.type === 'BREAK_START') {
      return NextResponse.json(
        { error: 'Already on break. Please end your current break first.' },
        { status: 400 }
      )
    }

    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') || 'unknown'

    const punch = await prisma.punchRecord.create({
      data: {
        employeeId,
        type: 'BREAK_START',
        timestamp: new Date(),
        latitude,
        longitude,
        accuracy,
        shopId: lastPunch.shopId,
        geofenceId: lastPunch.geofenceId,
        punchMethod,
        deviceInfo,
        ipAddress,
        notes: notes || `${breakType} break started`,
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
        breakType,
      },
      message: `${breakType} break started`,
    })
  } catch (error) {
    console.error('Break start error:', error)
    return NextResponse.json(
      { error: 'Failed to start break' },
      { status: 500 }
    )
  }
}
