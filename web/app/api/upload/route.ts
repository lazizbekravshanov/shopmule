import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workOrderId = formData.get("workOrderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!workOrderId) {
      return NextResponse.json(
        { error: "workOrderId is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB" },
        { status: 400 }
      );
    }

    // Verify work order exists and belongs to tenant
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { tenantId: true },
    });

    if (!workOrder || workOrder.tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    const fileId = randomUUID();
    const ext = extname(file.name) || ".jpg";
    const filename = `${fileId}${ext}`;
    const dirPath = join(process.cwd(), "uploads", "photos", workOrderId);

    await mkdir(dirPath, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dirPath, filename), buffer);

    const url = `/api/uploads/photos/${workOrderId}/${filename}`;

    await prisma.workOrderPhoto.create({
      data: {
        workOrderId,
        url,
        type: "general",
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
