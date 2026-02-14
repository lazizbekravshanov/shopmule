import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { isValidId } from "@/lib/security"
import { verifyMobileAuth } from "@/lib/mobile-auth"

const createVehicleSchema = z.object({
  vin: z.string().min(1, "VIN is required").max(17),
  make: z.string().min(1, "Make is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  year: z.number().int().min(1900).max(2100).optional(),
  mileage: z.number().int().min(0).optional(),
  unitNumber: z.string().max(50).optional(),
  licensePlate: z.string().max(20).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication (supports both session and Bearer token)
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: customerId } = await params

    if (!isValidId(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const body = await request.json()
    const data = createVehicleSchema.parse(body)

    // Check if VIN already exists
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { vin: data.vin },
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: "A vehicle with this VIN already exists" },
        { status: 400 }
      )
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId: customer.tenantId,
        customerId: customerId,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: data.year || null,
        currentMileage: data.mileage || null,
        unitNumber: data.unitNumber || null,
        licensePlate: data.licensePlate || null,
      },
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    )
  }
}
