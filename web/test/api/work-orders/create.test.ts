import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../helpers/mock-prisma";
import { createMockRequest } from "../../helpers/mock-request";

// Mock mobile-auth (work-orders route uses verifyMobileAuth, not getServerSession)
const mockVerifyMobileAuth = vi.fn();
vi.mock("@/lib/mobile-auth", () => ({
  verifyMobileAuth: (...args: unknown[]) => mockVerifyMobileAuth(...args),
}));

// Mock AI pipeline — we just need to verify it's called
const mockRunAIPipeline = vi.fn();
vi.mock("@/lib/ai/pipeline", () => ({
  runAIPipeline: (...args: unknown[]) => mockRunAIPipeline(...args),
}));

// Mock security
vi.mock("@/lib/security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/security")>("@/lib/security");
  return { ...actual };
});

import { POST } from "@/app/api/work-orders/route";

describe("POST /api/work-orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockVerifyMobileAuth.mockResolvedValue({ authenticated: false });

    const req = createMockRequest("POST", "http://localhost/api/work-orders", {
      body: { vehicleId: "v-1", description: "Brake job" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid Zod input (missing description)", async () => {
    mockVerifyMobileAuth.mockResolvedValue({
      authenticated: true,
      userId: "user-001",
      tenantId: "tenant-001",
    });

    const req = createMockRequest("POST", "http://localhost/api/work-orders", {
      body: { vehicleId: "v-1" }, // missing description
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("returns 404 when vehicle not found", async () => {
    mockVerifyMobileAuth.mockResolvedValue({
      authenticated: true,
      userId: "user-001",
      tenantId: "tenant-001",
    });

    mockPrisma.vehicle.findUnique.mockResolvedValue(null);

    const req = createMockRequest("POST", "http://localhost/api/work-orders", {
      body: {
        vehicleId: "c" + "a".repeat(24), // valid cuid format
        description: "Brake job",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("creates a work order and triggers AI pipeline", async () => {
    mockVerifyMobileAuth.mockResolvedValue({
      authenticated: true,
      userId: "user-001",
      tenantId: "tenant-001",
    });

    const vehicle = {
      id: "c" + "a".repeat(24),
      tenantId: "tenant-001",
      customerId: "cust-001",
      Customer: { id: "cust-001", name: "John" },
    };

    mockPrisma.vehicle.findUnique.mockResolvedValue(vehicle);
    mockPrisma.workOrder.count.mockResolvedValue(5);

    const createdWO = {
      id: "wo-001",
      tenantId: "tenant-001",
      customerId: "cust-001",
      vehicleId: vehicle.id,
      workOrderNumber: `WO-${new Date().getFullYear()}-00006`,
      description: "Brake job",
      notes: null,
      checklist: null,
      status: "DIAGNOSED",
      laborTotal: 0,
      partsTotal: 0,
      laborRate: 125,
      createdAt: new Date(),
      updatedAt: new Date(),
      Vehicle: {
        id: vehicle.id,
        vin: "1HGCM82633A123456",
        make: "Honda",
        model: "Accord",
        year: 2020,
        customerId: "cust-001",
        Customer: { id: "cust-001", name: "John", phone: "555-0100", email: "john@test.com" },
      },
    };

    mockPrisma.workOrder.create.mockResolvedValue(createdWO);

    const req = createMockRequest("POST", "http://localhost/api/work-orders", {
      body: { vehicleId: vehicle.id, description: "Brake job" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.id).toBe("wo-001");
    expect(json.status).toBe("DIAGNOSED");

    // Verify WO number generation used count + 1
    expect(mockPrisma.workOrder.count).toHaveBeenCalled();

    // Verify AI pipeline was triggered (via after() which our setup.ts calls immediately)
    expect(mockRunAIPipeline).toHaveBeenCalledWith("wo-001", "DIAGNOSED");
  });
});
