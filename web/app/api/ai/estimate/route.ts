import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/security";
import { runEstimateAgent } from "@/lib/ai/agents";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const requestSchema = z.object({
  workOrderId: z.string().min(1),
  diagnosticSummary: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const rateLimit = checkRateLimit(session.user.id, "ai");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetIn) },
        }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { workOrderId, diagnosticSummary } = parsed.data;
    const tenantId = session.user.tenantId;

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        tenantId,
        deletedAt: null,
      },
      include: {
        Vehicle: true,
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    // Use provided summary, fall back to tech diagnosis, then customer complaint
    const summary =
      diagnosticSummary ||
      workOrder.techDiagnosis ||
      workOrder.customerComplaint ||
      "General inspection and repair needed";

    // Fetch active in-stock parts for context
    const availableParts = await prisma.part.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
        qtyOnHand: { gt: 0 },
        deletedAt: null,
      },
      select: {
        name: true,
        partNumber: true,
        cost: true,
        price: true,
        qtyOnHand: true,
      },
      take: 50,
    });

    const laborRate = workOrder.laborRate || 125;
    const vehicle = workOrder.Vehicle;

    const estimate = await runEstimateAgent({
      vehicle: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        engine: vehicle.engine,
        currentMileage: vehicle.currentMileage,
      },
      diagnosticSummary: summary,
      laborRate,
      availableParts,
    });

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { aiEstimate: estimate as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ workOrderId, laborRate, estimate });
  } catch (error) {
    console.error("[AI Estimate Error]", error);
    return NextResponse.json(
      { error: "Failed to generate estimate" },
      { status: 500 }
    );
  }
}
