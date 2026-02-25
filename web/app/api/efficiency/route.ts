import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { P } from "@/lib/auth/permissions"
import { withPermission } from "@/lib/auth/with-permission"
import { computeHoursFromPunches, getPeriodRange } from "@/lib/efficiency-utils"

export const GET = withPermission(P.REPORTS_VIEW_OPERATIONAL, async (request, { auth }) => {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"
    const periodStart = getPeriodRange(period)
    const now = new Date()

    // Fetch all active technicians for this tenant
    const technicians = await prisma.employeeProfile.findMany({
      where: {
        tenantId: auth.tenantId,
        status: "active",
        role: { in: ["MECHANIC", "TECHNICIAN", "SENIOR_TECHNICIAN"] },
      },
      select: {
        id: true,
        name: true,
        role: true,
        photoUrl: true,
      },
    })

    const techIds = technicians.map((t) => t.id)

    // Batch-fetch all punch records for these techs in the period
    const allPunches = await prisma.punchRecord.findMany({
      where: {
        employeeId: { in: techIds },
        timestamp: { gte: periodStart },
      },
      orderBy: { timestamp: "asc" },
      select: { employeeId: true, type: true, timestamp: true },
    })

    // Batch-fetch all labor entries for these techs in the period
    const allLabor = await prisma.workOrderLabor.findMany({
      where: {
        employeeId: { in: techIds },
        WorkOrder: { updatedAt: { gte: periodStart } },
      },
      select: { employeeId: true, hours: true, rate: true },
    })

    // Batch-fetch completed jobs count per tech
    const jobCounts = await prisma.workOrder.groupBy({
      by: ["assignedTechnicianId"],
      where: {
        assignedTechnicianId: { in: techIds },
        status: "COMPLETED",
        updatedAt: { gte: periodStart },
      },
      _count: { id: true },
    })
    const jobCountMap = new Map(
      jobCounts.map((j) => [j.assignedTechnicianId, j._count.id])
    )

    // Determine who is currently clocked in (has a CLOCK_IN without a subsequent CLOCK_OUT)
    const lastPunches = await prisma.punchRecord.findMany({
      where: {
        employeeId: { in: techIds },
        type: { in: ["CLOCK_IN", "CLOCK_OUT"] },
      },
      orderBy: { timestamp: "desc" },
      distinct: ["employeeId"],
      select: { employeeId: true, type: true },
    })
    const clockedInSet = new Set(
      lastPunches.filter((p) => p.type === "CLOCK_IN").map((p) => p.employeeId)
    )

    // Group punches and labor by employee
    const punchesByEmployee = new Map<string, typeof allPunches>()
    for (const p of allPunches) {
      const arr = punchesByEmployee.get(p.employeeId) ?? []
      arr.push(p)
      punchesByEmployee.set(p.employeeId, arr)
    }

    const laborByEmployee = new Map<string, typeof allLabor>()
    for (const l of allLabor) {
      const arr = laborByEmployee.get(l.employeeId) ?? []
      arr.push(l)
      laborByEmployee.set(l.employeeId, arr)
    }

    // Build per-technician results
    let totalClockedHours = 0
    let totalBilledHours = 0
    let totalRevenue = 0

    const techResults = technicians.map((tech) => {
      const punches = punchesByEmployee.get(tech.id) ?? []
      const labor = laborByEmployee.get(tech.id) ?? []

      const clockedHours = Math.round(computeHoursFromPunches(punches, now) * 10) / 10
      const billedHours = Math.round(labor.reduce((sum, e) => sum + e.hours, 0) * 10) / 10
      const revenue = Math.round(labor.reduce((sum, e) => sum + e.hours * e.rate, 0) * 100) / 100
      const efficiency = clockedHours > 0 ? Math.round((billedHours / clockedHours) * 100) : 0
      const jobsCompleted = jobCountMap.get(tech.id) ?? 0

      totalClockedHours += clockedHours
      totalBilledHours += billedHours
      totalRevenue += revenue

      return {
        id: tech.id,
        name: tech.name,
        role: tech.role,
        photoUrl: tech.photoUrl,
        clockedHours,
        billedHours,
        efficiency,
        revenue,
        jobsCompleted,
        isClockedIn: clockedInSet.has(tech.id),
      }
    })

    const shopEfficiency =
      totalClockedHours > 0
        ? Math.round((totalBilledHours / totalClockedHours) * 100)
        : 0

    return NextResponse.json({
      period,
      periodStart: periodStart.toISOString(),
      summary: {
        shopEfficiency,
        totalBilledHours: Math.round(totalBilledHours * 10) / 10,
        totalClockedHours: Math.round(totalClockedHours * 10) / 10,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        techCount: technicians.length,
      },
      technicians: techResults,
    })
  } catch (error) {
    console.error("GET /api/efficiency error:", error)
    return NextResponse.json(
      { error: "Failed to fetch efficiency data" },
      { status: 500 }
    )
  }
})
