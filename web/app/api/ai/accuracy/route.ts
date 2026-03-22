import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const [totalDiagnoses, totalFeedback, breakdown, matchedRepairs] = await Promise.all([
      prisma.workOrder.count({
        where: { tenantId, aiDiagnosis: { not: undefined }, deletedAt: null },
      }),
      prisma.workOrder.count({
        where: { tenantId, aiDiagnosisAccuracy: { not: null }, deletedAt: null },
      }),
      prisma.workOrder.groupBy({
        by: ["aiDiagnosisAccuracy"],
        where: { tenantId, aiDiagnosisAccuracy: { not: null }, deletedAt: null },
        _count: true,
      }),
      prisma.workOrder.count({
        where: { tenantId, diagnosisMatchedRepair: true, deletedAt: null },
      }),
    ]);

    // Calculate accuracy rate: (SPOT_ON + MOSTLY_RIGHT) / total feedback
    const accurateCount = breakdown
      .filter((b) => b.aiDiagnosisAccuracy === "SPOT_ON" || b.aiDiagnosisAccuracy === "MOSTLY_RIGHT")
      .reduce((sum, b) => sum + b._count, 0);

    const accuracyRate = totalFeedback > 0 ? Math.round((accurateCount / totalFeedback) * 100) : null;
    const matchRate = totalFeedback > 0 ? Math.round((matchedRepairs / totalFeedback) * 100) : null;

    const breakdownMap: Record<string, number> = {};
    for (const b of breakdown) {
      if (b.aiDiagnosisAccuracy) {
        breakdownMap[b.aiDiagnosisAccuracy] = b._count;
      }
    }

    return NextResponse.json({
      totalDiagnoses,
      totalFeedback,
      accuracyRate,
      matchRate,
      breakdown: breakdownMap,
    });
  } catch (error) {
    console.error("[AI Accuracy Error]", error);
    return NextResponse.json({ error: "Failed to fetch accuracy metrics" }, { status: 500 });
  }
}
