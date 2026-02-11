import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Run all queries in parallel for performance
    const [
      currentMonthRevenue,
      lastMonthRevenue,
      activeJobs,
      totalJobs,
      partsOnOrder,
      lowStockParts,
      overdueInvoices,
      technicianStats,
      activeCustomers,
    ] = await Promise.all([
      // Current month revenue (from paid invoices)
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),

      // Last month revenue for comparison
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: { total: true },
      }),

      // Active work orders (in progress)
      prisma.workOrder.count({
        where: {
          status: { in: ['IN_PROGRESS', 'DIAGNOSED', 'APPROVED'] },
        },
      }),

      // Total work orders this month
      prisma.workOrder.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),

      // Parts on order (stock below reorder point)
      prisma.part.count({
        where: {
          stock: { lte: prisma.part.fields.reorderPoint },
          status: 'active',
        },
      }).catch(() =>
        // Fallback if status field doesn't exist
        prisma.part.count({
          where: {
            stock: { lt: 5 }, // Simple fallback
          },
        })
      ),

      // Low stock parts
      prisma.part.findMany({
        where: {
          stock: { lte: 5 },
        },
        select: { id: true, name: true, stock: true, reorderPoint: true },
        take: 10,
      }),

      // Overdue invoices (unpaid, created more than 30 days ago)
      prisma.invoice.findMany({
        where: {
          status: 'UNPAID',
          createdAt: {
            lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true, total: true, createdAt: true },
      }),

      // Technician utilization (employees clocked in today)
      prisma.punchRecord.findMany({
        where: {
          type: 'CLOCK_IN',
          timestamp: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
        select: {
          employeeId: true,
          timestamp: true,
        },
        distinct: ['employeeId'],
      }),

      // Active customers this month (with work orders)
      prisma.customer.count({
        where: {
          Vehicle: {
            some: {
              WorkOrder: {
                some: {
                  createdAt: { gte: startOfMonth },
                },
              },
            },
          },
        },
      }),
    ])

    // Calculate metrics
    const currentRevenue = currentMonthRevenue._sum.total || 0
    const lastRevenue = lastMonthRevenue._sum.total || 0
    const revenueChange = lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : 0

    // Calculate margin (simplified: labor revenue / total revenue)
    const laborRevenue = await prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfMonth },
      },
      _sum: { subtotalLabor: true },
    })
    const laborRev = laborRevenue._sum.subtotalLabor || 0
    const margin = currentRevenue > 0 ? Math.round((laborRev / currentRevenue) * 100) : 0

    // Total technicians
    const totalTechnicians = await prisma.employeeProfile.count({
      where: { status: 'active' },
    })
    const activeTechnicians = technicianStats.length
    const techUtilization = totalTechnicians > 0
      ? Math.round((activeTechnicians / totalTechnicians) * 100)
      : 0

    // Overdue summary
    const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const overdueCount = overdueInvoices.length

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          mtd: currentRevenue,
          change: revenueChange,
          lastMonth: lastRevenue,
        },
        jobs: {
          active: activeJobs,
          total: totalJobs,
        },
        margin: {
          percentage: margin,
          trend: margin > 40 ? 'up' : margin < 30 ? 'down' : 'neutral',
        },
        customers: {
          active: activeCustomers,
        },
        inventory: {
          partsOnOrder: partsOnOrder,
          lowStock: lowStockParts,
        },
        invoices: {
          overdueCount,
          overdueTotal,
          overdue: overdueInvoices,
        },
        technicians: {
          active: activeTechnicians,
          total: totalTechnicians,
          utilization: techUtilization,
        },
      },
    })
  } catch (error) {
    console.error('[Dashboard Metrics Error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}
