import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  partId: z.string().min(1),
  availableQty: z.number().min(1),
  askingPrice: z.number().min(0),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.networkListing.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("[Network Listings Error]", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkFeatureAccess } = await import("@/lib/plans");
    const planCheck = await checkFeatureAccess(session.user.tenantId, "networkAccess");
    if (!planCheck.allowed) {
      return NextResponse.json({ error: planCheck.error, requiredPlan: planCheck.requiredPlan }, { status: 403 });
    }

    const tenantId = session.user.tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { networkEnabled: true },
    });
    if (!tenant?.networkEnabled) {
      return NextResponse.json({ error: "Enable network sharing in settings first" }, { status: 400 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    // Verify part belongs to tenant and has stock
    const part = await prisma.part.findFirst({
      where: { id: data.partId, tenantId },
      select: { id: true, name: true, partNumber: true, qtyOnHand: true },
    });
    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }
    if (part.qtyOnHand < data.availableQty) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // Find shop for this tenant
    const shop = await prisma.shop.findFirst({
      where: { tenantId },
      select: { id: true },
    });

    const listing = await prisma.networkListing.create({
      data: {
        tenantId,
        shopId: shop?.id || "default",
        partId: data.partId,
        partName: part.name,
        partNumber: part.partNumber || null,
        availableQty: data.availableQty,
        askingPrice: data.askingPrice,
        notes: data.notes || null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[Network Listing Create Error]", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
