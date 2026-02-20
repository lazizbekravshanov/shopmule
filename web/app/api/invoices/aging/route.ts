import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MS_PER_DAY = 86_400_000;

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    const openInvoices = await prisma.invoice.findMany({
      where: { tenantId, status: { in: ['UNPAID', 'PARTIAL'] } },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        Customer: { select: { id: true, name: true, phone: true, email: true } },
        LegacyPayments: { select: { amount: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    type Bucket = { count: number; total: number; invoiceIds: string[] };
    const buckets: Record<'current' | 'overdue31' | 'overdue61' | 'overdue90', Bucket> = {
      current:   { count: 0, total: 0, invoiceIds: [] },
      overdue31: { count: 0, total: 0, invoiceIds: [] },
      overdue61: { count: 0, total: 0, invoiceIds: [] },
      overdue90: { count: 0, total: 0, invoiceIds: [] },
    };

    let totalOutstanding = 0;

    for (const inv of openInvoices) {
      const paid = inv.LegacyPayments.reduce((s, p) => s + p.amount, 0);
      const balance = inv.total - paid;
      if (balance <= 0) continue;

      const age = daysSince(inv.createdAt);
      const key: keyof typeof buckets =
        age <= 30  ? 'current'   :
        age <= 60  ? 'overdue31' :
        age <= 90  ? 'overdue61' : 'overdue90';

      buckets[key].count++;
      buckets[key].total += balance;
      buckets[key].invoiceIds.push(inv.id);
      totalOutstanding += balance;
    }

    // Build per-bucket invoice list for the overdue view
    const overdueInvoices = openInvoices
      .filter((inv) => daysSince(inv.createdAt) > 30)
      .map((inv) => {
        const paid = inv.LegacyPayments.reduce((s, p) => s + p.amount, 0);
        return {
          id: inv.id,
          balance: inv.total - paid,
          age: daysSince(inv.createdAt),
          customer: inv.Customer
            ? { id: inv.Customer.id, name: inv.Customer.name, phone: inv.Customer.phone, email: inv.Customer.email }
            : null,
        };
      })
      .sort((a, b) => b.age - a.age);

    return NextResponse.json({
      buckets,
      totalOutstanding,
      overdueInvoices,
    });
  } catch (error) {
    console.error('GET /api/invoices/aging error:', error);
    return NextResponse.json({ error: 'Failed to fetch AR aging' }, { status: 500 });
  }
}
