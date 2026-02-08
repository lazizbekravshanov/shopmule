import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { WorkOrderStatus, PaymentStatus } from '@prisma/client';

interface SmartAction {
  id: string;
  type: string;
  label: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  href: string;
  badge?: string;
  metadata?: Record<string, unknown>;
}

export async function GET() {
  try {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const actions: SmartAction[] = [];

    // 1. Pending estimates over 48 hours
    const pendingEstimates = await prisma.workOrder.count({
      where: {
        status: WorkOrderStatus.DIAGNOSED,
        createdAt: {
          lt: fortyEightHoursAgo,
        },
      },
    });

    if (pendingEstimates > 0) {
      actions.push({
        id: 'pending-estimates',
        type: 'estimates',
        label: 'Follow up on estimates',
        description: `${pendingEstimates} estimate${pendingEstimates > 1 ? 's' : ''} pending over 48hrs`,
        urgency: 'high',
        href: '/work-orders?status=DIAGNOSED',
        badge: String(pendingEstimates),
      });
    }

    // 2. Low stock items
    const lowStockItems = await prisma.part.count({
      where: {
        stock: {
          lte: prisma.part.fields.reorderPoint,
        },
      },
    });

    // Fallback query if the above doesn't work due to Prisma limitations
    const lowStockCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "Part" WHERE stock <= "reorderPoint"
    `;
    const actualLowStock = Number(lowStockCount[0]?.count || 0);

    if (actualLowStock > 0) {
      actions.push({
        id: 'low-stock',
        type: 'inventory',
        label: 'Reorder parts',
        description: `${actualLowStock} item${actualLowStock > 1 ? 's' : ''} below reorder point`,
        urgency: 'high',
        href: '/inventory?filter=low-stock',
        badge: String(actualLowStock),
      });
    }

    // 3. Completed work orders without invoices
    const completedWithoutInvoice = await prisma.workOrder.findMany({
      where: {
        status: WorkOrderStatus.COMPLETED,
        Invoice: null,
      },
      include: {
        Vehicle: {
          include: {
            Customer: true,
          },
        },
      },
      take: 5,
    });

    if (completedWithoutInvoice.length > 0) {
      const wo = completedWithoutInvoice[0];
      actions.push({
        id: 'create-invoice',
        type: 'invoice',
        label: 'Create invoice',
        description: `${wo.Vehicle.make} ${wo.Vehicle.model} - ${wo.Vehicle.Customer?.name || 'Unknown'}`,
        urgency: 'medium',
        href: `/work-orders/${wo.id}`,
        badge: completedWithoutInvoice.length > 1 ? String(completedWithoutInvoice.length) : undefined,
      });
    }

    // 4. Overdue invoices
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const overdueInvoices = await prisma.invoice.count({
      where: {
        status: {
          in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL],
        },
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    if (overdueInvoices > 0) {
      actions.push({
        id: 'overdue-invoices',
        type: 'collections',
        label: 'Collect overdue payments',
        description: `${overdueInvoices} invoice${overdueInvoices > 1 ? 's' : ''} past due`,
        urgency: 'high',
        href: '/invoices?status=overdue',
        badge: String(overdueInvoices),
      });
    }

    // 5. Work orders in progress for too long (> 7 days)
    const staleWorkOrders = await prisma.workOrder.count({
      where: {
        status: WorkOrderStatus.IN_PROGRESS,
        updatedAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    if (staleWorkOrders > 0) {
      actions.push({
        id: 'stale-work-orders',
        type: 'work-orders',
        label: 'Review stale jobs',
        description: `${staleWorkOrders} job${staleWorkOrders > 1 ? 's' : ''} in progress > 7 days`,
        urgency: 'medium',
        href: '/work-orders?status=IN_PROGRESS&sort=oldest',
        badge: String(staleWorkOrders),
      });
    }

    // 6. Customers ready for pickup (completed in last 24 hours, not invoiced or paid)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const readyForPickup = await prisma.workOrder.findMany({
      where: {
        status: WorkOrderStatus.COMPLETED,
        updatedAt: {
          gte: oneDayAgo,
        },
        Invoice: {
          status: PaymentStatus.PAID,
        },
      },
      include: {
        Vehicle: {
          include: {
            Customer: true,
          },
        },
      },
    });

    if (readyForPickup.length > 0) {
      actions.push({
        id: 'ready-pickup',
        type: 'callbacks',
        label: 'Customer callbacks',
        description: 'Ready for pickup notifications',
        urgency: 'medium',
        href: '/work-orders?status=COMPLETED&filter=paid',
        badge: String(readyForPickup.length),
      });
    }

    // 7. Technicians not clocked in during business hours
    const currentHour = now.getHours();
    if (currentHour >= 8 && currentHour < 17) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const activeTechnicians = await prisma.employeeProfile.count({
        where: {
          role: 'MECHANIC',
          status: 'active',
        },
      });

      const clockedIn = await prisma.punchRecord.findMany({
        where: {
          timestamp: {
            gte: today,
          },
          type: 'CLOCK_IN',
        },
        distinct: ['employeeId'],
      });

      const notClockedIn = activeTechnicians - clockedIn.length;
      if (notClockedIn > 0) {
        actions.push({
          id: 'not-clocked-in',
          type: 'attendance',
          label: 'Check attendance',
          description: `${notClockedIn} technician${notClockedIn > 1 ? 's' : ''} not clocked in`,
          urgency: 'low',
          href: '/technicians',
          badge: String(notClockedIn),
        });
      }
    }

    // Sort by urgency (high first, then medium, then low)
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    actions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    // Limit to top 5
    const topActions = actions.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: topActions,
      total: actions.length,
    });
  } catch (error) {
    console.error('Smart actions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch smart actions' },
      { status: 500 }
    );
  }
}
