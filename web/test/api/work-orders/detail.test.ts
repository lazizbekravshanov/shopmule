import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../helpers/mock-prisma";
import { mockGetServerSession, TEST_SESSION } from "../../helpers/mock-session";
import { createMockRequest } from "../../helpers/mock-request";

vi.mock("@/lib/security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/security")>("@/lib/security");
  return { ...actual };
});

import { GET } from "@/app/api/work-orders/[id]/route";

const VALID_ID = "c" + "a".repeat(24);

describe("GET /api/work-orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue(TEST_SESSION);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockRequest("GET", `http://localhost/api/work-orders/${VALID_ID}`);
    const res = await GET(req, { params: Promise.resolve({ id: VALID_ID }) });
    expect(res.status).toBe(401);
  });

  it("returns 401 when session has no tenantId", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-001", email: "a@b.com", role: "OWNER", tenantId: null, shopId: null },
    });

    const req = createMockRequest("GET", `http://localhost/api/work-orders/${VALID_ID}`);
    const res = await GET(req, { params: Promise.resolve({ id: VALID_ID }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when work order belongs to a different tenant", async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue({
      id: VALID_ID,
      tenantId: "other-tenant", // Different from TEST_SESSION.user.tenantId
      status: "DRAFT",
    });

    const req = createMockRequest("GET", `http://localhost/api/work-orders/${VALID_ID}`);
    const res = await GET(req, { params: Promise.resolve({ id: VALID_ID }) });
    expect(res.status).toBe(404);
  });

  it("returns work order with AI fields in response", async () => {
    const wo = {
      id: VALID_ID,
      tenantId: "tenant-001",
      vehicleId: "v-1",
      status: "DIAGNOSED",
      description: "Engine misfire",
      checklist: null,
      notes: "Check spark plugs",
      partsStatus: null,
      laborTotal: 2.5,
      partsTotal: 150,
      laborRate: 125,
      aiDiagnosis: { primaryDiagnosis: "Faulty ignition coil", confidence: 0.85 },
      aiEstimate: { totalEstimate: 450, lineItems: [] },
      aiSummary: null,
      aiStatus: null,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      Vehicle: {
        id: "v-1",
        vin: "1HGCM82633A123456",
        unitNumber: "U-100",
        make: "Honda",
        model: "Accord",
        year: 2020,
        currentMileage: 75000,
        licensePlate: "ABC-1234",
        customerId: "cust-001",
        Customer: { id: "cust-001", name: "John", phone: "555-0100", email: "john@test.com" },
      },
      Assignments: [],
      Labor: [],
      Parts: [],
    };

    mockPrisma.workOrder.findUnique.mockResolvedValue(wo);

    const req = createMockRequest("GET", `http://localhost/api/work-orders/${VALID_ID}`);
    const res = await GET(req, { params: Promise.resolve({ id: VALID_ID }) });

    expect(res.status).toBe(200);
    const json = await res.json();

    // Verify AI fields are included
    expect(json.aiDiagnosis).toEqual({ primaryDiagnosis: "Faulty ignition coil", confidence: 0.85 });
    expect(json.aiEstimate).toEqual({ totalEstimate: 450, lineItems: [] });
    expect(json.aiSummary).toBeNull();
    expect(json.aiStatus).toBeNull();

    // Verify tenant-scoped data
    expect(json.id).toBe(VALID_ID);
    expect(json.vehicle.customer.name).toBe("John");
  });
});
