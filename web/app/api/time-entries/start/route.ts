import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const startTimeEntrySchema = z.object({
  workOrderId: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find employee profile for this user
  const employee = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!employee) {
    return NextResponse.json(
      { error: "Employee profile not found" },
      { status: 404 }
    )
  }

  // Check if already has open time entry
  const existingEntry = await prisma.timeEntry.findFirst({
    where: {
      employeeId: employee.id,
      clockOut: null,
    },
  })

  if (existingEntry) {
    return NextResponse.json({ error: "Already tracking time" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const data = startTimeEntrySchema.parse(body)

    // Verify work order exists if provided
    if (data.workOrderId) {
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: data.workOrderId },
      })

      if (!workOrder) {
        return NextResponse.json({ error: "Invalid work order" }, { status: 400 })
      }
    }

    const entry = await prisma.timeEntry.create({
      data: {
        employeeId: employee.id,
        clockIn: new Date(),
        jobId: data.workOrderId || null,
      },
    })

    return NextResponse.json({ id: entry.id, clockIn: entry.clockIn })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
