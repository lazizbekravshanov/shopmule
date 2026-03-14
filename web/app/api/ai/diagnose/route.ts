import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/security";
import { runDiagnosticAgent } from "@/lib/ai/agents";
import type { DiagnosticPhoto } from "@/lib/ai/agents";
import type { Prisma } from "@prisma/client";
import { readFile } from "fs/promises";
import { join, extname } from "path";

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

    // Plan gating — AI requires STARTER+
    const { checkFeatureAccess } = await import("@/lib/plans");
    const planCheck = await checkFeatureAccess(session.user.tenantId, "aiAccess");
    if (!planCheck.allowed) {
      return NextResponse.json(
        { error: planCheck.error, requiredPlan: planCheck.requiredPlan },
        { status: 403 }
      );
    }

    const rateLimit = await checkRateLimit(session.user.id, "ai");
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
        Photos: {
          orderBy: { createdAt: "desc" as const },
          take: 5,
        },
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    // Load photos from disk and convert to base64
    const photos: DiagnosticPhoto[] = [];
    const MEDIA_TYPES: Record<string, DiagnosticPhoto["mediaType"]> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    for (const photo of workOrder.Photos) {
      try {
        // URL format: /api/uploads/photos/{workOrderId}/{filename}
        const urlParts = photo.url.split("/");
        const filename = urlParts[urlParts.length - 1];
        const filePath = join(process.cwd(), "uploads", "photos", workOrderId, filename);
        const buffer = await readFile(filePath);
        const ext = extname(filename).toLowerCase();
        photos.push({
          base64: buffer.toString("base64"),
          mediaType: MEDIA_TYPES[ext] || "image/jpeg",
          caption: photo.caption || photo.type || undefined,
        });
      } catch {
        // Skip photos that can't be read from disk
      }
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
      photos: photos.length > 0 ? photos : undefined,
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
