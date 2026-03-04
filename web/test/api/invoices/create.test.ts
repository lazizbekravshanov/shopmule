import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../helpers/mock-prisma";
import { mockGetServerSession, TEST_SESSION } from "../../helpers/mock-session";
import { createMockRequest } from "../../helpers/mock-request";

import { POST } from "@/app/api/invoices/route";

describe("POST /api/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue(TEST_SESSION);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockRequest("POST", "http://localhost/api/invoices", {
      body: { workOrderId: "wo-001" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input (missing workOrderId)", async () => {
    const req = createMockRequest("POST", "http://localhost/api/invoices", {
      body: {},
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("returns 400 when invoice already exists (duplicate prevention)", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue({ id: "inv-existing" });

    const req = createMockRequest("POST", "http://localhost/api/invoices", {
      body: { workOrderId: "wo-001" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invoice already exists for this work order");
  });

  it("creates invoice with correct total calculation", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue(null); // no duplicate

    const workOrder = {
      id: "wo-001",
      tenantId: "tenant-001",
      description: "Brake job",
      status: "COMPLETED",
      Vehicle: {
        id: "v-1",
        make: "Honda",
        model: "Accord",
        year: 2020,
        vin: "1HGCM82633A123456",
        Customer: { id: "cust-001", name: "John", email: "john@test.com", phone: "555" },
      },
      Parts: [
        { quantity: 2, unitPrice: 50, markupPct: 0.1, Part: { name: "Brake Pad" } },
        { quantity: 1, unitPrice: 100, markupPct: 0, Part: { name: "Rotor" } },
      ],
      Labor: [
        { hours: 2, rate: 125 },
        { hours: 0.5, rate: 125 },
      ],
    };

    mockPrisma.workOrder.findUnique.mockResolvedValue(workOrder);
    mockPrisma.user.findUnique.mockResolvedValue({ tenantId: "tenant-001" });
    mockPrisma.invoice.count.mockResolvedValue(3);

    const createdInvoice = {
      id: "inv-001",
      invoiceNumber: `INV-${new Date().getFullYear()}-0004`,
      workOrderId: "wo-001",
      customerId: "cust-001",
      subtotalParts: 210, // (2*50*1.1) + (1*100*1.0) = 110 + 100 = 210
      subtotalLabor: 312.5, // (2*125) + (0.5*125) = 250 + 62.5 = 312.5
      tax: 41.8, // 522.5 * 0.08
      discount: 0,
      total: 564.3, // 522.5 + 41.8
      status: "UNPAID",
      tenantId: "tenant-001",
      createdAt: new Date(),
      updatedAt: new Date(),
      Customer: { id: "cust-001", name: "John", email: "john@test.com", phone: "555" },
      WorkOrder: {
        id: "wo-001",
        description: "Brake job",
        Vehicle: { make: "Honda", model: "Accord", year: 2020 },
      },
    };

    mockPrisma.invoice.create.mockResolvedValue(createdInvoice);

    const req = createMockRequest("POST", "http://localhost/api/invoices", {
      body: { workOrderId: "wo-001" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.id).toBe("inv-001");
    expect(json.customer.name).toBe("John");

    // Verify the create call had calculated totals
    const createCall = mockPrisma.invoice.create.mock.calls[0][0];
    expect(createCall.data.subtotalParts).toBeCloseTo(210, 1);
    expect(createCall.data.subtotalLabor).toBeCloseTo(312.5, 1);
  });

  it("generates invoice number from count", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue(null);
    mockPrisma.workOrder.findUnique.mockResolvedValue({
      id: "wo-001",
      Vehicle: {
        Customer: { id: "cust-001", name: "John", email: "j@t.com", phone: "555" },
      },
      Parts: [],
      Labor: [],
    });
    mockPrisma.user.findUnique.mockResolvedValue({ tenantId: "tenant-001" });
    mockPrisma.invoice.count.mockResolvedValue(42);
    mockPrisma.invoice.create.mockResolvedValue({
      id: "inv-001",
      invoiceNumber: `INV-${new Date().getFullYear()}-0043`,
      workOrderId: "wo-001",
      customerId: "cust-001",
      subtotalParts: 0,
      subtotalLabor: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: "UNPAID",
      createdAt: new Date(),
      Customer: { id: "cust-001", name: "John", email: "j@t.com", phone: "555" },
      WorkOrder: { id: "wo-001", description: "Test", Vehicle: null },
    });

    const req = createMockRequest("POST", "http://localhost/api/invoices", {
      body: { workOrderId: "wo-001" },
    });

    await POST(req);

    // Invoice number should be count + 1 = 43, padded to 4 digits
    const createCall = mockPrisma.invoice.create.mock.calls[0][0];
    expect(createCall.data.invoiceNumber).toMatch(/^INV-\d{4}-0043$/);
  });
});
