import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"
import { isValidId } from "@/lib/security"
import { z } from "zod"

const createCertificationSchema = z.object({
  name: z.string().min(1, "Certification name is required").max(200),
  issuingOrg: z.string().max(200).optional(),
  certNumber: z.string().max(100).optional(),
  level: z.string().max(50).optional(),
  issuedDate: z.string().optional(),
  expiryDate: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated || !authResult.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = authResult.tenantId
    const { id } = await params

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const employee = await prisma.employeeProfile.findUnique({ where: { id } })
    if (!employee || employee.tenantId !== tenantId) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const certifications = await prisma.technicianCertification.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuingOrg: c.issuingOrg,
        certNumber: c.certNumber,
        level: c.level,
        issuedDate: c.issuedDate?.toISOString() ?? null,
        expiryDate: c.expiryDate?.toISOString() ?? null,
        isActive: c.isActive,
        createdAt: c.createdAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error("GET /api/employees/[id]/certifications error:", error)
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated || !authResult.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = authResult.tenantId
    const { id } = await params

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const employee = await prisma.employeeProfile.findUnique({ where: { id } })
    if (!employee || employee.tenantId !== tenantId) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = createCertificationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    const certification = await prisma.technicianCertification.create({
      data: {
        employeeId: id,
        name: data.name,
        issuingOrg: data.issuingOrg || null,
        certNumber: data.certNumber || null,
        level: data.level || null,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    })

    return NextResponse.json(
      {
        id: certification.id,
        name: certification.name,
        issuingOrg: certification.issuingOrg,
        certNumber: certification.certNumber,
        level: certification.level,
        issuedDate: certification.issuedDate?.toISOString() ?? null,
        expiryDate: certification.expiryDate?.toISOString() ?? null,
        isActive: certification.isActive,
        createdAt: certification.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/employees/[id]/certifications error:", error)
    return NextResponse.json(
      { error: "Failed to add certification" },
      { status: 500 }
    )
  }
}
