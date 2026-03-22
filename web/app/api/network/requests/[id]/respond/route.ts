import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isValidId } from "@/lib/security";

export const dynamic = "force-dynamic";

const respondSchema = z.object({
  action: z.enum(["CLAIM", "CANCEL"]),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = respondSchema.parse(body);
    const tenantId = session.user.tenantId;

    const networkReq = await prisma.networkRequest.findUnique({ where: { id } });
    if (!networkReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (data.action === "CLAIM") {
      if (networkReq.status !== "OPEN") {
        return NextResponse.json({ error: "Request is no longer open" }, { status: 400 });
      }
      if (networkReq.sourceTenantId === tenantId) {
        return NextResponse.json({ error: "Cannot claim your own request" }, { status: 400 });
      }

      const shop = await prisma.shop.findFirst({
        where: { tenantId },
        select: { id: true },
      });

      const updated = await prisma.networkRequest.update({
        where: { id },
        data: {
          status: "CLAIMED",
          respondedByTenantId: tenantId,
          respondedByShopId: shop?.id || "default",
          respondedAt: new Date(),
          responseNotes: data.notes || null,
        },
      });
      return NextResponse.json(updated);
    }

    if (data.action === "CANCEL") {
      if (networkReq.sourceTenantId !== tenantId) {
        return NextResponse.json({ error: "Can only cancel your own requests" }, { status: 403 });
      }

      const updated = await prisma.networkRequest.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[Network Respond Error]", error);
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 });
  }
}
