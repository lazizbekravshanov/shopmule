import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/auth/with-permission"

export const dynamic = "force-dynamic"

interface Insight {
  id: string
  type: "opportunity" | "warning" | "success" | "tip"
  title: string
  description: string
  metric?: string
  trend?: "up" | "down"
  action?: { label: string; href: string }
  priority: number
}

export const GET = withAuth(async (_request, { auth }) => {
  const tenantId = auth.tenantId
  const insights: Insight[] = []
  let priority = 1

  const now = new Date()
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // 1. Aging work orders (> 48h in non-terminal status)
  const agingOrders = await prisma.workOrder.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ["DRAFT", "DIAGNOSED", "APPROVED"] },
      createdAt: { lt: fortyEightHoursAgo },
    },
    select: { id: true, workOrderNumber: true, status: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 10,
  })

  if (agingOrders.length > 0) {
    const orderNums = agingOrders
      .slice(0, 3)
      .map((o) => o.workOrderNumber)
      .join(", ")
    insights.push({
      id: "aging-orders",
      type: "warning",
      title: `${agingOrders.length} work order${agingOrders.length > 1 ? "s" : ""} aging`,
      description: `${orderNums}${agingOrders.length > 3 ? ` and ${agingOrders.length - 3} more` : ""} pending over 48 hours. Customer satisfaction at risk.`,
      action: { label: "View orders", href: "/work-orders?filter=aging" },
      priority: priority++,
    })
  }

  // 2. Low stock parts (below reorder point)
  // Raw query needed because Prisma can't compare two columns (qtyOnHand <= reorderPoint)
  const lowStockCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint as count
    FROM "Part"
    WHERE "tenantId" = ${tenantId}
      AND "deletedAt" IS NULL
      AND status = 'ACTIVE'
      AND "qtyOnHand" <= "reorderPoint"
  `
  const lowStockNum = Number(lowStockCount[0]?.count || 0)

  if (lowStockNum > 0) {
    insights.push({
      id: "low-stock",
      type: "warning",
      title: `${lowStockNum} part${lowStockNum > 1 ? "s" : ""} below reorder point`,
      description: `Inventory items are running low and may cause delays on upcoming jobs.`,
      action: { label: "Review inventory", href: "/inventory?filter=low-stock" },
      priority: priority++,
    })
  }

  // 3. Revenue trend (this week vs last week)
  const thisWeekRevenue = await prisma.workOrder.aggregate({
    where: {
      tenantId,
      deletedAt: null,
      status: "COMPLETED",
      actualEnd: { gte: sevenDaysAgo },
    },
    _sum: { grandTotal: true },
    _count: { id: true },
  })

  const lastWeekRevenue = await prisma.workOrder.aggregate({
    where: {
      tenantId,
      deletedAt: null,
      status: "COMPLETED",
      actualEnd: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
    },
    _sum: { grandTotal: true },
    _count: { id: true },
  })

  const thisWeek = thisWeekRevenue._sum.grandTotal || 0
  const lastWeek = lastWeekRevenue._sum.grandTotal || 0

  if (lastWeek > 0) {
    const change = ((thisWeek - lastWeek) / lastWeek) * 100
    const absChange = Math.abs(Math.round(change))

    if (change > 10) {
      insights.push({
        id: "revenue-up",
        type: "success",
        title: "Revenue trending up",
        description: `This week's completed work is up ${absChange}% compared to last week.`,
        metric: `+${absChange}%`,
        trend: "up",
        action: { label: "View reports", href: "/reports" },
        priority: priority++,
      })
    } else if (change < -10) {
      insights.push({
        id: "revenue-down",
        type: "warning",
        title: "Revenue trending down",
        description: `This week's completed work is down ${absChange}% compared to last week.`,
        metric: `-${absChange}%`,
        trend: "down",
        action: { label: "View reports", href: "/reports" },
        priority: priority++,
      })
    }
  }

  // 4. Work orders without AI diagnosis (opportunity to use AI)
  const undiagnosedOrders = await prisma.workOrder.count({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ["DRAFT", "DIAGNOSED"] },
      aiDiagnosis: { equals: Prisma.DbNull },
      customerComplaint: { not: null },
    },
  })

  if (undiagnosedOrders > 0) {
    insights.push({
      id: "ai-opportunity",
      type: "opportunity",
      title: `${undiagnosedOrders} order${undiagnosedOrders > 1 ? "s" : ""} could use AI diagnosis`,
      description: `These work orders have customer complaints but no AI analysis. Run AI to speed up diagnosis.`,
      action: { label: "View work orders", href: "/work-orders" },
      priority: priority++,
    })
  }

  // 5. Completed orders this week (success metric)
  const completedThisWeek = thisWeekRevenue._count.id || 0
  if (completedThisWeek > 0) {
    insights.push({
      id: "completed-week",
      type: "success",
      title: `${completedThisWeek} job${completedThisWeek > 1 ? "s" : ""} completed this week`,
      description: `$${thisWeek.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} in completed work.`,
      metric: `$${thisWeek >= 1000 ? `${(thisWeek / 1000).toFixed(1)}k` : thisWeek.toFixed(0)}`,
      trend: "up",
      priority: priority++,
    })
  }

  // 6. Parts waiting on work orders
  const partsWaitingCount = await prisma.workOrder.count({
    where: {
      tenantId,
      deletedAt: null,
      partsStatus: "WAITING",
      status: { notIn: ["COMPLETED", "INVOICED"] },
    },
  })

  if (partsWaitingCount > 0) {
    insights.push({
      id: "parts-waiting",
      type: "tip",
      title: `${partsWaitingCount} job${partsWaitingCount > 1 ? "s" : ""} waiting on parts`,
      description: `Check with suppliers to expedite and keep jobs moving.`,
      action: { label: "View orders", href: "/work-orders?partsStatus=WAITING" },
      priority: priority++,
    })
  }

  // Sort by priority
  insights.sort((a, b) => a.priority - b.priority)

  return NextResponse.json({ data: insights })
})
