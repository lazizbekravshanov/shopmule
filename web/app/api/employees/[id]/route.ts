import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"
import { isValidId } from "@/lib/security"
import { z } from "zod"

const updateEmployeeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "SERVICE_ADVISOR", "MECHANIC", "FRONT_DESK"]).optional(),
  payRate: z.number().min(0).optional(),
  payType: z.enum(["HOURLY", "FLAT_RATE", "SALARY"]).optional(),
  overtimeRate: z.number().min(0).nullable().optional(),
  phoneNumber: z.string().max(50).nullable().optional(),
  photoUrl: z.string().max(500).nullable().optional(),
  specializations: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  pin: z.string().max(10).nullable().optional(),
  hireDate: z.string().nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  emergencyContact: z.string().max(200).nullable().optional(),
  emergencyPhone: z.string().max(50).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
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

    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        User: { select: { email: true } },
        Certifications: { orderBy: { createdAt: "desc" } },
        WorkOrderAssignments: {
          take: 10,
          orderBy: { assignedAt: "desc" },
          include: {
            WorkOrder: {
              select: {
                id: true,
                workOrderNumber: true,
                description: true,
                status: true,
                createdAt: true,
                Vehicle: { select: { make: true, model: true, year: true, unitNumber: true } },
              },
            },
          },
        },
      },
    })

    if (!employee || employee.tenantId !== tenantId) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Compute live stats
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Sunday
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Today's hours from PunchRecords
    const todayPunches = await prisma.punchRecord.findMany({
      where: { employeeId: id, timestamp: { gte: todayStart } },
      orderBy: { timestamp: "asc" },
    })
    const todayHours = computeHoursFromPunches(todayPunches, now)

    // Week's hours
    const weekPunches = await prisma.punchRecord.findMany({
      where: { employeeId: id, timestamp: { gte: weekStart } },
      orderBy: { timestamp: "asc" },
    })
    const weekHours = computeHoursFromPunches(weekPunches, now)

    // Jobs completed this month
    const jobsCompleted = await prisma.workOrder.count({
      where: {
        assignedTechnicianId: id,
        status: "COMPLETED",
        updatedAt: { gte: monthStart },
      },
    })

    // Billable efficiency: billable labor hours / clocked work hours
    const monthLabor = await prisma.workOrderLabor.aggregate({
      where: { employeeId: id, WorkOrder: { updatedAt: { gte: monthStart } } },
      _sum: { hours: true },
    })
    const billableHours = monthLabor._sum.hours ?? 0

    const monthPunches = await prisma.punchRecord.findMany({
      where: { employeeId: id, timestamp: { gte: monthStart } },
      orderBy: { timestamp: "asc" },
    })
    const monthWorkHours = computeHoursFromPunches(monthPunches, now)
    const billableEfficiency = monthWorkHours > 0
      ? Math.round((billableHours / monthWorkHours) * 100)
      : 0

    // Revenue generated this month
    const monthRevenue = await prisma.workOrderLabor.aggregate({
      where: { employeeId: id, WorkOrder: { updatedAt: { gte: monthStart } } },
      _sum: { hours: true, rate: true },
    })
    // Revenue = sum of (hours * rate) per entry
    const laborEntries = await prisma.workOrderLabor.findMany({
      where: { employeeId: id, WorkOrder: { updatedAt: { gte: monthStart } } },
      select: { hours: true, rate: true },
    })
    const revenueGenerated = laborEntries.reduce((sum, e) => sum + e.hours * e.rate, 0)

    const transformed = {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      payRate: employee.payRate,
      payType: employee.payType,
      overtimeRate: employee.overtimeRate,
      status: employee.status,
      userId: employee.userId,
      pin: employee.pin,
      photoUrl: employee.photoUrl,
      phoneNumber: employee.phoneNumber,
      specializations: employee.specializations,
      hireDate: employee.hireDate?.toISOString() ?? null,
      address: employee.address,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      notes: employee.notes,
      email: employee.User.email,
      certifications: employee.Certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuingOrg: c.issuingOrg,
        certNumber: c.certNumber,
        level: c.level,
        issuedDate: c.issuedDate?.toISOString() ?? null,
        expiryDate: c.expiryDate?.toISOString() ?? null,
        isActive: c.isActive,
      })),
      recentWorkOrders: employee.WorkOrderAssignments.map((a) => ({
        id: a.WorkOrder.id,
        workOrderNumber: a.WorkOrder.workOrderNumber,
        description: a.WorkOrder.description,
        status: a.WorkOrder.status,
        createdAt: a.WorkOrder.createdAt.toISOString(),
        vehicle: a.WorkOrder.Vehicle
          ? {
              make: a.WorkOrder.Vehicle.make,
              model: a.WorkOrder.Vehicle.model,
              year: a.WorkOrder.Vehicle.year,
              unitNumber: a.WorkOrder.Vehicle.unitNumber,
            }
          : null,
      })),
      stats: {
        todayHours: Math.round(todayHours * 10) / 10,
        weekHours: Math.round(weekHours * 10) / 10,
        jobsCompleted,
        billableEfficiency,
        revenueGenerated: Math.round(revenueGenerated * 100) / 100,
      },
      createdAt: employee.createdAt.toISOString(),
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const existing = await prisma.employeeProfile.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateEmployeeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.role !== undefined) updateData.role = data.role
    if (data.payRate !== undefined) updateData.payRate = data.payRate
    if (data.payType !== undefined) updateData.payType = data.payType
    if (data.overtimeRate !== undefined) updateData.overtimeRate = data.overtimeRate
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl
    if (data.specializations !== undefined) updateData.specializations = data.specializations
    if (data.status !== undefined) updateData.status = data.status
    if (data.pin !== undefined) updateData.pin = data.pin
    if (data.hireDate !== undefined) updateData.hireDate = data.hireDate ? new Date(data.hireDate) : null
    if (data.address !== undefined) updateData.address = data.address
    if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact
    if (data.emergencyPhone !== undefined) updateData.emergencyPhone = data.emergencyPhone
    if (data.notes !== undefined) updateData.notes = data.notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const updated = await prisma.employeeProfile.update({
      where: { id },
      data: updateData,
      include: { User: { select: { email: true } } },
    })

    // Also update the User record name/role if changed
    if (data.name || data.role) {
      const userUpdate: Record<string, unknown> = {}
      if (data.name) userUpdate.name = data.name
      if (data.role) userUpdate.role = data.role
      await prisma.user.update({ where: { id: existing.userId }, data: userUpdate })
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      role: updated.role,
      payRate: updated.payRate,
      payType: updated.payType,
      status: updated.status,
      email: updated.User.email,
    })
  } catch (error) {
    console.error("PATCH /api/employees/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const existing = await prisma.employeeProfile.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Soft delete
    await prisma.employeeProfile.update({
      where: { id },
      data: { deletedAt: new Date(), status: "inactive" },
    })

    await prisma.user.update({
      where: { id: existing.userId },
      data: { isActive: false, deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/employees/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    )
  }
}

// Helper: compute hours from punch records
function computeHoursFromPunches(
  punches: { type: string; timestamp: Date }[],
  now: Date
): number {
  let totalMs = 0
  let clockInTime: Date | null = null
  let onBreak = false
  let breakStartTime: Date | null = null

  for (const punch of punches) {
    if (punch.type === "CLOCK_IN") {
      clockInTime = punch.timestamp
      onBreak = false
      breakStartTime = null
    } else if (punch.type === "CLOCK_OUT" && clockInTime) {
      let worked = punch.timestamp.getTime() - clockInTime.getTime()
      totalMs += worked
      clockInTime = null
    } else if (punch.type === "BREAK_START" && clockInTime) {
      breakStartTime = punch.timestamp
      onBreak = true
    } else if (punch.type === "BREAK_END" && onBreak && breakStartTime && clockInTime) {
      // Subtract break time by advancing clock-in
      onBreak = false
      breakStartTime = null
    }
  }

  // If still clocked in, count up to now
  if (clockInTime) {
    totalMs += now.getTime() - clockInTime.getTime()
  }

  return totalMs / (1000 * 60 * 60)
}
