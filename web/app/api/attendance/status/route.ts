import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required' },
        { status: 400 }
      )
    }

    // Get the last punch for this employee
    const lastPunch = await prisma.punchRecord.findFirst({
      where: { employeeId },
      orderBy: { timestamp: 'desc' },
      include: {
        Shop: {
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

    if (!lastPunch) {
      return NextResponse.json({
        status: 'CLOCKED_OUT',
        isClockedIn: false,
        isOnBreak: false,
        lastPunch: null,
        currentShift: null,
      })
    }

    const isClockedIn = lastPunch.type === 'CLOCK_IN' || lastPunch.type === 'BREAK_END'
    const isOnBreak = lastPunch.type === 'BREAK_START'

    // If clocked in, get the clock-in punch for this shift
    let currentShift = null
    if (isClockedIn || isOnBreak) {
      // Find the last CLOCK_IN
      const clockInPunch = await prisma.punchRecord.findFirst({
        where: {
          employeeId,
          type: 'CLOCK_IN',
        },
        orderBy: { timestamp: 'desc' },
        include: {
          Shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (clockInPunch) {
        const now = new Date()
        const shiftStart = clockInPunch.timestamp
        const elapsedMs = now.getTime() - shiftStart.getTime()
        const elapsedMinutes = Math.floor(elapsedMs / 1000 / 60)

        // Calculate break time during this shift
        const breakPunches = await prisma.punchRecord.findMany({
          where: {
            employeeId,
            timestamp: { gte: shiftStart },
            type: { in: ['BREAK_START', 'BREAK_END'] },
          },
          orderBy: { timestamp: 'asc' },
        })

        let breakMinutes = 0
        let breakStart: Date | null = null
        for (const punch of breakPunches) {
          if (punch.type === 'BREAK_START') {
            breakStart = punch.timestamp
          } else if (punch.type === 'BREAK_END' && breakStart) {
            breakMinutes += Math.floor(
              (punch.timestamp.getTime() - breakStart.getTime()) / 1000 / 60
            )
            breakStart = null
          }
        }

        // If currently on break, add ongoing break time
        if (isOnBreak && breakStart) {
          breakMinutes += Math.floor(
            (now.getTime() - breakStart.getTime()) / 1000 / 60
          )
        }

        const workMinutes = elapsedMinutes - breakMinutes

        currentShift = {
          clockInTime: shiftStart,
          shop: clockInPunch.Shop,
          elapsedMinutes,
          breakMinutes,
          workMinutes,
          elapsedFormatted: `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`,
          workFormatted: `${Math.floor(workMinutes / 60)}h ${workMinutes % 60}m`,
          breakFormatted: `${Math.floor(breakMinutes / 60)}h ${breakMinutes % 60}m`,
        }
      }
    }

    // Get today's punches for context
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayPunches = await prisma.punchRecord.findMany({
      where: {
        employeeId,
        timestamp: { gte: today },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        type: true,
        timestamp: true,
        latitude: true,
        longitude: true,
        isWithinGeofence: true,
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      status: isOnBreak ? 'ON_BREAK' : isClockedIn ? 'CLOCKED_IN' : 'CLOCKED_OUT',
      isClockedIn,
      isOnBreak,
      lastPunch: {
        id: lastPunch.id,
        type: lastPunch.type,
        timestamp: lastPunch.timestamp,
        shop: lastPunch.Shop,
        workOrder: lastPunch.WorkOrder,
        location: {
          latitude: lastPunch.latitude,
          longitude: lastPunch.longitude,
        },
      },
      currentShift,
      todayPunches,
    })
  } catch (error) {
    console.error('Get status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}
