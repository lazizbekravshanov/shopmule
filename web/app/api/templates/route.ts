import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const lineSchema = z.object({
  type: z.enum(["LABOR", "PART", "SUBLET", "FEE", "NOTE"]),
  description: z.string().min(1).max(500),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().min(0).default(0),
  laborHours: z.number().min(0).optional().nullable(),
})

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  flatRatePrice: z.number().min(0).optional().nullable(),
  laborHours: z.number().min(0).optional().nullable(),
  lines: z.array(lineSchema).default([]),
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 })
    }

    const templates = await prisma.serviceTemplate.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      include: { Lines: { orderBy: { id: "asc" } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })

    return NextResponse.json(templates.map(transformTemplate))
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 })
    }

    const body = await request.json()
    const data = createTemplateSchema.parse(body)

    const template = await prisma.serviceTemplate.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description ?? null,
        category: data.category ?? null,
        flatRatePrice: data.flatRatePrice ?? null,
        laborHours: data.laborHours ?? null,
        Lines: {
          create: data.lines.map((l) => ({
            type: l.type,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            laborHours: l.laborHours ?? null,
          })),
        },
      },
      include: { Lines: true },
    })

    return NextResponse.json(transformTemplate(template), { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
