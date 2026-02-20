import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isValidId } from "@/lib/security"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const workOrder = await prisma.workOrder.findUnique({ where: { id } })
    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    const body = await request.json()
    const { hours, rate, note, employeeId: bodyEmployeeId } = body

    // Resolve employeeId — use provided or fall back to session user's profile
    let employeeId = bodyEmployeeId
    if (!employeeId) {
      const profile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (!profile) {
        return NextResponse.json(
          { error: "No employee profile found for current user. Please provide an employeeId." },
          { status: 400 }
        )
      }
      employeeId = profile.id
    }

    if (!isValidId(employeeId)) {
      return NextResponse.json({ error: "Invalid employeeId" }, { status: 400 })
    }

    if (typeof hours !== "number" || hours < 0) {
      return NextResponse.json({ error: "hours must be a non-negative number" }, { status: 400 })
    }

    if (typeof rate !== "number" || rate <= 0) {
      return NextResponse.json({ error: "rate must be a positive number" }, { status: 400 })
    }

    const labor = await prisma.workOrderLabor.create({
      data: {
        workOrderId: id,
        employeeId,
        hours,
        rate,
        note: note ?? null,
      },
      include: {
        EmployeeProfile: true,
      },
    })

    return NextResponse.json({
      id: labor.id,
      workOrderId: labor.workOrderId,
      employeeId: labor.employeeId,
      hours: labor.hours,
      rate: labor.rate,
      note: labor.note,
      startedAt: labor.startedAt,
      stoppedAt: labor.stoppedAt,
      actualHours: labor.actualHours,
      employee: {
        id: labor.EmployeeProfile.id,
        name: labor.EmployeeProfile.name,
        role: labor.EmployeeProfile.role,
      },
    })
  } catch (error) {
    console.error("Error creating labor entry:", error)
    return NextResponse.json({ error: "Failed to create labor entry" }, { status: 500 })
  }
}
