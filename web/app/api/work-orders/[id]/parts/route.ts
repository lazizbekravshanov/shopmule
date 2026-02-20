import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isValidId } from '@/lib/security';
import { z } from 'zod';

const addPartSchema = z.object({
  // Existing inventory part
  partId: z.string().optional(),

  // Catalog part (creates new inventory entry if partId not supplied)
  sku: z.string().optional(),
  name: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),

  // Common
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0),
  markupPct: z.number().min(0).max(5).default(0.15),
}).refine((d) => d.partId || d.sku, { message: 'partId or sku required' });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workOrderId } = await params;
    if (!isValidId(workOrderId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // Verify work order exists
    const wo = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { id: true, tenantId: true },
    });
    if (!wo) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = addPartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { partId, sku, name, category, brand, supplier, quantity, unitPrice, markupPct } = parsed.data;

    // ── Resolve or create the Part record ────────────────────────────────────
    let resolvedPartId = partId;

    if (!resolvedPartId) {
      // Catalog part — find by SKU or create new
      const existing = await prisma.part.findFirst({
        where: { sku: sku!, tenantId: wo.tenantId },
      });

      if (existing) {
        resolvedPartId = existing.id;
      } else {
        // Create the part in shop inventory from catalog data
        const vendorName = supplier ?? brand ?? 'Unknown';
        let vendor = await prisma.vendor.findFirst({
          where: { name: vendorName, tenantId: wo.tenantId },
        });
        if (!vendor) {
          vendor = await prisma.vendor.create({
            data: { name: vendorName, tenantId: wo.tenantId },
          });
        }

        const newPart = await prisma.part.create({
          data: {
            tenantId: wo.tenantId,
            partNumber: sku!,
            sku: sku!,
            name: name!,
            category: category ?? null,
            cost: unitPrice,             // dealer cost = unit price supplied
            price: unitPrice * (1 + markupPct),
            stock: 0,
            reorderPoint: 1,
            vendorId: vendor.id,
          },
        });
        resolvedPartId = newPart.id;
      }
    }

    // ── Add part to work order ───────────────────────────────────────────────
    const woPart = await prisma.workOrderPart.create({
      data: {
        workOrderId,
        partId: resolvedPartId,
        quantity,
        unitPrice,
        markupPct,
      },
      include: { Part: true },
    });

    // ── Update partsTotal on work order ─────────────────────────────────────
    const allParts = await prisma.workOrderPart.findMany({
      where: { workOrderId },
    });
    const partsTotal = allParts.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice * (1 + p.markupPct),
      0
    );
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { partsTotal },
    });

    return NextResponse.json(
      {
        id: woPart.id,
        quantity: woPart.quantity,
        unitPrice: woPart.unitPrice,
        markupPct: woPart.markupPct,
        part: woPart.Part
          ? {
              id: woPart.Part.id,
              sku: woPart.Part.sku,
              name: woPart.Part.name,
              category: woPart.Part.category,
              cost: woPart.Part.cost,
              price: woPart.Part.price,
              stock: woPart.Part.stock,
              reorderPoint: woPart.Part.reorderPoint,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/work-orders/[id]/parts error:', error);
    return NextResponse.json({ error: 'Failed to add part' }, { status: 500 });
  }
}
