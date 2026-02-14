import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createPartSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50),
  name: z.string().min(1, "Name is required").max(200),
  category: z.string().max(100).optional(),
  cost: z.number().min(0, "Cost must be positive"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0).optional().default(0),
  reorderPoint: z.number().int().min(0).optional().default(0),
  vendorId: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parts = await prisma.part.findMany({
      orderBy: { name: "asc" },
      include: {
        Vendor: true,
      },
    })

    const transformed = parts.map((part) => ({
      id: part.id,
      sku: part.sku,
      name: part.name,
      category: part.category,
      cost: part.cost,
      price: part.price,
      stock: part.stock,
      reorderPoint: part.reorderPoint,
      vendorId: part.vendorId,
      vendor: part.Vendor
        ? {
            id: part.Vendor.id,
            name: part.Vendor.name,
          }
        : null,
      createdAt: part.createdAt.toISOString(),
      updatedAt: part.updatedAt.toISOString(),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("GET /api/inventory error:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createPartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Get tenantId from session
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant associated with user" }, { status: 400 })
    }

    const tenantId = user.tenantId

    // Check for duplicate SKU
    const existing = await prisma.part.findUnique({
      where: { tenantId_sku: { tenantId, sku: data.sku } },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A part with this SKU already exists" },
        { status: 400 }
      )
    }

    const part = await prisma.part.create({
      data: {
        tenantId,
        sku: data.sku,
        partNumber: data.sku,
        name: data.name,
        category: data.category || null,
        cost: data.cost,
        price: data.price,
        stock: data.stock,
        reorderPoint: data.reorderPoint,
        vendorId: data.vendorId || null,
      },
    })

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/inventory error:", error)
    return NextResponse.json(
      { error: "Failed to create part" },
      { status: 500 }
    )
  }
}
