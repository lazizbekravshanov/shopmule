import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isValidId } from "@/lib/security"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { id } = await params

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
        Assignments: {
          include: {
            EmployeeProfile: true,
          },
        },
        Labor: {
          include: {
            EmployeeProfile: true,
          },
        },
        Parts: {
          include: {
            Part: true,
          },
        },
      },
    })

    if (!workOrder || workOrder.tenantId !== tenantId) {
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
      partsStatus: workOrder.partsStatus ?? null,
      laborHours: workOrder.laborTotal,
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
            mileage: workOrder.Vehicle.currentMileage,
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
      laborEntries: workOrder.Labor.map((l) => ({
        id: l.id,
        hours: l.hours,
        rate: l.rate,
        note: l.note,
        startedAt: l.startedAt?.toISOString() ?? null,
        stoppedAt: l.stoppedAt?.toISOString() ?? null,
        actualHours: l.actualHours ?? null,
        employee: l.EmployeeProfile
          ? {
              id: l.EmployeeProfile.id,
              name: l.EmployeeProfile.name,
              role: l.EmployeeProfile.role,
            }
          : undefined,
      })),
      partsUsed: workOrder.Parts.map((p) => ({
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { id } = await params

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const existing = await prisma.workOrder.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    // Only allow patching safe fields
    if (body.checklist !== undefined) {
      if (body.checklist !== null && typeof body.checklist !== "string") {
        return NextResponse.json({ error: "checklist must be a string or null" }, { status: 400 })
      }
      if (body.checklist && body.checklist.length > 50000) {
        return NextResponse.json({ error: "checklist too large" }, { status: 400 })
      }
      updateData.checklist = body.checklist
    }

    if (body.notes !== undefined) {
      if (typeof body.notes !== "string") {
        return NextResponse.json({ error: "notes must be a string" }, { status: 400 })
      }
      updateData.notes = body.notes
    }

    if (body.partsStatus !== undefined) {
      const valid = ['WAITING', 'ORDERED', 'IN_STOCK', null]
      if (!valid.includes(body.partsStatus)) {
        return NextResponse.json({ error: "partsStatus must be WAITING, ORDERED, IN_STOCK, or null" }, { status: 400 })
      }
      updateData.partsStatus = body.partsStatus
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const updated = await prisma.workOrder.update({ where: { id }, data: updateData })

    return NextResponse.json({ id: updated.id, checklist: updated.checklist, notes: updated.notes, partsStatus: updated.partsStatus ?? null })
  } catch (error) {
    console.error("Error patching work order:", error)
    return NextResponse.json({ error: "Failed to update work order" }, { status: 500 })
  }
}
