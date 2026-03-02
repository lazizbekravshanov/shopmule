import { prisma } from "@/lib/db";
import {
  runDiagnosticAgent,
  runEstimateAgent,
  runSummarizeAgent,
} from "./agents";
import type { Prisma } from "@prisma/client";
import { createStaffNotification } from "@/lib/notifications/staff";
import { sendWorkOrderStatusNotification } from "@/lib/notifications/customer";

/**
 * Central AI pipeline orchestrator.
 *
 * Call this after a work order is created or its status changes.
 * It checks which AI fields are already populated and only runs
 * the agents that are needed. Diagnose automatically chains to estimate.
 *
 * Failures are logged but never propagated — this must be safe
 * to call from after() or fire-and-forget contexts.
 */
export async function runAIPipeline(
  workOrderId: string,
  newStatus: string
): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("[AI Pipeline] ANTHROPIC_API_KEY not set, skipping");
    return;
  }

  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        Vehicle: {
          include: {
            ServiceHistory: {
              orderBy: { serviceDate: "desc" as const },
              take: 10,
            },
          },
        },
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
      console.warn("[AI Pipeline] Work order not found:", workOrderId);
      return;
    }

    const status = newStatus.toUpperCase();

    // WO Created / Diagnosed → run diagnose, then chain to estimate
    if (status === "DIAGNOSED") {
      if (!workOrder.aiDiagnosis) {
        await prisma.workOrder.update({ where: { id: workOrderId }, data: { aiStatus: "DIAGNOSING" } });
        await runDiagnoseStep(workOrder);
        await createStaffNotification({
          tenantId: workOrder.tenantId,
          type: "WORK_ORDER_STATUS",
          title: "AI diagnosis complete",
          message: `Diagnosis finished for WO ${workOrder.workOrderNumber ?? workOrderId.slice(0, 8)}`,
          data: { workOrderId, agent: "diagnostic" },
        });
      }
      // Re-fetch to get the diagnosis we just saved (for estimate input)
      const refreshed = await prisma.workOrder.findUnique({
        where: { id: workOrderId },
        include: { Vehicle: true },
      });
      if (refreshed && !refreshed.aiEstimate) {
        await prisma.workOrder.update({ where: { id: workOrderId }, data: { aiStatus: "ESTIMATING" } });
        await runEstimateStep(refreshed);
        await createStaffNotification({
          tenantId: workOrder.tenantId,
          type: "WORK_ORDER_STATUS",
          title: "AI estimate complete",
          message: `Estimate generated for WO ${workOrder.workOrderNumber ?? workOrderId.slice(0, 8)}`,
          data: { workOrderId, agent: "estimate" },
        });
      }
      await prisma.workOrder.update({ where: { id: workOrderId }, data: { aiStatus: null } });
      // Send customer notification after diagnosis + estimate are ready
      await sendWorkOrderStatusNotification({ workOrderId, newStatus: "DIAGNOSED" });
      return;
    }

    // Approved / In Progress / Waiting on Parts → run estimate if missing
    if (
      status === "APPROVED" ||
      status === "IN_PROGRESS" ||
      status === "WAITING_ON_PARTS"
    ) {
      if (!workOrder.aiEstimate) {
        await prisma.workOrder.update({ where: { id: workOrderId }, data: { aiStatus: "ESTIMATING" } });
        await runEstimateStep(workOrder);
        await prisma.workOrder.update({ where: { id: workOrderId }, data: { aiStatus: null } });
        await createStaffNotification({
          tenantId: workOrder.tenantId,
          type: "WORK_ORDER_STATUS",
          title: "AI estimate complete",
          message: `Estimate generated for WO ${workOrder.workOrderNumber ?? workOrderId.slice(0, 8)}`,
          data: { workOrderId, agent: "estimate" },
        });
      }
      return;
    }

    // Completed / Invoiced → run summarize
    if (status === "COMPLETED" || status === "INVOICED") {
      if (!workOrder.aiSummary) {
        await prisma.workOrder.update({ where: { id: workOrderId }, data: { aiStatus: "SUMMARIZING" } });
        await runSummarizeStep(workOrder);
        await prisma.workOrder.update({ where: { id: workOrderId }, data: { aiStatus: null } });
        await createStaffNotification({
          tenantId: workOrder.tenantId,
          type: "WORK_ORDER_STATUS",
          title: "AI summary complete",
          message: `Summary generated for WO ${workOrder.workOrderNumber ?? workOrderId.slice(0, 8)}`,
          data: { workOrderId, agent: "summarize" },
        });
      }
      return;
    }
  } catch (error) {
    console.error("[AI Pipeline] Unhandled error:", error);
  }
}

// ─── Individual Steps ─────────────────────────────────────────────────────────

async function runDiagnoseStep(
  workOrder: {
    id: string;
    customerComplaint: string | null;
    techDiagnosis: string | null;
    notes: string | null;
    Vehicle: {
      year: number | null;
      make: string;
      model: string;
      engine: string | null;
      currentMileage: number | null;
      ServiceHistory: Array<{
        serviceDate: Date;
        serviceType: string;
        description: string;
        mileage: number | null;
      }>;
    };
  }
): Promise<void> {
  try {
    console.log("[AI Pipeline] Running diagnostic agent for WO:", workOrder.id);
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
      serviceHistory: vehicle.ServiceHistory.map((sh) => ({
        serviceDate: sh.serviceDate,
        serviceType: sh.serviceType,
        description: sh.description,
        mileage: sh.mileage,
      })),
    });

    await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: { aiDiagnosis: diagnosis as unknown as Prisma.InputJsonValue },
    });

    console.log("[AI Pipeline] Diagnostic saved for WO:", workOrder.id);
  } catch (error) {
    console.error("[AI Pipeline] Diagnostic agent failed:", error);
  }
}

async function runEstimateStep(
  workOrder: {
    id: string;
    tenantId: string;
    laborRate: number;
    techDiagnosis: string | null;
    customerComplaint: string | null;
    aiDiagnosis: Prisma.JsonValue | null;
    Vehicle: {
      year: number | null;
      make: string;
      model: string;
      engine: string | null;
      currentMileage: number | null;
    };
  }
): Promise<void> {
  try {
    console.log("[AI Pipeline] Running estimate agent for WO:", workOrder.id);

    // Build diagnostic summary from available sources
    let diagnosticSummary = "General inspection and repair needed";
    if (workOrder.aiDiagnosis && typeof workOrder.aiDiagnosis === "object") {
      const diag = workOrder.aiDiagnosis as Record<string, unknown>;
      if (diag.primaryDiagnosis) {
        diagnosticSummary = String(diag.primaryDiagnosis);
      }
    } else if (workOrder.techDiagnosis) {
      diagnosticSummary = workOrder.techDiagnosis;
    } else if (workOrder.customerComplaint) {
      diagnosticSummary = workOrder.customerComplaint;
    }

    // Fetch available parts for context
    const availableParts = await prisma.part.findMany({
      where: {
        tenantId: workOrder.tenantId,
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
      diagnosticSummary,
      laborRate,
      availableParts,
    });

    await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: { aiEstimate: estimate as unknown as Prisma.InputJsonValue },
    });

    console.log("[AI Pipeline] Estimate saved for WO:", workOrder.id);
  } catch (error) {
    console.error("[AI Pipeline] Estimate agent failed:", error);
  }
}

async function runSummarizeStep(
  workOrder: {
    id: string;
    workOrderNumber: string;
    status: string;
    customerComplaint: string | null;
    techDiagnosis: string | null;
    notes: string | null;
    laborRate: number;
    laborTotal: number;
    partsTotal: number;
    grandTotal: number;
    createdAt: Date;
    promisedDate: Date | null;
    Vehicle: {
      year: number | null;
      make: string;
      model: string;
      currentMileage: number | null;
    };
    Customer: {
      displayName: string;
    };
    Labor: Array<{
      hours: number;
      rate: number;
      note: string | null;
      EmployeeProfile: { name: string };
    }>;
    Parts: Array<{
      quantity: number;
      unitPrice: number;
      Part: { name: string };
    }>;
  }
): Promise<void> {
  try {
    console.log("[AI Pipeline] Running summarize agent for WO:", workOrder.id);

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
        year: workOrder.Vehicle.year,
        make: workOrder.Vehicle.make,
        model: workOrder.Vehicle.model,
        currentMileage: workOrder.Vehicle.currentMileage,
      },
      customer: {
        displayName: workOrder.Customer.displayName,
      },
      labor: workOrder.Labor.map((l) => ({
        hours: l.hours,
        rate: l.rate,
        note: l.note,
        technicianName: l.EmployeeProfile.name,
      })),
      parts: workOrder.Parts.map((p) => ({
        name: p.Part.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
      })),
    });

    await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: { aiSummary: summary as unknown as Prisma.InputJsonValue },
    });

    console.log("[AI Pipeline] Summary saved for WO:", workOrder.id);
  } catch (error) {
    console.error("[AI Pipeline] Summarize agent failed:", error);
  }
}
