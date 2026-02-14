import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { WorkOrderStatus } from "@prisma/client"
import crypto from "crypto"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const rangeKey = searchParams.get("range") || "today"

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 })
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const displayToken = await prisma.displayToken.findFirst({
    where: {
      tokenHash,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      shop: true,
    },
  })

  if (!displayToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 })
  }

  const shop = displayToken.shop
  const now = new Date()
  let start: Date

  if (rangeKey === "week") {
    start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
  } else {
    start = new Date(now)
    start.setHours(0, 0, 0, 0)
  }

  // Get employees currently clocked in via PunchRecord
  const shopEmployees = await prisma.shopAssignment.findMany({
    where: { shopId: shop.id },
    select: { employeeId: true },
  })
  const employeeIds = shopEmployees.map((e) => e.employeeId)

  // For each employee, check if their latest punch is CLOCK_IN or BREAK_END
  const clockedIn: Array<{ user_id: string; name: string; duration_minutes: number }> = []
  for (const empId of employeeIds) {
    const lastPunch = await prisma.punchRecord.findFirst({
      where: { employeeId: empId },
      orderBy: { timestamp: "desc" },
      include: { EmployeeProfile: { select: { name: true } } },
    })
    if (lastPunch && (lastPunch.type === "CLOCK_IN" || lastPunch.type === "BREAK_END")) {
      // Find original clock-in for duration
      const clockInPunch = await prisma.punchRecord.findFirst({
        where: { employeeId: empId, type: "CLOCK_IN" },
        orderBy: { timestamp: "desc" },
      })
      const duration = clockInPunch
        ? Math.floor((now.getTime() - clockInPunch.timestamp.getTime()) / 60000)
        : 0
      clockedIn.push({
        user_id: empId,
        name: lastPunch.EmployeeProfile.name,
        duration_minutes: duration,
      })
    }
  }

  const activeOrders = await prisma.workOrder.findMany({
    where: {
      tenantId: shop.tenantId!,
      status: WorkOrderStatus.IN_PROGRESS,
    },
    include: {
      Customer: true,
      Vehicle: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  // Technician leaderboard
  const techs = await prisma.employeeProfile.findMany({
    where: {
      tenantId: shop.tenantId!,
      role: "MECHANIC",
    },
  })

  const leaderboard = await Promise.all(
    techs.map(async (tech) => {
      // Clock hours from PunchRecords
      const punches = await prisma.punchRecord.findMany({
        where: {
          employeeId: tech.id,
          type: "CLOCK_IN",
          timestamp: { gte: start },
        },
      })

      let clockedSeconds = 0
      for (const punch of punches) {
        const clockOut = await prisma.punchRecord.findFirst({
          where: {
            employeeId: tech.id,
            type: "CLOCK_OUT",
            timestamp: { gt: punch.timestamp },
          },
          orderBy: { timestamp: "asc" },
        })
        const end = clockOut?.timestamp || now
        clockedSeconds += Math.max(0, (end.getTime() - punch.timestamp.getTime()) / 1000)
      }

      // Wrench time from TimeEntry
      const wrenchEntries = await prisma.timeEntry.findMany({
        where: {
          employeeId: tech.id,
          clockIn: { gte: start },
        },
      })

      let wrenchSeconds = 0
      for (const entry of wrenchEntries) {
        const end = entry.clockOut || now
        wrenchSeconds += Math.max(0, (end.getTime() - entry.clockIn.getTime()) / 1000)
      }

      // Billed hours from WorkOrderLabor
      const laborEntries = await prisma.workOrderLabor.findMany({
        where: {
          employeeId: tech.id,
          WorkOrder: {
            createdAt: { gte: start },
          },
        },
      })

      const billedHours = laborEntries.reduce(
        (sum, line) => sum + Number(line.hours),
        0
      )

      const clockedHours = Math.round((clockedSeconds / 3600) * 100) / 100
      const wrenchHours = Math.round((wrenchSeconds / 3600) * 100) / 100
      const utilization = clockedHours > 0 ? Math.round((wrenchHours / clockedHours) * 100) / 100 : 0
      const efficiency = wrenchHours > 0 ? Math.round((billedHours / wrenchHours) * 100) / 100 : 0

      return {
        tech_id: tech.id,
        name: tech.name,
        clocked_hours: clockedHours,
        wrench_hours: wrenchHours,
        billed_hours: billedHours,
        utilization,
        efficiency,
      }
    })
  )

  const closedOrders = await prisma.workOrder.findMany({
    where: {
      tenantId: shop.tenantId!,
      status: WorkOrderStatus.COMPLETED,
      actualEnd: { gte: start },
    },
  })

  const durations = closedOrders
    .filter((order) => order.actualStart && order.actualEnd)
    .map((order) => {
      return (order.actualEnd!.getTime() - order.actualStart!.getTime()) / 60000
    })

  const avgMinutes = durations.length > 0
    ? Math.floor(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  return NextResponse.json({
    clocked_in: clockedIn,
    active_orders: {
      count: activeOrders.length,
      top: activeOrders.map((order) => ({
        id: order.id,
        customer__name: order.Customer.displayName,
        unit__vin: order.Vehicle?.vin || null,
        status: order.status,
      })),
    },
    leaderboard,
    throughput: {
      jobs_closed: closedOrders.length,
      average_in_progress_to_closed_minutes: avgMinutes,
    },
  })
}
