import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { RepairOrderStatus } from "@prisma/client"
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

  const openPunches = await prisma.shiftPunch.findMany({
    where: {
      shopId: shop.id,
      clockOutAt: null,
    },
    include: {
      user: true,
    },
  })

  const clockedIn = openPunches.map((punch) => {
    const duration = Math.floor((now.getTime() - punch.clockInAt.getTime()) / 60000)
    return {
      user_id: punch.userId,
      name: punch.user.name || punch.user.email,
      duration_minutes: duration,
    }
  })

  const activeOrders = await prisma.repairOrder.findMany({
    where: {
      shopId: shop.id,
      status: RepairOrderStatus.IN_PROGRESS,
    },
    include: {
      customer: true,
      vehicle: true,
    },
    orderBy: { openedAt: "desc" },
    take: 10,
  })

  const techs = await prisma.user.findMany({
    where: {
      shopId: shop.id,
      role: "TECH",
    },
  })

  const leaderboard = await Promise.all(
    techs.map(async (tech) => {
      const clockedPunches = await prisma.shiftPunch.findMany({
        where: {
          shopId: shop.id,
          userId: tech.id,
          clockInAt: {
            gte: start,
          },
        },
      })

      let clockedSeconds = 0
      for (const punch of clockedPunches) {
        const end = punch.clockOutAt || now
        clockedSeconds += Math.max(0, (end.getTime() - punch.clockInAt.getTime()) / 1000)
      }

      const wrenchEntries = await prisma.timeEntry.findMany({
        where: {
          shopId: shop.id,
          techId: tech.id,
          clockIn: {
            gte: start,
          },
        },
      })

      let wrenchSeconds = 0
      for (const entry of wrenchEntries) {
        const end = entry.clockOut || now
        wrenchSeconds += Math.max(0, (end.getTime() - entry.clockIn.getTime()) / 1000)
      }

      const laborLines = await prisma.laborLine.findMany({
        where: {
          shopId: shop.id,
          techId: tech.id,
          repairOrder: {
            openedAt: {
              gte: start,
            },
          },
        },
      })

      const billedHours = laborLines.reduce(
        (sum, line) => sum + Number(line.billedHours),
        0
      )

      const clockedHours = Math.round((clockedSeconds / 3600) * 100) / 100
      const wrenchHours = Math.round((wrenchSeconds / 3600) * 100) / 100
      const utilization = clockedHours > 0 ? Math.round((wrenchHours / clockedHours) * 100) / 100 : 0
      const efficiency = wrenchHours > 0 ? Math.round((billedHours / wrenchHours) * 100) / 100 : 0

      return {
        tech_id: tech.id,
        name: tech.name || tech.email,
        clocked_hours: clockedHours,
        wrench_hours: wrenchHours,
        billed_hours: billedHours,
        utilization,
        efficiency,
      }
    })
  )

  const closedOrders = await prisma.repairOrder.findMany({
    where: {
      shopId: shop.id,
      closedAt: {
        gte: start,
      },
    },
  })

  const durations = closedOrders
    .filter((order) => order.inProgressAt && order.closedAt)
    .map((order) => {
      return (order.closedAt!.getTime() - order.inProgressAt!.getTime()) / 60000
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
        customer__name: order.customer.name,
        unit__vin: order.vehicle?.vin || null,
        status: order.status,
      })),
    },
    leaderboard,
    throughput: {
      jobs_closed: closedOrders.length,
      average_in_progress_to_closed_minutes: avgMinutes,
      comebacks: closedOrders.filter((o) => o.isComeback).length,
    },
  })
}
