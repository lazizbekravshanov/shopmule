import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"
import { isValidId } from "@/lib/security"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated || !authResult.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = authResult.tenantId
    const { id } = await params

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const employee = await prisma.employeeProfile.findUnique({ where: { id } })
    if (!employee || employee.tenantId !== tenantId) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"

    const now = new Date()
    let periodStart: Date

    switch (period) {
      case "week": {
        periodStart = new Date(now)
        periodStart.setDate(periodStart.getDate() - periodStart.getDay())
        periodStart.setHours(0, 0, 0, 0)
        break
      }
      case "quarter": {
        const quarter = Math.floor(now.getMonth() / 3)
        periodStart = new Date(now.getFullYear(), quarter * 3, 1)
        break
      }
      case "year": {
        periodStart = new Date(now.getFullYear(), 0, 1)
        break
      }
      default: {
        // month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      }
    }

    // Total work hours from PunchRecords
    const punchRecords = await prisma.punchRecord.findMany({
      where: { employeeId: id, timestamp: { gte: periodStart } },
      orderBy: { timestamp: "asc" },
    })

    const totalWorkHours = computeHoursFromPunches(punchRecords, now)

    // Billable hours from WorkOrderLabor
    const laborEntries = await prisma.workOrderLabor.findMany({
      where: {
        employeeId: id,
        WorkOrder: { updatedAt: { gte: periodStart } },
      },
      select: { hours: true, rate: true },
    })
    const billableHours = laborEntries.reduce((sum, e) => sum + e.hours, 0)
    const revenueGenerated = laborEntries.reduce((sum, e) => sum + e.hours * e.rate, 0)

    // Jobs completed
    const jobsCompleted = await prisma.workOrder.count({
      where: {
        assignedTechnicianId: id,
        status: "COMPLETED",
        updatedAt: { gte: periodStart },
      },
    })

    // Average job time
    const completedWOs = await prisma.workOrder.findMany({
      where: {
        assignedTechnicianId: id,
        status: "COMPLETED",
        updatedAt: { gte: periodStart },
        actualStart: { not: null },
        actualEnd: { not: null },
      },
      select: { actualStart: true, actualEnd: true },
    })
    const avgJobTimeHours = completedWOs.length > 0
      ? completedWOs.reduce((sum, wo) => {
          const start = wo.actualStart!.getTime()
          const end = wo.actualEnd!.getTime()
          return sum + (end - start) / (1000 * 60 * 60)
        }, 0) / completedWOs.length
      : 0

    const billableEfficiency = totalWorkHours > 0
      ? Math.round((billableHours / totalWorkHours) * 100)
      : 0

    // Overtime (hours above 40/week or 8/day threshold)
    const overtimeHours = Math.max(0, totalWorkHours - (period === "week" ? 40 : 0))

    // Daily breakdown for charting
    const dailyBreakdown = buildDailyBreakdown(punchRecords, periodStart, now)

    return NextResponse.json({
      period,
      periodStart: periodStart.toISOString(),
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
      billableHours: Math.round(billableHours * 10) / 10,
      billableEfficiency,
      jobsCompleted,
      avgJobTime: Math.round(avgJobTimeHours * 10) / 10,
      revenueGenerated: Math.round(revenueGenerated * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      dailyBreakdown,
    })
  } catch (error) {
    console.error("GET /api/employees/[id]/performance error:", error)
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    )
  }
}

function computeHoursFromPunches(
  punches: { type: string; timestamp: Date }[],
  now: Date
): number {
  let totalMs = 0
  let clockInTime: Date | null = null

  for (const punch of punches) {
    if (punch.type === "CLOCK_IN") {
      clockInTime = punch.timestamp
    } else if (punch.type === "CLOCK_OUT" && clockInTime) {
      totalMs += punch.timestamp.getTime() - clockInTime.getTime()
      clockInTime = null
    }
  }

  if (clockInTime) {
    totalMs += now.getTime() - clockInTime.getTime()
  }

  return totalMs / (1000 * 60 * 60)
}

function buildDailyBreakdown(
  punches: { type: string; timestamp: Date }[],
  periodStart: Date,
  now: Date
): { date: string; hours: number }[] {
  const days: { date: string; hours: number }[] = []
  const current = new Date(periodStart)

  while (current <= now) {
    const dayStart = new Date(current)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(current)
    dayEnd.setHours(23, 59, 59, 999)

    const dayPunches = punches.filter(
      (p) => p.timestamp >= dayStart && p.timestamp <= dayEnd
    )
    const hours = computeHoursFromPunches(dayPunches, dayEnd < now ? dayEnd : now)

    days.push({
      date: dayStart.toISOString().split("T")[0],
      hours: Math.round(hours * 10) / 10,
    })

    current.setDate(current.getDate() + 1)
  }

  return days
}
