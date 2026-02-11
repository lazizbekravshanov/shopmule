import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PaymentStatus, Prisma } from '@prisma/client';

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    Customer: true;
    WorkOrder: {
      include: {
        Vehicle: true;
      };
    };
    Payment: true;
  };
}>;

interface UnpaidInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  vehicle: string | null;
  amount: number;
  balance: number;
  dueDate: string;
  daysOverdue: number;
  status: string;
  lastPayment: Date | null;
}

export async function GET() {
  try {
    // Get unpaid and partial invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL],
        },
      },
      include: {
        Customer: true,
        WorkOrder: {
          include: {
            Vehicle: true,
          },
        },
        Payment: {
          orderBy: {
            receivedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Default payment terms in days (could be made configurable per shop in settings)
    const DEFAULT_PAYMENT_TERMS_DAYS = 30;

    const unpaidInvoices: UnpaidInvoice[] = invoices.map((inv: InvoiceWithRelations) => {
      // Calculate due date from creation date + payment terms
      // Note: When a dueDate field is added to the schema, use it instead
      const dueDate = new Date(inv.createdAt);
      dueDate.setDate(dueDate.getDate() + DEFAULT_PAYMENT_TERMS_DAYS);

      // Normalize times to midnight for accurate day calculations
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      // Calculate days overdue (positive = overdue, negative = days until due)
      const diffMs = now.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Calculate remaining balance
      const paidAmount = inv.Payment.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
      const balance = inv.total - paidAmount;

      return {
        id: inv.id,
        invoiceNumber: `INV-${inv.id.slice(-6).toUpperCase()}`,
        customer: inv.Customer?.name || 'Unknown',
        vehicle: inv.WorkOrder?.Vehicle
          ? `${inv.WorkOrder.Vehicle.make} ${inv.WorkOrder.Vehicle.model}`
          : null,
        amount: inv.total,
        balance,
        dueDate: dueDate.toISOString(),
        daysOverdue, // negative means days until due
        status: inv.status,
        lastPayment: inv.Payment[0]?.receivedAt || null,
      };
    });

    // Sort by days overdue (most overdue first)
    unpaidInvoices.sort((a: UnpaidInvoice, b: UnpaidInvoice) => b.daysOverdue - a.daysOverdue);

    // Summary stats
    const totalOverdue = unpaidInvoices
      .filter((i: UnpaidInvoice) => i.daysOverdue > 0)
      .reduce((sum: number, i: UnpaidInvoice) => sum + i.balance, 0);
    const totalUpcoming = unpaidInvoices
      .filter((i: UnpaidInvoice) => i.daysOverdue <= 0)
      .reduce((sum: number, i: UnpaidInvoice) => sum + i.balance, 0);
    const overdueCount = unpaidInvoices.filter((i: UnpaidInvoice) => i.daysOverdue > 0).length;

    return NextResponse.json({
      success: true,
      data: {
        invoices: unpaidInvoices.slice(0, 10),
        summary: {
          totalOverdue,
          totalUpcoming,
          overdueCount,
          totalCount: unpaidInvoices.length,
        },
      },
    });
  } catch (error) {
    console.error('Unpaid invoices API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unpaid invoices' },
      { status: 500 }
    );
  }
}
