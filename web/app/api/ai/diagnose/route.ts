import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/security";
import { runDiagnosticAgent } from "@/lib/ai/agents";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const requestSchema = z.object({
  workOrderId: z.string().min(1),
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

    const { workOrderId } = parsed.data;
    const tenantId = session.user.tenantId;

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        tenantId,
        deletedAt: null,
      },
      include: {
        Vehicle: {
          include: {
            ServiceHistory: {
              orderBy: { serviceDate: "desc" as const },
              take: 10,
            },
          },
        },
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    const vehicle = workOrder.Vehicle;
    const diagnosis = await runDiagnosticAgent({
      vehicle: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        engine: vehicle.engine,
        currentMileage: vehicle.currentMileage,
      },
      customerComplaint: workOrder.customerComplaint,
      techDiagnosis: workOrder.techDiagnosis,
      techNotes: workOrder.notes,
      serviceHistory: vehicle.ServiceHistory.map((sh: { serviceDate: Date; serviceType: string; description: string; mileage: number | null }) => ({
        serviceDate: sh.serviceDate,
        serviceType: sh.serviceType,
        description: sh.description,
        mileage: sh.mileage,
      })),
    });

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { aiDiagnosis: diagnosis as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ workOrderId, diagnosis });
  } catch (error) {
    console.error("[AI Diagnose Error]", error);
    return NextResponse.json(
      { error: "Failed to generate diagnosis" },
      { status: 500 }
    );
  }
}
