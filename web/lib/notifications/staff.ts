import { prisma } from "@/lib/db";
import type { NotificationType, Prisma } from "@prisma/client";

interface CreateStaffNotificationParams {
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  recipientId?: string;
}

/**
 * Create staff notification records.
 * If recipientId is provided, notifies that user only.
 * Otherwise notifies all users in the tenant.
 */
export async function createStaffNotification({
  tenantId,
  type,
  title,
  message,
  data,
  recipientId,
}: CreateStaffNotificationParams): Promise<void> {
  try {
    const jsonData = data ? (data as unknown as Prisma.InputJsonValue) : undefined;

    if (recipientId) {
      await prisma.attendanceNotification.create({
        data: { recipientId, type, title, message, data: jsonData },
      });
      return;
    }

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: { id: true },
    });

    if (users.length === 0) return;

    await prisma.attendanceNotification.createMany({
      data: users.map((u) => ({
        recipientId: u.id,
        type,
        title,
        message,
        data: jsonData,
      })),
    });
  } catch (error) {
    console.error("[Staff Notifications] Failed to create notification:", error);
  }
}
