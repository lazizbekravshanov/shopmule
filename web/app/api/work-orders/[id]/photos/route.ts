import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isValidId } from "@/lib/security";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      select: { tenantId: true },
    });

    if (!workOrder || workOrder.tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    const photos = await prisma.workOrderPhoto.findMany({
      where: { workOrderId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
