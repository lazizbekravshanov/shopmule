import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkFeatureAccess } = await import("@/lib/plans");
    const planCheck = await checkFeatureAccess(session.user.tenantId, "aiAccess");
    if (!planCheck.allowed) {
      return NextResponse.json({ error: planCheck.error }, { status: 403 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(req.url);
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const excludeWoId = searchParams.get("excludeWoId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 10);

    if (!make || !model) {
      return NextResponse.json({ error: "make and model are required" }, { status: 400 });
    }

    const cases = await prisma.workOrder.findMany({
      where: {
        tenantId,
        aiDiagnosis: { not: undefined },
        aiDiagnosisAccuracy: { not: null },
        ...(excludeWoId ? { id: { not: excludeWoId } } : {}),
        deletedAt: null,
        Vehicle: {
          make: { equals: make, mode: "insensitive" },
          model: { equals: model, mode: "insensitive" },
        },
      },
      select: {
        id: true,
        workOrderNumber: true,
        customerComplaint: true,
        aiDiagnosis: true,
        aiDiagnosisAccuracy: true,
        technicianFeedback: true,
        diagnosisMatchedRepair: true,
        createdAt: true,
        Vehicle: {
          select: { year: true, make: true, model: true, currentMileage: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const results = cases.map((c) => {
      const diag = c.aiDiagnosis as Record<string, unknown> | null;
      return {
        id: c.id,
        workOrderNumber: c.workOrderNumber,
        complaint: c.customerComplaint,
        primaryDiagnosis: diag?.primaryDiagnosis || null,
        confidence: diag?.confidence || null,
        accuracy: c.aiDiagnosisAccuracy,
        matchedRepair: c.diagnosisMatchedRepair,
        feedback: c.technicianFeedback,
        vehicle: c.Vehicle,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ cases: results, total: results.length });
  } catch (error) {
    console.error("[Similar Cases Error]", error);
    return NextResponse.json({ error: "Failed to fetch similar cases" }, { status: 500 });
  }
}
