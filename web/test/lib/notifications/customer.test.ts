import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../helpers/mock-prisma";

// Mock email and SMS services
const mockSendEmail = vi.fn();
const mockSendSms = vi.fn();
vi.mock("@/lib/services/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));
vi.mock("@/lib/services/sms", () => ({
  sendSms: (...args: unknown[]) => mockSendSms(...args),
}));

import { sendWorkOrderStatusNotification } from "@/lib/notifications/customer";

const BASE_WO = {
  id: "wo-001",
  workOrderNumber: "WO-2024-00001",
  status: "DIAGNOSED",
  grandTotal: 500,
  laborTotal: 300,
  partsTotal: 200,
  aiEstimate: { totalEstimate: 500 },
  Vehicle: { year: 2020, make: "Honda", model: "Accord" },
  Customer: {
    id: "cust-001",
    name: "John Doe",
    displayName: "John Doe",
    email: "john@test.com",
    phone: "+15550100",
    portalTokenHash: "abc123",
  },
};

describe("sendWorkOrderStatusNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("sends email when preferences allow it", async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue(BASE_WO);
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailEnabled: true,
      smsEnabled: false,
      estimateAlerts: true,
      workOrderUpdates: true,
      invoiceReminders: true,
    });
    mockSendEmail.mockResolvedValue({ success: true, messageId: "msg-001" });
    mockPrisma.customerNotification.create.mockResolvedValue({});

    await sendWorkOrderStatusNotification({ workOrderId: "wo-001", newStatus: "DIAGNOSED" });

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@test.com",
        subject: expect.stringContaining("estimate is ready"),
      })
    );
    // Notification was logged
    expect(mockPrisma.customerNotification.create).toHaveBeenCalled();
  });

  it("sends SMS when smsEnabled and phone exists", async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue(BASE_WO);
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailEnabled: false,
      smsEnabled: true,
      estimateAlerts: true,
      workOrderUpdates: true,
      invoiceReminders: true,
    });
    mockSendSms.mockResolvedValue({ success: true, messageId: "sms-001" });
    mockPrisma.customerNotification.create.mockResolvedValue({});

    await sendWorkOrderStatusNotification({ workOrderId: "wo-001", newStatus: "DIAGNOSED" });

    expect(mockSendSms).toHaveBeenCalledWith(
      expect.objectContaining({ to: "+15550100" })
    );
  });

  it("respects category preferences — skips when estimateAlerts is off", async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue(BASE_WO);
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailEnabled: true,
      smsEnabled: true,
      estimateAlerts: false, // turned off
      workOrderUpdates: true,
      invoiceReminders: true,
    });

    await sendWorkOrderStatusNotification({ workOrderId: "wo-001", newStatus: "DIAGNOSED" });

    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockSendSms).not.toHaveBeenCalled();
  });

  it("logs notification on success", async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue(BASE_WO);
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null); // defaults
    mockSendEmail.mockResolvedValue({ success: true, messageId: "msg-002" });
    mockPrisma.customerNotification.create.mockResolvedValue({});

    await sendWorkOrderStatusNotification({ workOrderId: "wo-001", newStatus: "COMPLETED" });

    expect(mockPrisma.customerNotification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customerId: "cust-001",
        status: "SENT",
        type: "SERVICE_COMPLETE",
        channel: "EMAIL",
      }),
    });
  });

  it("does nothing for unknown status (no config)", async () => {
    await sendWorkOrderStatusNotification({ workOrderId: "wo-001", newStatus: "DRAFT" });

    // DRAFT has no STATUS_MESSAGES entry — should exit early
    expect(mockPrisma.workOrder.findUnique).not.toHaveBeenCalled();
  });

  it("swallows errors without throwing", async () => {
    mockPrisma.workOrder.findUnique.mockRejectedValue(new Error("DB error"));

    await expect(
      sendWorkOrderStatusNotification({ workOrderId: "wo-001", newStatus: "DIAGNOSED" })
    ).resolves.toBeUndefined();
  });
});
