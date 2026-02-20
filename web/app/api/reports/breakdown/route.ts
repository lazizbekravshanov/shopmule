import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function parseDateRange(range: string): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  switch (range) {
    case '7d':  return { from: new Date(to.getTime() - 7  * 86_400_000), to };
    case '30d': return { from: new Date(to.getTime() - 30 * 86_400_000), to };
    case '90d': return { from: new Date(to.getTime() - 90 * 86_400_000), to };
    case 'ytd': return { from: new Date(now.getFullYear(), 0, 1), to };
    default:    return { from: new Date('2020-01-01'), to };
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const { from, to } = parseDateRange(range);

    // Previous period of equal length for comparison
    const periodMs = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodMs);
    const prevTo   = new Date(from.getTime() - 1);

    const [current, previous, invoiceRows, laborRows] = await Promise.all([
      // Current period totals
      prisma.invoice.aggregate({
        where: { tenantId, status: 'PAID', createdAt: { gte: from, lte: to } },
        _sum: { total: true, subtotalLabor: true, subtotalParts: true },
        _count: { _all: true },
      }),

      // Previous period total for % change
      prisma.invoice.aggregate({
        where: { tenantId, status: 'PAID', createdAt: { gte: prevFrom, lte: prevTo } },
        _sum: { total: true },
        _count: { _all: true },
      }),

      // Per-invoice rows for monthly grouping
      prisma.invoice.findMany({
        where: { tenantId, status: 'PAID', createdAt: { gte: from, lte: to } },
        select: { createdAt: true, subtotalLabor: true, subtotalParts: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),

      // Tech labor entries for performance section
      prisma.workOrderLabor.findMany({
        where: { WorkOrder: { tenantId, createdAt: { gte: from, lte: to } } },
        select: {
          hours: true,
          rate: true,
          EmployeeProfile: { select: { id: true, name: true } },
        },
      }),
    ]);

    // ── Summary ───────────────────────────────────────────────────────────────
    const totalRevenue  = current._sum.total ?? 0;
    const laborRevenue  = current._sum.subtotalLabor ?? 0;
    const partsRevenue  = current._sum.subtotalParts ?? 0;
    const invoiceCount  = current._count._all;
    const avgTicket     = invoiceCount > 0 ? Math.round(totalRevenue / invoiceCount) : 0;
    const prevRevenue   = previous._sum.total ?? 0;
    const revenueChange = prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

    // ── Monthly grouping ──────────────────────────────────────────────────────
    const monthMap = new Map<string, { revenue: number; labor: number; parts: number }>();
    for (const inv of invoiceRows) {
      const key = inv.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthMap.get(key) ?? { revenue: 0, labor: 0, parts: 0 };
      existing.revenue += inv.total;
      existing.labor   += inv.subtotalLabor;
      existing.parts   += inv.subtotalParts;
      monthMap.set(key, existing);
    }
    const monthly = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, d]) => ({
        month: new Date(key + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: Math.round(d.revenue),
        labor:   Math.round(d.labor),
        parts:   Math.round(d.parts),
      }));

    // ── Tech performance ──────────────────────────────────────────────────────
    const techMap = new Map<string, { name: string; hours: number; revenue: number }>();
    for (const entry of laborRows) {
      if (!entry.EmployeeProfile) continue;
      const { id, name } = entry.EmployeeProfile;
      const existing = techMap.get(id) ?? { name, hours: 0, revenue: 0 };
      existing.hours   += entry.hours;
      existing.revenue += entry.hours * entry.rate;
      techMap.set(id, existing);
    }
    const techPerformance = Array.from(techMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((t) => ({
        name:    t.name,
        hours:   Math.round(t.hours * 10) / 10,
        revenue: Math.round(t.revenue),
      }));

    return NextResponse.json({
      summary: {
        totalRevenue:   Math.round(totalRevenue),
        invoiceCount,
        avgTicket,
        laborRevenue:   Math.round(laborRevenue),
        partsRevenue:   Math.round(partsRevenue),
        laborPct:       totalRevenue > 0 ? Math.round((laborRevenue  / totalRevenue) * 100) : 0,
        partsPct:       totalRevenue > 0 ? Math.round((partsRevenue  / totalRevenue) * 100) : 0,
        revenueChange,
        prevRevenue:    Math.round(prevRevenue),
      },
      monthly,
      techPerformance,
      range,
      from: from.toISOString(),
      to:   to.toISOString(),
    });
  } catch (error) {
    console.error('[Reports Breakdown]', error);
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
  }
}
