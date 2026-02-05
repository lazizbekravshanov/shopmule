import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"
import { isValidId } from "@/lib/security"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication (supports both session and Bearer token)
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid vehicle ID format" },
        { status: 400 }
      )
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        Customer: true,
      },
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    // Transform response
    const response = {
      id: vehicle.id,
      vin: vehicle.vin,
      unitNumber: vehicle.unitNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      licensePlate: vehicle.licensePlate,
      customerId: vehicle.customerId,
      customer: vehicle.Customer
        ? {
            id: vehicle.Customer.id,
            name: vehicle.Customer.name,
            contactName: vehicle.Customer.contactName,
            phone: vehicle.Customer.phone,
            email: vehicle.Customer.email,
          }
        : undefined,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    )
  }
}
