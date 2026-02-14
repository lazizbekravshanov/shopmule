import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    // Get all employees with their latest punch
    const employees = await prisma.employeeProfile.findMany({
      where: shopId ? {
        ShopAssignments: {
          some: { shopId },
        },
      } : undefined,
      include: {
        ShopAssignments: {
          include: {
            Shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Get the latest punch for each employee
    const employeeStatuses = await Promise.all(
      employees.map(async (employee) => {
        const lastPunch = await prisma.punchRecord.findFirst({
          where: { employeeId: employee.id },
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

        const isClockedIn = lastPunch &&
          (lastPunch.type === 'CLOCK_IN' || lastPunch.type === 'BREAK_END')
        const isOnBreak = lastPunch && lastPunch.type === 'BREAK_START'

        let shiftDuration = null
        let clockInTime = null

        if (isClockedIn || isOnBreak) {
          // Find the clock-in for current shift
          const clockInPunch = await prisma.punchRecord.findFirst({
            where: {
              employeeId: employee.id,
              type: 'CLOCK_IN',
            },
            orderBy: { timestamp: 'desc' },
          })

          if (clockInPunch) {
            clockInTime = clockInPunch.timestamp
            const now = new Date()
            const elapsedMs = now.getTime() - clockInPunch.timestamp.getTime()
            const elapsedMinutes = Math.floor(elapsedMs / 1000 / 60)
            const hours = Math.floor(elapsedMinutes / 60)
            const minutes = elapsedMinutes % 60

            shiftDuration = {
              minutes: elapsedMinutes,
              formatted: `${hours}h ${minutes}m`,
            }
          }
        }

        return {
          employee: {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            photoUrl: employee.photoUrl,
            shops: employee.ShopAssignments.map((sa) => sa.Shop),
          },
          status: isOnBreak ? 'ON_BREAK' : isClockedIn ? 'CLOCKED_IN' : 'CLOCKED_OUT',
          isClockedIn: isClockedIn || false,
          isOnBreak: isOnBreak || false,
          lastPunch: lastPunch ? {
            type: lastPunch.type,
            timestamp: lastPunch.timestamp,
            shop: lastPunch.Shop,
            location: {
              latitude: lastPunch.latitude,
              longitude: lastPunch.longitude,
              isWithinGeofence: lastPunch.isWithinGeofence,
            },
          } : null,
          currentShift: (isClockedIn || isOnBreak) ? {
            clockInTime,
            duration: shiftDuration,
            shop: lastPunch?.Shop,
          } : null,
        }
      })
    )

    // Separate into active and inactive
    const clockedIn = employeeStatuses.filter((e) => e.isClockedIn && !e.isOnBreak)
    const onBreak = employeeStatuses.filter((e) => e.isOnBreak)
    const clockedOut = employeeStatuses.filter((e) => !e.isClockedIn && !e.isOnBreak)

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayPunches = await prisma.punchRecord.groupBy({
      by: ['employeeId'],
      where: {
        timestamp: { gte: today },
        type: 'CLOCK_IN',
      },
    })

    return NextResponse.json({
      summary: {
        totalEmployees: employees.length,
        clockedIn: clockedIn.length,
        onBreak: onBreak.length,
        clockedOut: clockedOut.length,
        workedToday: todayPunches.length,
      },
      employees: {
        clockedIn,
        onBreak,
        clockedOut,
      },
      lastUpdated: new Date(),
    })
  } catch (error) {
    console.error('Get whos working error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch working status' },
      { status: 500 }
    )
  }
}
