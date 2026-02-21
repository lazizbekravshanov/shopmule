import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { withAuth, withPermission } from "@/lib/auth/with-permission"
import { P } from "@/lib/auth/permissions"
import bcrypt from "bcryptjs"

const VALID_ROLES = [
  "OWNER", "ADMIN", "MANAGER", "SERVICE_MANAGER", "SERVICE_ADVISOR",
  "PARTS_MANAGER", "OFFICE_MANAGER", "SENIOR_TECHNICIAN", "MECHANIC",
  "TECHNICIAN", "FRONT_DESK", "TIMESHEET_USER", "CUSTOMER",
] as const

const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(VALID_ROLES),
  payRate: z.number().min(0),
  payType: z.enum(["HOURLY", "FLAT_RATE", "SALARY"]).optional(),
  overtimeRate: z.number().min(0).optional(),
  phoneNumber: z.string().max(50).optional(),
  specializations: z.array(z.string()).optional(),
  hireDate: z.string().optional(),
  pin: z.string().max(10).optional(),
})

export const GET = withAuth(async (request, { auth }) => {
  try {
    const tenantId = auth.tenantId
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = { tenantId }

    if (role) {
      where.role = role
    }
    if (status === "active") {
      where.status = "active"
      where.deletedAt = null
    } else if (status === "inactive") {
      where.OR = [{ status: "inactive" }, { deletedAt: { not: null } }]
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }

    const employees = await prisma.employeeProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        User: { select: { email: true } },
        Certifications: true,
      },
    })

    const transformed = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      payRate: emp.payRate,
      payType: emp.payType,
      overtimeRate: emp.overtimeRate,
      status: emp.status,
      userId: emp.userId,
      pin: emp.pin,
      photoUrl: emp.photoUrl,
      phoneNumber: emp.phoneNumber,
      specializations: emp.specializations,
      hireDate: emp.hireDate?.toISOString() ?? null,
      address: emp.address,
      emergencyContact: emp.emergencyContact,
      emergencyPhone: emp.emergencyPhone,
      notes: emp.notes,
      email: emp.User.email,
      certifications: emp.Certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuingOrg: c.issuingOrg,
        certNumber: c.certNumber,
        level: c.level,
        issuedDate: c.issuedDate?.toISOString() ?? null,
        expiryDate: c.expiryDate?.toISOString() ?? null,
        isActive: c.isActive,
      })),
      createdAt: emp.createdAt.toISOString(),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("GET /api/employees error:", error)
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    )
  }
})

export const POST = withPermission(P.USERS_CREATE, async (request, { auth }) => {
  try {
    const tenantId = auth.tenantId

    const body = await request.json()
    const parsed = createEmployeeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        tenantId,
        email: data.email.toLowerCase().trim(),
        passwordHash,
        name: data.name,
        role: data.role,
        phone: data.phoneNumber || null,
      },
    })

    const employee = await prisma.employeeProfile.create({
      data: {
        tenantId,
        userId: user.id,
        name: data.name,
        role: data.role,
        payRate: data.payRate,
        payType: data.payType || "HOURLY",
        overtimeRate: data.overtimeRate ?? null,
        phoneNumber: data.phoneNumber || null,
        specializations: data.specializations || [],
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        pin: data.pin || null,
        status: "active",
      },
    })

    return NextResponse.json(
      {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        payRate: employee.payRate,
        payType: employee.payType,
        status: employee.status,
        userId: employee.userId,
        email: user.email,
        certifications: [],
        createdAt: employee.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/employees error:", error)
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    )
  }
})
