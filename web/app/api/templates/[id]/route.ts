import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { isValidId } from "@/lib/security"

const lineSchema = z.object({
  type: z.enum(["LABOR", "PART", "SUBLET", "FEE", "NOTE"]),
  description: z.string().min(1).max(500),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().min(0).default(0),
  laborHours: z.number().min(0).optional().nullable(),
})

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  flatRatePrice: z.number().min(0).optional().nullable(),
  laborHours: z.number().min(0).optional().nullable(),
  lines: z.array(lineSchema).optional(),
})

function transformTemplate(t: any) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    flatRatePrice: t.flatRatePrice,
    laborHours: t.laborHours,
    lines: (t.Lines ?? []).map((l: any) => ({
      id: l.id,
      type: l.type,
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      laborHours: l.laborHours,
    })),
  }
}

async function getOwnedTemplate(id: string, tenantId: string) {
  return prisma.serviceTemplate.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: { Lines: { orderBy: { id: "asc" } } },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const template = await getOwnedTemplate(id, session.user.tenantId!)
    if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(transformTemplate(template))
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const existing = await getOwnedTemplate(id, session.user.tenantId!)
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await request.json()
    const data = updateTemplateSchema.parse(body)

    // Replace lines if provided: delete all, recreate
    const template = await prisma.$transaction(async (tx) => {
      if (data.lines !== undefined) {
        await tx.serviceTemplateLine.deleteMany({ where: { serviceTemplateId: id } })
      }

      return tx.serviceTemplate.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.flatRatePrice !== undefined && { flatRatePrice: data.flatRatePrice }),
          ...(data.laborHours !== undefined && { laborHours: data.laborHours }),
          ...(data.lines !== undefined && {
            Lines: {
              create: data.lines.map((l) => ({
                type: l.type,
                description: l.description,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                laborHours: l.laborHours ?? null,
              })),
            },
          }),
        },
        include: { Lines: true },
      })
    })

    return NextResponse.json(transformTemplate(template))
  } catch (error) {
    console.error("Error updating template:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const existing = await getOwnedTemplate(id, session.user.tenantId!)
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Soft delete
    await prisma.serviceTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
