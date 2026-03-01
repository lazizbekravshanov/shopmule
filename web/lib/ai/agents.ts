import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./client";
import {
  WRENCH_SYSTEM_PROMPT,
  LEDGER_SYSTEM_PROMPT,
  SCRIBE_SYSTEM_PROMPT,
} from "./prompts";

const MODEL = "claude-sonnet-4-20250514";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DiagnosticParams {
  vehicle: {
    year?: number | null;
    make: string;
    model: string;
    engine?: string | null;
    currentMileage?: number | null;
  };
  customerComplaint?: string | null;
  techDiagnosis?: string | null;
  techNotes?: string | null;
  serviceHistory: Array<{
    serviceDate: Date;
    serviceType: string;
    description: string;
    mileage?: number | null;
  }>;
}

export interface PossibleCause {
  cause: string;
  likelihood: "high" | "medium" | "low";
  explanation: string;
}

export interface RecommendedAction {
  action: string;
  priority: "immediate" | "soon" | "monitor";
  reason: string;
}

export interface DiagnosticResult {
  primaryDiagnosis: string;
  confidence: number;
  possibleCauses: PossibleCause[];
  recommendedActions: RecommendedAction[];
  safetyConerns: string[];
  additionalNotes: string;
}

export interface EstimateParams {
  vehicle: {
    year?: number | null;
    make: string;
    model: string;
    engine?: string | null;
    currentMileage?: number | null;
  };
  diagnosticSummary: string;
  laborRate: number;
  availableParts: Array<{
    name: string;
    partNumber: string;
    cost: number;
    price: number;
    qtyOnHand: number;
  }>;
}

export interface EstimateLineItem {
  description: string;
  type: "labor" | "part" | "sublet" | "fee";
  hours?: number;
  unitCost: number;
  quantity: number;
  total: number;
  notes?: string;
}

export interface EstimateAlternative {
  description: string;
  estimatedSavings: number;
  tradeoff: string;
}

export interface EstimateResult {
  lineItems: EstimateLineItem[];
  subtotals: {
    labor: number;
    parts: number;
    sublet: number;
    fees: number;
  };
  estimatedTotal: number;
  estimatedHours: number;
  complexity: "simple" | "moderate" | "complex";
  confidence: number;
  caveats: string[];
  alternatives: EstimateAlternative[];
}

export interface SummarizeParams {
  workOrder: {
    workOrderNumber: string;
    status: string;
    customerComplaint?: string | null;
    techDiagnosis?: string | null;
    notes?: string | null;
    laborRate: number;
    laborTotal: number;
    partsTotal: number;
    grandTotal: number;
    createdAt: Date;
    promisedDate?: Date | null;
  };
  vehicle: {
    year?: number | null;
    make: string;
    model: string;
    currentMileage?: number | null;
  };
  customer: {
    displayName: string;
  };
  labor: Array<{
    hours: number;
    rate: number;
    note?: string | null;
    technicianName: string;
  }>;
  parts: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface WorkPerformed {
  description: string;
  technician: string;
  hours: number;
}

export interface PartUsed {
  name: string;
  quantity: number;
  cost: number;
}

export interface SummaryResult {
  customerSummary: string;
  technicalSummary: string;
  workPerformed: WorkPerformed[];
  partsUsed: PartUsed[];
  totals: {
    laborHours: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  };
  recommendations: string[];
  status: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseJsonResponse<T>(text: string): T {
  // Try direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try extracting from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim()) as T;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

function extractTextContent(
  response: Anthropic.Message
): string {
  for (const block of response.content) {
    if (block.type === "text") {
      return block.text;
    }
  }
  throw new Error("No text content in AI response");
}

// ─── Agents ──────────────────────────────────────────────────────────────────

export async function runDiagnosticAgent(
  params: DiagnosticParams
): Promise<DiagnosticResult> {
  const userMessage = `Diagnose the following vehicle issue:

Vehicle: ${params.vehicle.year || "Unknown"} ${params.vehicle.make} ${params.vehicle.model}
Engine: ${params.vehicle.engine || "Not specified"}
Mileage: ${params.vehicle.currentMileage ? `${params.vehicle.currentMileage.toLocaleString()} miles` : "Not recorded"}

Customer Complaint: ${params.customerComplaint || "Not provided"}
Technician Diagnosis: ${params.techDiagnosis || "Not yet diagnosed"}
Technician Notes: ${params.techNotes || "None"}

Recent Service History:
${
  params.serviceHistory.length > 0
    ? params.serviceHistory
        .map(
          (s) =>
            `- ${s.serviceDate.toLocaleDateString()}: ${s.serviceType} — ${s.description}${s.mileage ? ` (${s.mileage.toLocaleString()} mi)` : ""}`
        )
        .join("\n")
    : "No prior service history on file"
}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: WRENCH_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = extractTextContent(response);
  return parseJsonResponse<DiagnosticResult>(text);
}

export async function runEstimateAgent(
  params: EstimateParams
): Promise<EstimateResult> {
  const userMessage = `Generate a cost estimate for the following repair:

Vehicle: ${params.vehicle.year || "Unknown"} ${params.vehicle.make} ${params.vehicle.model}
Engine: ${params.vehicle.engine || "Not specified"}
Mileage: ${params.vehicle.currentMileage ? `${params.vehicle.currentMileage.toLocaleString()} miles` : "Not recorded"}

Diagnostic Summary: ${params.diagnosticSummary}

Shop Labor Rate: $${params.laborRate.toFixed(2)}/hr

${
  params.availableParts.length > 0
    ? `Available Parts in Inventory:
${params.availableParts
  .map(
    (p) =>
      `- ${p.name} (${p.partNumber}): Cost $${p.cost.toFixed(2)}, Price $${p.price.toFixed(2)}, Qty: ${p.qtyOnHand}`
  )
  .join("\n")}`
    : "No matching parts currently in inventory."
}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: LEDGER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = extractTextContent(response);
  return parseJsonResponse<EstimateResult>(text);
}

export async function runSummarizeAgent(
  params: SummarizeParams
): Promise<SummaryResult> {
  const userMessage = `Summarize the following work order:

Work Order: ${params.workOrder.workOrderNumber}
Status: ${params.workOrder.status}
Created: ${params.workOrder.createdAt.toLocaleDateString()}
${params.workOrder.promisedDate ? `Promised Date: ${params.workOrder.promisedDate.toLocaleDateString()}` : ""}

Customer: ${params.customer.displayName}

Vehicle: ${params.vehicle.year || "Unknown"} ${params.vehicle.make} ${params.vehicle.model}
Mileage: ${params.vehicle.currentMileage ? `${params.vehicle.currentMileage.toLocaleString()} miles` : "Not recorded"}

Customer Complaint: ${params.workOrder.customerComplaint || "Not provided"}
Technician Diagnosis: ${params.workOrder.techDiagnosis || "None"}
Notes: ${params.workOrder.notes || "None"}

Labor Performed:
${
  params.labor.length > 0
    ? params.labor
        .map(
          (l) =>
            `- ${l.technicianName}: ${l.hours}hrs @ $${l.rate.toFixed(2)}/hr${l.note ? ` — ${l.note}` : ""}`
        )
        .join("\n")
    : "No labor entries"
}

Parts Used:
${
  params.parts.length > 0
    ? params.parts
        .map(
          (p) =>
            `- ${p.name} x${p.quantity} @ $${p.unitPrice.toFixed(2)}`
        )
        .join("\n")
    : "No parts used"
}

Totals: Labor $${params.workOrder.laborTotal.toFixed(2)}, Parts $${params.workOrder.partsTotal.toFixed(2)}, Grand Total $${params.workOrder.grandTotal.toFixed(2)}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SCRIBE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = extractTextContent(response);
  return parseJsonResponse<SummaryResult>(text);
}
