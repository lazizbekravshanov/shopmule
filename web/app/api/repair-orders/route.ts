import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { RepairOrderStatus } from "@prisma/client"
import { z } from "zod"

const createRepairOrderSchema = z.object({
  customerId: z.string(),
  vehicleId: z.string().optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = createRepairOrderSchema.parse(body)

    const repairOrder = await prisma.repairOrder.create({
      data: {
        shopId: session.user.shopId,
        customerId: data.customerId,
        vehicleId: data.vehicleId || null,
        internalNotes: data.internalNotes || null,
        customerNotes: data.customerNotes || null,
        status: RepairOrderStatus.DRAFT,
      },
    })

    return NextResponse.json(repairOrder)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
