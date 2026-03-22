import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isValidId } from "@/lib/security";

export const dynamic = "force-dynamic";

const feedbackSchema = z.object({
  accuracy: z.enum(["SPOT_ON", "MOSTLY_RIGHT", "PARTIALLY_RIGHT", "WRONG", "NOT_APPLICABLE"]),
  feedback: z.string().max(1000).optional(),
  diagnosisMatchedRepair: z.boolean().optional(),
});

export async function POST(
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
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const body = await request.json();
    const data = feedbackSchema.parse(body);

    const workOrder = await prisma.workOrder.findFirst({
      where: { id, tenantId: session.user.tenantId, deletedAt: null },
      select: { id: true, status: true, aiDiagnosis: true, aiDiagnosisAccuracy: true },
    });

    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    if (!workOrder.aiDiagnosis) {
      return NextResponse.json({ error: "No AI diagnosis to rate" }, { status: 400 });
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        aiDiagnosisAccuracy: data.accuracy,
        technicianFeedback: data.feedback || null,
        diagnosisMatchedRepair: data.diagnosisMatchedRepair ?? null,
        feedbackProvidedAt: new Date(),
        feedbackProvidedBy: session.user.id,
      },
      select: { id: true, aiDiagnosisAccuracy: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[AI Feedback Error]", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
