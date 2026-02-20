import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isValidId } from "@/lib/security"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; laborId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, laborId } = await params

    if (!isValidId(id) || !isValidId(laborId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const existing = await prisma.workOrderLabor.findUnique({
      where: { id: laborId },
    })

    if (!existing || existing.workOrderId !== id) {
      return NextResponse.json({ error: "Labor entry not found" }, { status: 404 })
    }

    const body = await request.json()
    const { action, hours, rate, note } = body

    let updateData: Record<string, unknown> = {}

    if (action === "start") {
      if (existing.startedAt && !existing.stoppedAt) {
        return NextResponse.json({ error: "Timer is already running" }, { status: 400 })
      }
      updateData = {
        startedAt: new Date(),
        stoppedAt: null,
        actualHours: null,
      }
    } else if (action === "stop") {
      if (!existing.startedAt) {
        return NextResponse.json({ error: "Timer has not been started" }, { status: 400 })
      }
      if (existing.stoppedAt) {
        return NextResponse.json({ error: "Timer is already stopped" }, { status: 400 })
      }
      const now = new Date()
      const elapsedMs = now.getTime() - existing.startedAt.getTime()
      const actualHours = parseFloat((elapsedMs / 3_600_000).toFixed(4))
      updateData = {
        stoppedAt: now,
        actualHours,
      }
    } else {
      // Plain field update (hours, rate, note)
      if (hours !== undefined) {
        if (typeof hours !== "number" || hours < 0) {
          return NextResponse.json({ error: "hours must be a non-negative number" }, { status: 400 })
        }
        updateData.hours = hours
      }
      if (rate !== undefined) {
        if (typeof rate !== "number" || rate <= 0) {
          return NextResponse.json({ error: "rate must be a positive number" }, { status: 400 })
        }
        updateData.rate = rate
      }
      if (note !== undefined) {
        updateData.note = note
      }
    }

    const updated = await prisma.workOrderLabor.update({
      where: { id: laborId },
      data: updateData,
      include: { EmployeeProfile: true },
    })

    return NextResponse.json({
      id: updated.id,
      workOrderId: updated.workOrderId,
      employeeId: updated.employeeId,
      hours: updated.hours,
      rate: updated.rate,
      note: updated.note,
      startedAt: updated.startedAt,
      stoppedAt: updated.stoppedAt,
      actualHours: updated.actualHours,
      employee: {
        id: updated.EmployeeProfile.id,
        name: updated.EmployeeProfile.name,
        role: updated.EmployeeProfile.role,
      },
    })
  } catch (error) {
    console.error("Error updating labor entry:", error)
    return NextResponse.json({ error: "Failed to update labor entry" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; laborId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, laborId } = await params

    if (!isValidId(id) || !isValidId(laborId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const existing = await prisma.workOrderLabor.findUnique({
      where: { id: laborId },
    })

    if (!existing || existing.workOrderId !== id) {
      return NextResponse.json({ error: "Labor entry not found" }, { status: 404 })
    }

    await prisma.workOrderLabor.delete({ where: { id: laborId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting labor entry:", error)
    return NextResponse.json({ error: "Failed to delete labor entry" }, { status: 500 })
  }
}
