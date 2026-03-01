import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/security";
import { runSummarizeAgent } from "@/lib/ai/agents";
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
        Vehicle: true,
        Customer: true,
        Labor: {
          include: {
            EmployeeProfile: {
              select: { name: true },
            },
          },
        },
        Parts: {
          include: {
            Part: {
              select: { name: true },
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
    const customer = workOrder.Customer;

    const summary = await runSummarizeAgent({
      workOrder: {
        workOrderNumber: workOrder.workOrderNumber,
        status: workOrder.status,
        customerComplaint: workOrder.customerComplaint,
        techDiagnosis: workOrder.techDiagnosis,
        notes: workOrder.notes,
        laborRate: workOrder.laborRate,
        laborTotal: workOrder.laborTotal,
        partsTotal: workOrder.partsTotal,
        grandTotal: workOrder.grandTotal,
        createdAt: workOrder.createdAt,
        promisedDate: workOrder.promisedDate,
      },
      vehicle: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        currentMileage: vehicle.currentMileage,
      },
      customer: {
        displayName: customer.displayName,
      },
      labor: workOrder.Labor.map((l: { hours: number; rate: number; note: string | null; EmployeeProfile: { name: string } }) => ({
        hours: l.hours,
        rate: l.rate,
        note: l.note,
        technicianName: l.EmployeeProfile.name,
      })),
      parts: workOrder.Parts.map((p: { Part: { name: string }; quantity: number; unitPrice: number }) => ({
        name: p.Part.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
      })),
    });

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { aiSummary: summary as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ workOrderId, summary });
  } catch (error) {
    console.error("[AI Summarize Error]", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
