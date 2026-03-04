import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../helpers/mock-prisma";

import { createStaffNotification } from "@/lib/notifications/staff";

describe("createStaffNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a single notification when recipientId is provided", async () => {
    mockPrisma.attendanceNotification.create.mockResolvedValue({});

    await createStaffNotification({
      tenantId: "tenant-001",
      type: "WORK_ORDER_STATUS",
      title: "Test",
      message: "Test message",
      recipientId: "user-001",
    });

    expect(mockPrisma.attendanceNotification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipientId: "user-001",
        title: "Test",
      }),
    });
    // Should NOT query users or use createMany
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  });

  it("broadcasts to all tenant users when no recipientId", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "user-001" },
      { id: "user-002" },
      { id: "user-003" },
    ]);
    mockPrisma.attendanceNotification.createMany.mockResolvedValue({ count: 3 });

    await createStaffNotification({
      tenantId: "tenant-001",
      type: "SYSTEM",
      title: "Broadcast",
      message: "To everyone",
    });

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: { tenantId: "tenant-001" },
      select: { id: true },
    });
    expect(mockPrisma.attendanceNotification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ recipientId: "user-001" }),
        expect.objectContaining({ recipientId: "user-002" }),
        expect.objectContaining({ recipientId: "user-003" }),
      ]),
    });
  });

  it("does nothing for empty tenant (no users)", async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);

    await createStaffNotification({
      tenantId: "empty-tenant",
      type: "SYSTEM",
      title: "Test",
      message: "No users",
    });

    expect(mockPrisma.attendanceNotification.createMany).not.toHaveBeenCalled();
  });

  it("swallows errors without throwing", async () => {
    mockPrisma.user.findMany.mockRejectedValue(new Error("DB error"));

    // Should not throw
    await expect(
      createStaffNotification({
        tenantId: "tenant-001",
        type: "SYSTEM",
        title: "Test",
        message: "Error test",
      })
    ).resolves.toBeUndefined();
  });
});
