import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { isValidId } from "@/lib/security"

const createWorkOrderSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  description: z.string().min(1, "Description is required").max(5000),
  notes: z.string().max(5000).optional(),
  checklist: z.string().max(5000).optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workOrders = await prisma.workOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        Vehicle: {
          include: {
            Customer: true,
          },
        },
        WorkOrderAssignment: {
          include: {
            EmployeeProfile: true,
          },
        },
        WorkOrderLabor: {
          include: {
            EmployeeProfile: true,
          },
        },
        WorkOrderPart: {
          include: {
            Part: true,
          },
        },
      },
    })

    // Transform to match frontend expected format
    const transformed = workOrders.map((wo) => ({
      id: wo.id,
      vehicleId: wo.vehicleId,
      status: wo.status,
      description: wo.description,
      checklist: wo.checklist,
      notes: wo.notes,
      laborHours: wo.laborHours,
      partsTotal: wo.partsTotal,
      laborRate: wo.laborRate,
      vehicle: wo.Vehicle
        ? {
            id: wo.Vehicle.id,
            vin: wo.Vehicle.vin,
            unitNumber: wo.Vehicle.unitNumber,
            make: wo.Vehicle.make,
            model: wo.Vehicle.model,
            year: wo.Vehicle.year,
            mileage: wo.Vehicle.mileage,
            licensePlate: wo.Vehicle.licensePlate,
            customerId: wo.Vehicle.customerId,
            customer: wo.Vehicle.Customer
              ? {
                  id: wo.Vehicle.Customer.id,
                  name: wo.Vehicle.Customer.name,
                  phone: wo.Vehicle.Customer.phone,
                  email: wo.Vehicle.Customer.email,
                }
              : undefined,
          }
        : undefined,
      assignments: wo.WorkOrderAssignment.map((a) => ({
        employee: a.EmployeeProfile
          ? {
              id: a.EmployeeProfile.id,
              name: a.EmployeeProfile.name,
              role: a.EmployeeProfile.role,
            }
          : undefined,
      })),
      laborEntries: wo.WorkOrderLabor.map((l) => ({
        id: l.id,
        hours: l.hours,
        rate: l.rate,
        note: l.note,
        employee: l.EmployeeProfile
          ? {
              id: l.EmployeeProfile.id,
              name: l.EmployeeProfile.name,
              role: l.EmployeeProfile.role,
            }
          : undefined,
      })),
      partsUsed: wo.WorkOrderPart.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        markupPct: p.markupPct,
        part: p.Part
          ? {
              id: p.Part.id,
              sku: p.Part.sku,
              name: p.Part.name,
              category: p.Part.category,
              cost: p.Part.cost,
              price: p.Part.price,
              stock: p.Part.stock,
              reorderPoint: p.Part.reorderPoint,
            }
          : undefined,
      })),
      createdAt: wo.createdAt.toISOString(),
      updatedAt: wo.updatedAt.toISOString(),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error fetching work orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch work orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createWorkOrderSchema.parse(body)

    if (!isValidId(data.vehicleId)) {
      return NextResponse.json(
        { error: "Invalid vehicle ID format" },
        { status: 400 }
      )
    }

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: { Customer: true },
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        vehicleId: data.vehicleId,
        description: data.description,
        notes: data.notes || null,
        checklist: data.checklist || null,
        status: "DIAGNOSED",
        laborHours: 0,
        partsTotal: 0,
        laborRate: 125,
      },
      include: {
        Vehicle: {
          include: {
            Customer: true,
          },
        },
      },
    })

    // Transform response
    const transformed = {
      id: workOrder.id,
      vehicleId: workOrder.vehicleId,
      status: workOrder.status,
      description: workOrder.description,
      checklist: workOrder.checklist,
      notes: workOrder.notes,
      laborHours: workOrder.laborHours,
      partsTotal: workOrder.partsTotal,
      laborRate: workOrder.laborRate,
      vehicle: workOrder.Vehicle
        ? {
            id: workOrder.Vehicle.id,
            vin: workOrder.Vehicle.vin,
            make: workOrder.Vehicle.make,
            model: workOrder.Vehicle.model,
            year: workOrder.Vehicle.year,
            customerId: workOrder.Vehicle.customerId,
            customer: workOrder.Vehicle.Customer
              ? {
                  id: workOrder.Vehicle.Customer.id,
                  name: workOrder.Vehicle.Customer.name,
                  phone: workOrder.Vehicle.Customer.phone,
                  email: workOrder.Vehicle.Customer.email,
                }
              : undefined,
          }
        : undefined,
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
    }

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error("Error creating work order:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create work order" },
      { status: 500 }
    )
  }
}
