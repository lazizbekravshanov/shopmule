import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface ShiftData {
  clockIn: {
    id: string
    timestamp: Date
    latitude: number | null
    longitude: number | null
    isWithinGeofence: boolean | null
    punchMethod: string
    photoUrl: string | null
  }
  clockOut: {
    id: string
    timestamp: Date
    latitude: number | null
    longitude: number | null
    isWithinGeofence: boolean | null
    punchMethod: string
    photoUrl: string | null
  } | null
  breaks: {
    start: Date
    end: Date | null
    durationMinutes: number
  }[]
  totalMinutes: number
  breakMinutes: number
  workMinutes: number
  regularMinutes: number
  overtimeMinutes: number
  shop: { id: string; name: string } | null
  isComplete: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const shopId = searchParams.get('shopId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') // 'today', 'week', 'month', 'pay-period'

    // Calculate date range based on period or explicit dates
    let dateStart: Date
    let dateEnd: Date = new Date()
    dateEnd.setHours(23, 59, 59, 999)

    if (startDate && endDate) {
      dateStart = new Date(startDate)
      dateEnd = new Date(endDate)
      dateEnd.setHours(23, 59, 59, 999)
    } else {
      const now = new Date()
      switch (period) {
        case 'today':
          dateStart = new Date(now)
          dateStart.setHours(0, 0, 0, 0)
          break
        case 'week':
          dateStart = new Date(now)
          dateStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
          dateStart.setHours(0, 0, 0, 0)
          break
        case 'month':
          dateStart = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'pay-period':
          // Assuming bi-weekly pay period starting on a specific date
          // This should be configurable per organization
          const payPeriodStart = new Date(2024, 0, 1) // Jan 1, 2024 as reference
          const daysSinceStart = Math.floor(
            (now.getTime() - payPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
          )
          const currentPeriodStart = daysSinceStart - (daysSinceStart % 14)
          dateStart = new Date(payPeriodStart)
          dateStart.setDate(payPeriodStart.getDate() + currentPeriodStart)
          break
        default:
          // Default to current week
          dateStart = new Date(now)
          dateStart.setDate(now.getDate() - now.getDay())
          dateStart.setHours(0, 0, 0, 0)
      }
    }

    // Build where clause
    const whereClause: Record<string, unknown> = {
      timestamp: {
        gte: dateStart,
        lte: dateEnd,
      },
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    if (shopId) {
      whereClause.shopId = shopId
    }

    // Get all punches in date range
    const punches = await prisma.punchRecord.findMany({
      where: whereClause,
      include: {
        EmployeeProfile: {
          select: {
            id: true,
            name: true,
            role: true,
            photoUrl: true,
          },
        },
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { employeeId: 'asc' },
        { timestamp: 'asc' },
      ],
    })

    // Group punches by employee and calculate shifts
    const employeeTimesheets = new Map<string, {
      employee: {
        id: string
        name: string
        role: string
        photoUrl: string | null
      }
      shifts: ShiftData[]
      summary: {
        totalShifts: number
        totalMinutes: number
        breakMinutes: number
        workMinutes: number
        regularMinutes: number
        overtimeMinutes: number
        averageShiftMinutes: number
      }
    }>()

    // Process punches into shifts
    for (const punch of punches) {
      const empId = punch.employeeId

      if (!employeeTimesheets.has(empId)) {
        employeeTimesheets.set(empId, {
          employee: {
            id: punch.EmployeeProfile.id,
            name: punch.EmployeeProfile.name,
            role: punch.EmployeeProfile.role,
            photoUrl: punch.EmployeeProfile.photoUrl,
          },
          shifts: [],
          summary: {
            totalShifts: 0,
            totalMinutes: 0,
            breakMinutes: 0,
            workMinutes: 0,
            regularMinutes: 0,
            overtimeMinutes: 0,
            averageShiftMinutes: 0,
          },
        })
      }

      const timesheet = employeeTimesheets.get(empId)!

      if (punch.type === 'CLOCK_IN') {
        // Start a new shift
        timesheet.shifts.push({
          clockIn: {
            id: punch.id,
            timestamp: punch.timestamp,
            latitude: punch.latitude,
            longitude: punch.longitude,
            isWithinGeofence: punch.isWithinGeofence,
            punchMethod: punch.punchMethod,
            photoUrl: punch.photoUrl,
          },
          clockOut: null,
          breaks: [],
          totalMinutes: 0,
          breakMinutes: 0,
          workMinutes: 0,
          regularMinutes: 0,
          overtimeMinutes: 0,
          shop: punch.Shop,
          isComplete: false,
        })
      } else if (punch.type === 'CLOCK_OUT' && timesheet.shifts.length > 0) {
        const currentShift = timesheet.shifts[timesheet.shifts.length - 1]
        if (!currentShift.isComplete) {
          currentShift.clockOut = {
            id: punch.id,
            timestamp: punch.timestamp,
            latitude: punch.latitude,
            longitude: punch.longitude,
            isWithinGeofence: punch.isWithinGeofence,
            punchMethod: punch.punchMethod,
            photoUrl: punch.photoUrl,
          }
          currentShift.isComplete = true

          // Calculate shift duration
          const shiftMs = punch.timestamp.getTime() - currentShift.clockIn.timestamp.getTime()
          currentShift.totalMinutes = Math.floor(shiftMs / 1000 / 60)

          // Calculate break duration
          let breakMs = 0
          for (const brk of currentShift.breaks) {
            if (brk.end) {
              breakMs += brk.end.getTime() - brk.start.getTime()
            }
          }
          currentShift.breakMinutes = Math.floor(breakMs / 1000 / 60)
          currentShift.workMinutes = currentShift.totalMinutes - currentShift.breakMinutes

          // Calculate overtime (assuming 8-hour day threshold)
          const dailyOvertimeThreshold = 8 * 60 // 480 minutes
          if (currentShift.workMinutes > dailyOvertimeThreshold) {
            currentShift.regularMinutes = dailyOvertimeThreshold
            currentShift.overtimeMinutes = currentShift.workMinutes - dailyOvertimeThreshold
          } else {
            currentShift.regularMinutes = currentShift.workMinutes
            currentShift.overtimeMinutes = 0
          }
        }
      } else if (punch.type === 'BREAK_START' && timesheet.shifts.length > 0) {
        const currentShift = timesheet.shifts[timesheet.shifts.length - 1]
        if (!currentShift.isComplete) {
          currentShift.breaks.push({
            start: punch.timestamp,
            end: null,
            durationMinutes: 0,
          })
        }
      } else if (punch.type === 'BREAK_END' && timesheet.shifts.length > 0) {
        const currentShift = timesheet.shifts[timesheet.shifts.length - 1]
        const lastBreak = currentShift.breaks[currentShift.breaks.length - 1]
        if (lastBreak && !lastBreak.end) {
          lastBreak.end = punch.timestamp
          lastBreak.durationMinutes = Math.floor(
            (punch.timestamp.getTime() - lastBreak.start.getTime()) / 1000 / 60
          )
        }
      }
    }

    // Calculate summaries
    const timesheets = Array.from(employeeTimesheets.values()).map((ts) => {
      ts.summary.totalShifts = ts.shifts.filter(s => s.isComplete).length
      ts.summary.totalMinutes = ts.shifts.reduce((sum, s) => sum + s.totalMinutes, 0)
      ts.summary.breakMinutes = ts.shifts.reduce((sum, s) => sum + s.breakMinutes, 0)
      ts.summary.workMinutes = ts.shifts.reduce((sum, s) => sum + s.workMinutes, 0)
      ts.summary.regularMinutes = ts.shifts.reduce((sum, s) => sum + s.regularMinutes, 0)
      ts.summary.overtimeMinutes = ts.shifts.reduce((sum, s) => sum + s.overtimeMinutes, 0)
      ts.summary.averageShiftMinutes = ts.summary.totalShifts > 0
        ? Math.round(ts.summary.workMinutes / ts.summary.totalShifts)
        : 0

      return ts
    })

    // Calculate overall totals
    const totals = {
      totalEmployees: timesheets.length,
      totalShifts: timesheets.reduce((sum, ts) => sum + ts.summary.totalShifts, 0),
      totalMinutes: timesheets.reduce((sum, ts) => sum + ts.summary.totalMinutes, 0),
      breakMinutes: timesheets.reduce((sum, ts) => sum + ts.summary.breakMinutes, 0),
      workMinutes: timesheets.reduce((sum, ts) => sum + ts.summary.workMinutes, 0),
      regularMinutes: timesheets.reduce((sum, ts) => sum + ts.summary.regularMinutes, 0),
      overtimeMinutes: timesheets.reduce((sum, ts) => sum + ts.summary.overtimeMinutes, 0),
    }

    return NextResponse.json({
      period: {
        start: dateStart,
        end: dateEnd,
        label: period || 'custom',
      },
      timesheets,
      totals,
    })
  } catch (error) {
    console.error('Get timesheets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timesheets' },
      { status: 500 }
    )
  }
}
