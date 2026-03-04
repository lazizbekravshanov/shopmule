import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../helpers/mock-prisma";
import { mockGetServerSession, TEST_SESSION } from "../../helpers/mock-session";
import { createMockRequest } from "../../helpers/mock-request";

// Mock AI pipeline
const mockRunAIPipeline = vi.fn();
vi.mock("@/lib/ai/pipeline", () => ({
  runAIPipeline: (...args: unknown[]) => mockRunAIPipeline(...args),
}));

// Mock customer notifications
const mockSendNotification = vi.fn();
vi.mock("@/lib/notifications/customer", () => ({
  sendWorkOrderStatusNotification: (...args: unknown[]) => mockSendNotification(...args),
}));

// Mock security
vi.mock("@/lib/security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/security")>("@/lib/security");
  return { ...actual };
});

import { PATCH } from "@/app/api/work-orders/[id]/status/route";

const VALID_ID = "c" + "a".repeat(24);

describe("PATCH /api/work-orders/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue(TEST_SESSION);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockRequest("PATCH", `http://localhost/api/work-orders/${VALID_ID}/status`, {
      body: { status: "APPROVED" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: VALID_ID }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid status enum value", async () => {
    const req = createMockRequest("PATCH", `http://localhost/api/work-orders/${VALID_ID}/status`, {
      body: { status: "FLYING" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: VALID_ID }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("returns 404 when work order does not exist", async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue(null);

    const req = createMockRequest("PATCH", `http://localhost/api/work-orders/${VALID_ID}/status`, {
      body: { status: "APPROVED" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: VALID_ID }) });
    expect(res.status).toBe(404);
  });

  it("updates status and triggers pipeline + notification", async () => {
    const existingWO = { id: VALID_ID, status: "DIAGNOSED", tenantId: "tenant-001" };
    mockPrisma.workOrder.findUnique.mockResolvedValue(existingWO);

    const updatedWO = {
      ...existingWO,
      status: "APPROVED",
      vehicleId: "v-1",
      description: "Brake repair",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      Vehicle: {
        id: "v-1",
        vin: "1HGCM82633A123456",
        make: "Honda",
        model: "Accord",
        year: 2020,
        customerId: "cust-001",
        Customer: { id: "cust-001", name: "John" },
      },
    };
    mockPrisma.workOrder.update.mockResolvedValue(updatedWO);

    const req = createMockRequest("PATCH", `http://localhost/api/work-orders/${VALID_ID}/status`, {
      body: { status: "APPROVED" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: VALID_ID }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("APPROVED");

    // Verify both pipeline and notification were triggered
    expect(mockRunAIPipeline).toHaveBeenCalledWith(VALID_ID, "APPROVED");
    expect(mockSendNotification).toHaveBeenCalledWith({
      workOrderId: VALID_ID,
      newStatus: "APPROVED",
    });
  });
});
