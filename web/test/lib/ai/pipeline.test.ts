import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../helpers/mock-prisma";

// Mock AI agents
const mockRunDiagnosticAgent = vi.fn();
const mockRunEstimateAgent = vi.fn();
const mockRunSummarizeAgent = vi.fn();
vi.mock("@/lib/ai/agents", () => ({
  runDiagnosticAgent: (...args: unknown[]) => mockRunDiagnosticAgent(...args),
  runEstimateAgent: (...args: unknown[]) => mockRunEstimateAgent(...args),
  runSummarizeAgent: (...args: unknown[]) => mockRunSummarizeAgent(...args),
}));

// Mock notifications
const mockCreateStaffNotification = vi.fn();
vi.mock("@/lib/notifications/staff", () => ({
  createStaffNotification: (...args: unknown[]) => mockCreateStaffNotification(...args),
}));

const mockSendStatusNotification = vi.fn();
vi.mock("@/lib/notifications/customer", () => ({
  sendWorkOrderStatusNotification: (...args: unknown[]) => mockSendStatusNotification(...args),
}));

import { runAIPipeline } from "@/lib/ai/pipeline";

const BASE_WO = {
  id: "wo-001",
  tenantId: "tenant-001",
  workOrderNumber: "WO-2024-00001",
  status: "DIAGNOSED",
  description: "Brake squeal",
  customerComplaint: "Brakes squealing",
  techDiagnosis: null,
  notes: null,
  laborRate: 125,
  laborTotal: 0,
  partsTotal: 0,
  grandTotal: 0,
  createdAt: new Date(),
  promisedDate: null,
  aiDiagnosis: null,
  aiEstimate: null,
  aiSummary: null,
  aiStatus: null,
  Vehicle: {
    year: 2020,
    make: "Honda",
    model: "Accord",
    engine: "2.0T",
    currentMileage: 75000,
    ServiceHistory: [],
  },
  Customer: { displayName: "John Doe" },
  Labor: [],
  Parts: [],
};

describe("runAIPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("skips when ANTHROPIC_API_KEY is not set", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    await runAIPipeline("wo-001", "DIAGNOSED");

    expect(mockPrisma.workOrder.findUnique).not.toHaveBeenCalled();
  });

  it("runs diagnose → estimate chain for DIAGNOSED status", async () => {
    mockPrisma.workOrder.findUnique
      .mockResolvedValueOnce({ ...BASE_WO }) // initial fetch
      .mockResolvedValueOnce({ ...BASE_WO, aiDiagnosis: { primaryDiagnosis: "Worn pads" } }); // refresh after diagnose

    mockPrisma.workOrder.update.mockResolvedValue({});
    mockRunDiagnosticAgent.mockResolvedValue({ primaryDiagnosis: "Worn pads" });
    mockRunEstimateAgent.mockResolvedValue({ totalEstimate: 350 });
    mockPrisma.part.findMany.mockResolvedValue([]);

    await runAIPipeline("wo-001", "DIAGNOSED");

    // Diagnose was called
    expect(mockRunDiagnosticAgent).toHaveBeenCalled();
    // Estimate was chained
    expect(mockRunEstimateAgent).toHaveBeenCalled();
    // Staff notifications sent for both
    expect(mockCreateStaffNotification).toHaveBeenCalledTimes(2);
    // Customer notification sent
    expect(mockSendStatusNotification).toHaveBeenCalledWith({
      workOrderId: "wo-001",
      newStatus: "DIAGNOSED",
    });
    // aiStatus was set to DIAGNOSING then ESTIMATING then cleared
    expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { aiStatus: "DIAGNOSING" } })
    );
  });

  it("skips diagnose if aiDiagnosis already exists (idempotency)", async () => {
    const woWithDiagnosis = {
      ...BASE_WO,
      aiDiagnosis: { primaryDiagnosis: "Already diagnosed" },
    };
    mockPrisma.workOrder.findUnique
      .mockResolvedValueOnce(woWithDiagnosis)
      .mockResolvedValueOnce({ ...woWithDiagnosis, aiEstimate: null });

    mockPrisma.workOrder.update.mockResolvedValue({});
    mockRunEstimateAgent.mockResolvedValue({ totalEstimate: 200 });
    mockPrisma.part.findMany.mockResolvedValue([]);

    await runAIPipeline("wo-001", "DIAGNOSED");

    // Diagnose was NOT called since it already existed
    expect(mockRunDiagnosticAgent).not.toHaveBeenCalled();
    // Estimate was still called
    expect(mockRunEstimateAgent).toHaveBeenCalled();
  });

  it("runs summarize for COMPLETED status", async () => {
    const completedWO = { ...BASE_WO, status: "COMPLETED", aiSummary: null };
    mockPrisma.workOrder.findUnique.mockResolvedValue(completedWO);
    mockPrisma.workOrder.update.mockResolvedValue({});
    mockRunSummarizeAgent.mockResolvedValue({ summary: "Work completed" });

    await runAIPipeline("wo-001", "COMPLETED");

    expect(mockRunSummarizeAgent).toHaveBeenCalled();
    expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { aiStatus: "SUMMARIZING" } })
    );
  });

  it("handles errors gracefully without throwing", async () => {
    mockPrisma.workOrder.findUnique.mockRejectedValue(new Error("DB down"));

    // Should not throw
    await expect(runAIPipeline("wo-001", "DIAGNOSED")).resolves.toBeUndefined();
  });
});
