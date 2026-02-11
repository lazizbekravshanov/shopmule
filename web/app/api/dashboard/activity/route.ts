import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface ActivityItem {
  id: string
  type: 'work_order' | 'invoice' | 'payment' | 'customer' | 'technician'
  action: string
  title: string
  description: string
  timestamp: Date
  href?: string
  icon?: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch recent activities from multiple sources in parallel
    const [
      recentWorkOrders,
      recentInvoices,
      recentPayments,
      recentCustomers,
      recentPunchRecords,
    ] = await Promise.all([
      // Recent work orders (created or updated)
      prisma.workOrder.findMany({
        where: {
          OR: [
            { createdAt: { gte: last24Hours } },
            { updatedAt: { gte: last24Hours } },
          ],
        },
        include: {
          Vehicle: {
            include: {
              Customer: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 15,
      }),

      // Recent invoices
      prisma.invoice.findMany({
        where: {
          OR: [
            { createdAt: { gte: last24Hours } },
            { updatedAt: { gte: last24Hours } },
          ],
        },
        include: {
          Customer: true,
          WorkOrder: {
            include: {
              Vehicle: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),

      // Recent payments
      prisma.payment.findMany({
        where: {
          receivedAt: { gte: last7Days },
        },
        include: {
          Invoice: {
            include: {
              Customer: true,
            },
          },
        },
        orderBy: { receivedAt: 'desc' },
        take: 10,
      }),

      // Recent customers
      prisma.customer.findMany({
        where: {
          createdAt: { gte: last7Days },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Recent clock in/out
      prisma.punchRecord.findMany({
        where: {
          timestamp: { gte: last24Hours },
          type: { in: ['CLOCK_IN', 'CLOCK_OUT'] },
        },
        include: {
          EmployeeProfile: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ])

    // Build activity feed
    const activities: ActivityItem[] = []

    // Process work orders
    for (const wo of recentWorkOrders) {
      const customerName = wo.Vehicle?.Customer?.name || 'Unknown Customer'
      const vehicleInfo = wo.Vehicle
        ? `${wo.Vehicle.year || ''} ${wo.Vehicle.make || ''} ${wo.Vehicle.model || ''}`.trim()
        : 'Unknown Vehicle'

      // Check if this was just created or status changed
      const isNew = wo.createdAt.getTime() === wo.updatedAt.getTime()

      activities.push({
        id: `wo-${wo.id}`,
        type: 'work_order',
        action: isNew ? 'created' : 'updated',
        title: isNew ? 'Work order created' : `Work order ${wo.status.toLowerCase().replace('_', ' ')}`,
        description: `${customerName} - ${vehicleInfo}`,
        timestamp: wo.updatedAt,
        href: `/work-orders/${wo.id}`,
        icon: wo.status === 'COMPLETED' ? 'check-circle' : 'wrench',
      })
    }

    // Process invoices
    for (const inv of recentInvoices) {
      const customerName = inv.Customer?.name || 'Unknown Customer'
      const isNew = inv.createdAt.getTime() === inv.updatedAt.getTime()

      activities.push({
        id: `inv-${inv.id}`,
        type: 'invoice',
        action: isNew ? 'created' : inv.status === 'PAID' ? 'paid' : 'updated',
        title: isNew
          ? 'Invoice created'
          : inv.status === 'PAID'
            ? 'Invoice paid'
            : 'Invoice updated',
        description: `${customerName} - $${inv.total.toLocaleString()}`,
        timestamp: inv.updatedAt,
        href: `/invoices/${inv.id}`,
        icon: inv.status === 'PAID' ? 'dollar-sign' : 'file-text',
      })
    }

    // Process payments
    for (const payment of recentPayments) {
      const customerName = payment.Invoice?.Customer?.name || 'Unknown Customer'

      activities.push({
        id: `pay-${payment.id}`,
        type: 'payment',
        action: 'received',
        title: 'Payment received',
        description: `${customerName} - $${payment.amount.toLocaleString()} via ${payment.method}`,
        timestamp: payment.receivedAt,
        href: `/invoices/${payment.invoiceId}`,
        icon: 'credit-card',
      })
    }

    // Process new customers
    for (const customer of recentCustomers) {
      activities.push({
        id: `cust-${customer.id}`,
        type: 'customer',
        action: 'created',
        title: 'New customer added',
        description: customer.name,
        timestamp: customer.createdAt,
        href: `/customers?id=${customer.id}`,
        icon: 'user-plus',
      })
    }

    // Process clock in/out
    for (const punch of recentPunchRecords) {
      const techName = punch.EmployeeProfile?.name || 'Unknown'
      const isClockIn = punch.type === 'CLOCK_IN'

      activities.push({
        id: `punch-${punch.id}`,
        type: 'technician',
        action: isClockIn ? 'clock_in' : 'clock_out',
        title: isClockIn ? 'Technician clocked in' : 'Technician clocked out',
        description: techName,
        timestamp: punch.timestamp,
        href: '/technicians',
        icon: isClockIn ? 'log-in' : 'log-out',
      })
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return NextResponse.json({
      success: true,
      data: activities.slice(0, 20), // Return top 20 activities
    })
  } catch (error) {
    console.error('[Dashboard Activity Error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity feed' },
      { status: 500 }
    )
  }
}
