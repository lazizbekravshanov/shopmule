import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security";
import { anthropic } from "@/lib/ai/client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const requestSchema = z.object({
  transcript: z.string().min(3).max(5000),
});

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
        { error: "Too many requests." },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `You extract structured work order information from a technician's spoken description.
Return ONLY valid JSON with this structure:
{
  "customerName": "string or null",
  "vehicleDescription": "string or null (year make model)",
  "complaint": "string — the main issue described",
  "techNotes": "string or null — any technical observations mentioned",
  "priority": "NORMAL" | "HIGH" | "URGENT"
}

Rules:
- Extract whatever info is available; use null for missing fields
- Keep complaint concise but complete
- Set priority to HIGH if safety-related, URGENT if vehicle is undrivable
- Clean up speech artifacts (um, uh, like) but keep the meaning
- If the tech mentions specific parts, codes, or measurements, put those in techNotes`,
      messages: [{ role: "user", content: parsed.data.transcript }],
    });

    const text = response.content.find((b) => b.type === "text")?.text || "{}";
    let structured;
    try {
      structured = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      structured = match ? JSON.parse(match[1].trim()) : { complaint: parsed.data.transcript };
    }

    return NextResponse.json({ structured });
  } catch (error) {
    console.error("[Voice-to-WO Error]", error);
    return NextResponse.json({ error: "Failed to process voice input" }, { status: 500 });
  }
}
