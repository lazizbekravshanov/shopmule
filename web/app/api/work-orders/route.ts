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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("GET /api/work-orders - session:", session ? "exists" : "null")
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const summary = searchParams.get("summary") === "true"
    const fieldsParam = searchParams.get("fields")
    const limitParam = searchParams.get("limit")
    const offsetParam = searchParams.get("offset")
    // Only apply limit/offset if explicitly provided (not null)
    const take = limitParam !== null ? Math.max(1, Math.min(100, parseInt(limitParam, 10) || 100)) : undefined
    const skip = offsetParam !== null ? Math.max(0, parseInt(offsetParam, 10) || 0) : undefined

    if (summary) {
      const limit = take ?? 5

      const [total, open, statusCounts, recentOrders] = await prisma.$transaction([
        prisma.workOrder.count(),
        prisma.workOrder.count({
          where: {
            status: {
              not: "COMPLETED",
            },
          },
        }),
        prisma.workOrder.groupBy({
          by: ["status"],
          _count: {
            _all: true,
          },
        }),
        prisma.workOrder.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            status: true,
            description: true,
            Vehicle: {
              select: {
                make: true,
                model: true,
                customerId: true,
              },
            },
          },
        }),
      ])

      const activeCustomers = await prisma.vehicle.findMany({
        where: {
          WorkOrder: {
            some: {
              status: {
                not: "COMPLETED",
              },
            },
          },
        },
        select: {
          customerId: true,
        },
        distinct: ["customerId"],
      })

      const byStatus = statusCounts.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count._all
        return acc
      }, {})

      const recent = recentOrders.map((order) => ({
        id: order.id,
        status: order.status,
        description: order.description,
        vehicle: order.Vehicle
          ? {
              make: order.Vehicle.make,
              model: order.Vehicle.model,
              customerId: order.Vehicle.customerId,
            }
          : undefined,
      }))

      return NextResponse.json({
        total,
        open,
        activeCustomers: activeCustomers.length,
        byStatus,
        recent,
      })
    }

    const allowedFields = new Set([
      "id",
      "vehicleId",
      "status",
      "description",
      "checklist",
      "notes",
      "laborHours",
      "partsTotal",
      "laborRate",
      "createdAt",
      "updatedAt",
      "vehicle",
      "vehicle.id",
      "vehicle.vin",
      "vehicle.unitNumber",
      "vehicle.make",
      "vehicle.model",
      "vehicle.year",
      "vehicle.mileage",
      "vehicle.licensePlate",
      "vehicle.customerId",
      "vehicle.customer",
    ])

    const selectedFields = fieldsParam
      ? new Set(
          fieldsParam
            .split(",")
            .map((field) => field.trim())
            .filter((field) => allowedFields.has(field))
        )
      : null

    const vehicleFieldKeys = [
      "vehicle.id",
      "vehicle.vin",
      "vehicle.unitNumber",
      "vehicle.make",
      "vehicle.model",
      "vehicle.year",
      "vehicle.mileage",
      "vehicle.licensePlate",
      "vehicle.customerId",
      "vehicle.customer",
    ]

    const hasVehicleFields = selectedFields
      ? vehicleFieldKeys.some((field) => selectedFields.has(field))
      : false
    const includeVehicle = selectedFields
      ? selectedFields.has("vehicle") || hasVehicleFields
      : false
    const useDefaultVehicleFields = selectedFields
      ? selectedFields.has("vehicle") && !hasVehicleFields
      : false

    const workOrders = selectedFields && selectedFields.size > 0
      ? await prisma.workOrder.findMany({
          orderBy: { createdAt: "desc" },
          take,
          skip,
          select: {
            id: selectedFields.has("id"),
            vehicleId: selectedFields.has("vehicleId"),
            status: selectedFields.has("status"),
            description: selectedFields.has("description"),
            checklist: selectedFields.has("checklist"),
            notes: selectedFields.has("notes"),
            laborHours: selectedFields.has("laborHours"),
            partsTotal: selectedFields.has("partsTotal"),
            laborRate: selectedFields.has("laborRate"),
            createdAt: selectedFields.has("createdAt"),
            updatedAt: selectedFields.has("updatedAt"),
            Vehicle: includeVehicle
              ? {
                  select: {
                    id: useDefaultVehicleFields || selectedFields.has("vehicle.id"),
                    vin: useDefaultVehicleFields || selectedFields.has("vehicle.vin"),
                    unitNumber: useDefaultVehicleFields || selectedFields.has("vehicle.unitNumber"),
                    make: useDefaultVehicleFields || selectedFields.has("vehicle.make"),
                    model: useDefaultVehicleFields || selectedFields.has("vehicle.model"),
                    year: useDefaultVehicleFields || selectedFields.has("vehicle.year"),
                    mileage: useDefaultVehicleFields || selectedFields.has("vehicle.mileage"),
                    licensePlate: useDefaultVehicleFields || selectedFields.has("vehicle.licensePlate"),
                    customerId: useDefaultVehicleFields || selectedFields.has("vehicle.customerId"),
                    Customer: selectedFields.has("vehicle.customer")
                      ? {
                          select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true,
                          },
                        }
                      : false,
                  },
                }
              : false,
          },
        })
      : await prisma.workOrder.findMany({
          orderBy: { createdAt: "desc" },
          take,
          skip,
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

    if (selectedFields && selectedFields.size > 0) {
      const transformed = workOrders.map((wo) => {
        const vehicle = wo.Vehicle
          ? {
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.id")
                ? { id: wo.Vehicle.id }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.vin")
                ? { vin: wo.Vehicle.vin }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.unitNumber")
                ? { unitNumber: wo.Vehicle.unitNumber }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.make")
                ? { make: wo.Vehicle.make }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.model")
                ? { model: wo.Vehicle.model }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.year")
                ? { year: wo.Vehicle.year }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.mileage")
                ? { mileage: wo.Vehicle.mileage }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.licensePlate")
                ? { licensePlate: wo.Vehicle.licensePlate }
                : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.customerId")
                ? { customerId: wo.Vehicle.customerId }
                : {}),
              ...(selectedFields.has("vehicle.customer")
                ? {
                    customer: wo.Vehicle.Customer
                      ? {
                          id: wo.Vehicle.Customer.id,
                          name: wo.Vehicle.Customer.name,
                          phone: wo.Vehicle.Customer.phone,
                          email: wo.Vehicle.Customer.email,
                        }
                      : undefined,
                  }
                : {}),
            }
          : undefined

        return {
          ...(selectedFields.has("id") ? { id: wo.id } : {}),
          ...(selectedFields.has("vehicleId") ? { vehicleId: wo.vehicleId } : {}),
          ...(selectedFields.has("status") ? { status: wo.status } : {}),
          ...(selectedFields.has("description")
            ? { description: wo.description }
            : {}),
          ...(selectedFields.has("checklist") ? { checklist: wo.checklist } : {}),
          ...(selectedFields.has("notes") ? { notes: wo.notes } : {}),
          ...(selectedFields.has("laborHours") ? { laborHours: wo.laborHours } : {}),
          ...(selectedFields.has("partsTotal") ? { partsTotal: wo.partsTotal } : {}),
          ...(selectedFields.has("laborRate") ? { laborRate: wo.laborRate } : {}),
          ...(selectedFields.has("createdAt")
            ? { createdAt: wo.createdAt?.toISOString?.() }
            : {}),
          ...(selectedFields.has("updatedAt")
            ? { updatedAt: wo.updatedAt?.toISOString?.() }
            : {}),
          ...(includeVehicle ? { vehicle } : {}),
        }
      })

      return NextResponse.json(transformed)
    }

    console.log("GET /api/work-orders - found", workOrders.length, "work orders")

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
