import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"

export async function GET(request: Request) {
  try {
    // Verify authentication (supports both session and Bearer token)
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vin = searchParams.get("vin")

    if (!vin) {
      return NextResponse.json(
        { error: "VIN parameter is required" },
        { status: 400 }
      )
    }

    // Validate VIN format (17 characters, alphanumeric except I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
    if (!vinRegex.test(vin)) {
      return NextResponse.json(
        { error: "Invalid VIN format" },
        { status: 400 }
      )
    }

    const normalizedVin = vin.toUpperCase()

    // Find vehicle by VIN
    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: normalizedVin },
      include: {
        Customer: true,
        WorkOrder: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
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
      vehicle: {
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
      },
      workOrders: vehicle.WorkOrder.map((wo) => ({
        id: wo.id,
        vehicleId: wo.vehicleId,
        status: wo.status,
        description: wo.description,
        notes: wo.notes,
        laborHours: wo.laborHours,
        partsTotal: wo.partsTotal,
        laborRate: wo.laborRate,
        createdAt: wo.createdAt.toISOString(),
        updatedAt: wo.updatedAt.toISOString(),
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error searching vehicle:", error)
    return NextResponse.json(
      { error: "Failed to search vehicle" },
      { status: 500 }
    )
  }
}
