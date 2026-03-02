import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.attendanceNotification.findMany({
        where: { recipientId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.attendanceNotification.count({
        where: { recipientId: session.user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAll } = body as { id?: string; markAll?: boolean };

    if (markAll) {
      await prisma.attendanceNotification.updateMany({
        where: { recipientId: session.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (id) {
      await prisma.attendanceNotification.updateMany({
        where: { id, recipientId: session.user.id },
        data: { isRead: true, readAt: new Date() },
      });
    } else {
      return NextResponse.json(
        { error: "Provide 'id' or 'markAll'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
