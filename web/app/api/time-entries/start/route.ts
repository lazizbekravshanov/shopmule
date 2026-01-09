import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const startTimeEntrySchema = z.object({
  repairOrderId: z.string(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is clocked in
  const punch = await prisma.shiftPunch.findFirst({
    where: {
      shopId: session.user.shopId,
      userId: session.user.id,
      clockOutAt: null,
    },
  })

  if (!punch) {
    return NextResponse.json(
      { error: "Must be clocked in to start time entry" },
      { status: 400 }
    )
  }

  // Check if already has open time entry
  const existingEntry = await prisma.timeEntry.findFirst({
    where: {
      shopId: session.user.shopId,
      techId: session.user.id,
      clockOut: null,
    },
  })

  if (existingEntry) {
    return NextResponse.json({ error: "Already tracking time" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const data = startTimeEntrySchema.parse(body)

    // Verify repair order exists
    const repairOrder = await prisma.repairOrder.findFirst({
      where: {
        id: data.repairOrderId,
        shopId: session.user.shopId,
      },
    })

    if (!repairOrder) {
      return NextResponse.json({ error: "Invalid repair order" }, { status: 400 })
    }

    const entry = await prisma.timeEntry.create({
      data: {
        shopId: session.user.shopId,
        techId: session.user.id,
        repairOrderId: data.repairOrderId,
        notes: data.notes || null,
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
