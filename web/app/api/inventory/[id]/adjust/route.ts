import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const adjustStockSchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = adjustStockSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { quantity } = parsed.data

    // Check part exists
    const existingPart = await prisma.part.findUnique({
      where: { id: params.id },
    })

    if (!existingPart) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 })
    }

    const part = await prisma.part.update({
      where: { id: params.id },
      data: { stock: quantity },
    })

    return NextResponse.json({
      id: part.id,
      sku: part.sku,
      name: part.name,
      category: part.category,
      cost: part.cost,
      price: part.price,
      stock: part.stock,
      reorderPoint: part.reorderPoint,
      vendorId: part.vendorId,
      createdAt: part.createdAt.toISOString(),
      updatedAt: part.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("PATCH /api/inventory/[id]/adjust error:", error)
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    )
  }
}
