import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { isValidId } from "@/lib/security"

const updateStatusSchema = z.object({
  status: z.enum(["DIAGNOSED", "APPROVED", "IN_PROGRESS", "COMPLETED"]),
})

export async function PATCH(
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

    const body = await request.json()
    const data = updateStatusSchema.parse(body)

    // Verify work order exists
    const existingOrder = await prisma.workOrder.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: {
        Vehicle: {
          include: {
            Customer: true,
          },
        },
      },
    })

    const transformed = {
      id: workOrder.id,
      vehicleId: workOrder.vehicleId,
      status: workOrder.status,
      description: workOrder.description,
      notes: workOrder.notes,
      vehicle: workOrder.Vehicle
        ? {
            id: workOrder.Vehicle.id,
            vin: workOrder.Vehicle.vin,
            make: workOrder.Vehicle.make,
            model: workOrder.Vehicle.model,
            year: workOrder.Vehicle.year,
            customerId: workOrder.Vehicle.customerId,
          }
        : undefined,
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error updating work order status:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update work order status" },
      { status: 500 }
    )
  }
}
