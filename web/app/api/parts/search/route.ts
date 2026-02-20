import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { searchCatalog } from '@/lib/parts-catalog';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';

    if (!q || q.length < 2) {
      return NextResponse.json({ inventory: [], catalog: [] });
    }

    // ── Shop inventory search ──────────────────────────────────────────────
    const inventoryResults = await prisma.part.findMany({
      where: {
        OR: [
          { sku: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        sku: true,
        name: true,
        category: true,
        cost: true,
        price: true,
        stock: true,
        reorderPoint: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    // ── HD catalog search ──────────────────────────────────────────────────
    const catalogResults = searchCatalog(q, 15).filter(
      // Filter out catalog items already in shop inventory (by SKU)
      (cp) => !inventoryResults.some((ip) => ip.sku.toLowerCase() === cp.sku.toLowerCase())
    );

    return NextResponse.json({
      inventory: inventoryResults,
      catalog: catalogResults,
    });
  } catch (error) {
    console.error('GET /api/parts/search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
