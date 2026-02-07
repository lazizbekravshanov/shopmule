import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface BreakEndRequest {
  employeeId: string
  latitude?: number
  longitude?: number
  accuracy?: number
  punchMethod?: 'APP' | 'PIN' | 'QR_CODE' | 'FACIAL' | 'MANUAL' | 'KIOSK'
  deviceInfo?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BreakEndRequest = await request.json()
    const {
      employeeId,
      latitude,
      longitude,
      accuracy,
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

    // Check if on break
    const lastPunch = await prisma.punchRecord.findFirst({
      where: { employeeId },
      orderBy: { timestamp: 'desc' },
    })

    if (!lastPunch || lastPunch.type !== 'BREAK_START') {
      return NextResponse.json(
        { error: 'Not on break. Please start a break first.' },
        { status: 400 }
      )
    }

    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') || 'unknown'

    const timestamp = new Date()

    const punch = await prisma.punchRecord.create({
      data: {
        employeeId,
        type: 'BREAK_END',
        timestamp,
        latitude,
        longitude,
        accuracy,
        shopId: lastPunch.shopId,
        geofenceId: lastPunch.geofenceId,
        punchMethod,
        deviceInfo,
        ipAddress,
        notes,
      },
      include: {
        EmployeeProfile: { select: { id: true, name: true } },
        Shop: { select: { id: true, name: true } },
      },
    })

    // Calculate break duration
    const breakDurationMs = timestamp.getTime() - lastPunch.timestamp.getTime()
    const breakMinutes = Math.floor(breakDurationMs / 1000 / 60)
    const hours = Math.floor(breakMinutes / 60)
    const minutes = breakMinutes % 60

    return NextResponse.json({
      success: true,
      punch: {
        id: punch.id,
        type: punch.type,
        timestamp: punch.timestamp,
        employee: punch.EmployeeProfile,
        shop: punch.Shop,
      },
      breakSummary: {
        startTime: lastPunch.timestamp,
        endTime: timestamp,
        durationMinutes: breakMinutes,
        formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      },
      message: `Break ended. Duration: ${hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}`,
    })
  } catch (error) {
    console.error('Break end error:', error)
    return NextResponse.json(
      { error: 'Failed to end break' },
      { status: 500 }
    )
  }
}
