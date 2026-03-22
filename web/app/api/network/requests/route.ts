import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  type: z.enum(["PART_REQUEST", "OVERFLOW_JOB"]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  partName: z.string().optional(),
  partNumber: z.string().optional(),
  vehicleInfo: z.string().optional(),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "EMERGENCY"]).default("NORMAL"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Get own outgoing requests + incoming open requests from others
    const [outgoing, incoming] = await Promise.all([
      prisma.networkRequest.findMany({
        where: { sourceTenantId: tenantId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.networkRequest.findMany({
        where: {
          status: "OPEN",
          sourceTenantId: { not: tenantId },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({ outgoing, incoming });
  } catch (error) {
    console.error("[Network Requests Error]", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
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
      return NextResponse.json({ error: planCheck.error }, { status: 403 });
    }

    const tenantId = session.user.tenantId;
    const body = await request.json();
    const data = createSchema.parse(body);

    const shop = await prisma.shop.findFirst({
      where: { tenantId },
      select: { id: true },
    });

    const req = await prisma.networkRequest.create({
      data: {
        sourceTenantId: tenantId,
        sourceShopId: shop?.id || "default",
        type: data.type,
        title: data.title,
        description: data.description,
        partName: data.partName || null,
        partNumber: data.partNumber || null,
        vehicleInfo: data.vehicleInfo || null,
        urgency: data.urgency,
      },
    });

    return NextResponse.json(req);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[Network Request Create Error]", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
