import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/security";
import { anthropic } from "@/lib/ai/client";
import { GUIDED_WRENCH_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_STEPS = 8;
const MODEL = "claude-sonnet-4-20250514";

const startSchema = z.object({
  action: z.literal("start"),
  workOrderId: z.string().min(1),
});

const respondSchema = z.object({
  action: z.literal("respond"),
  sessionId: z.string().min(1),
  answer: z.string().min(1).max(2000),
});

const requestSchema = z.discriminatedUnion("action", [startSchema, respondSchema]);

interface SessionMessage {
  role: "user" | "assistant";
  content: string;
  step: number;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

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
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const tenantId = session.user.tenantId;

    if (parsed.data.action === "start") {
      return handleStart(tenantId, parsed.data.workOrderId);
    } else {
      return handleRespond(tenantId, parsed.data.sessionId, parsed.data.answer);
    }
  } catch (error) {
    console.error("[Guided Diagnosis Error]", error);
    return NextResponse.json({ error: "Failed to process diagnostic step" }, { status: 500 });
  }
}

async function handleStart(tenantId: string, workOrderId: string) {
  const workOrder = await prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId, deletedAt: null },
    include: {
      Vehicle: {
        include: {
          ServiceHistory: { orderBy: { serviceDate: "desc" as const }, take: 5 },
        },
      },
    },
  });

  if (!workOrder) {
    return NextResponse.json({ error: "Work order not found" }, { status: 404 });
  }

  const vehicle = workOrder.Vehicle;
  const contextMessage = `Starting a guided diagnostic session.

Vehicle: ${vehicle.year || "Unknown"} ${vehicle.make} ${vehicle.model}
Engine: ${vehicle.engine || "Not specified"}
Mileage: ${vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} miles` : "Not recorded"}

Customer Complaint: ${workOrder.customerComplaint || "Not provided"}
Technician Notes: ${workOrder.techDiagnosis || "None yet"}

Recent Service History:
${
  vehicle.ServiceHistory.length > 0
    ? vehicle.ServiceHistory.map(
        (s: { serviceDate: Date; serviceType: string; description: string }) =>
          `- ${s.serviceDate.toLocaleDateString()}: ${s.serviceType} — ${s.description}`
      ).join("\n")
    : "No prior service history"
}

Begin Phase 1 — ask your first symptom-gathering question.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: GUIDED_WRENCH_SYSTEM_PROMPT,
    messages: [{ role: "user", content: contextMessage }],
  });

  const aiText = response.content.find((b) => b.type === "text")?.text || "";
  const messages: SessionMessage[] = [
    { role: "user", content: contextMessage, step: 0 },
    { role: "assistant", content: aiText, step: 1 },
  ];

  const diagSession = await prisma.diagnosticSession.create({
    data: {
      tenantId,
      workOrderId,
      status: "IN_PROGRESS",
      messages: messages as unknown as Prisma.InputJsonValue,
      currentStep: 1,
    },
  });

  let parsed;
  try {
    parsed = JSON.parse(aiText);
  } catch {
    parsed = { type: "question", step: 1, phase: "symptoms", question: aiText };
  }

  return NextResponse.json({
    sessionId: diagSession.id,
    status: "IN_PROGRESS",
    currentStep: 1,
    response: parsed,
  });
}

async function handleRespond(tenantId: string, sessionId: string, answer: string) {
  const diagSession = await prisma.diagnosticSession.findFirst({
    where: { id: sessionId, tenantId },
  });

  if (!diagSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (diagSession.status === "COMPLETED") {
    return NextResponse.json({ error: "Session already completed" }, { status: 400 });
  }

  const existingMessages = (diagSession.messages as unknown as SessionMessage[]) || [];
  const nextStep = diagSession.currentStep + 1;

  // Build conversation history for Claude
  const apiMessages = existingMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  apiMessages.push({ role: "user", content: answer });

  // If we're at the max, force a conclusion
  const systemAddendum =
    nextStep >= MAX_STEPS
      ? "\n\nIMPORTANT: This is the final exchange. You MUST deliver your diagnosis now with type: \"diagnosis\"."
      : "";

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: GUIDED_WRENCH_SYSTEM_PROMPT + systemAddendum,
    messages: apiMessages,
  });

  const aiText = response.content.find((b) => b.type === "text")?.text || "";

  const updatedMessages: SessionMessage[] = [
    ...existingMessages,
    { role: "user", content: answer, step: nextStep - 1 },
    { role: "assistant", content: aiText, step: nextStep },
  ];

  let parsed;
  try {
    parsed = JSON.parse(aiText);
  } catch {
    parsed = { type: "question", step: nextStep, phase: "unknown", question: aiText };
  }

  const isComplete = parsed.type === "diagnosis" || nextStep >= MAX_STEPS;

  await prisma.diagnosticSession.update({
    where: { id: sessionId },
    data: {
      messages: updatedMessages as unknown as Prisma.InputJsonValue,
      currentStep: nextStep,
      status: isComplete ? "COMPLETED" : "IN_PROGRESS",
      finalDiagnosis: isComplete ? (parsed as unknown as Prisma.InputJsonValue) : undefined,
    },
  });

  // If complete, also save to the work order's aiDiagnosis field
  if (isComplete && parsed.type === "diagnosis") {
    const workOrder = await prisma.diagnosticSession.findUnique({
      where: { id: sessionId },
      select: { workOrderId: true },
    });
    if (workOrder) {
      await prisma.workOrder.update({
        where: { id: workOrder.workOrderId },
        data: { aiDiagnosis: parsed as unknown as Prisma.InputJsonValue },
      });
    }
  }

  return NextResponse.json({
    sessionId,
    status: isComplete ? "COMPLETED" : "IN_PROGRESS",
    currentStep: nextStep,
    response: parsed,
  });
}
