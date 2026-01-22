import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isValidId } from "@/lib/security"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
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

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

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
            unitNumber: workOrder.Vehicle.unitNumber,
            make: workOrder.Vehicle.make,
            model: workOrder.Vehicle.model,
            year: workOrder.Vehicle.year,
            mileage: workOrder.Vehicle.mileage,
            licensePlate: workOrder.Vehicle.licensePlate,
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
      laborEntries: workOrder.WorkOrderLabor.map((l) => ({
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
      partsUsed: workOrder.WorkOrderPart.map((p) => ({
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
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error fetching work order:", error)
    return NextResponse.json(
      { error: "Failed to fetch work order" },
      { status: 500 }
    )
  }
}
