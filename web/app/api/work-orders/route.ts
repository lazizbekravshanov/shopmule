import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { isValidId } from "@/lib/security"
import { verifyMobileAuth } from "@/lib/mobile-auth"

const createWorkOrderSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  description: z.string().min(1, "Description is required").max(5000),
  notes: z.string().max(5000).optional(),
  checklist: z.string().max(5000).optional(),
})

export async function GET(request: Request) {
  try {
    // Verify authentication (supports both session and Bearer token)
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = authResult.tenantId ?? undefined

    const { searchParams } = new URL(request.url)
    const summary = searchParams.get("summary") === "true"
    const fieldsParam = searchParams.get("fields")
    const limitParam = searchParams.get("limit")
    const offsetParam = searchParams.get("offset")
    const vehicleId = searchParams.get("vehicleId")
    // Only apply limit/offset if explicitly provided (not null)
    const take = limitParam !== null ? Math.max(1, Math.min(100, parseInt(limitParam, 10) || 100)) : undefined
    const skip = offsetParam !== null ? Math.max(0, parseInt(offsetParam, 10) || 0) : undefined

    // Tenant scope: if tenantId is available, filter by it; otherwise allow (single-tenant fallback)
    const tenantFilter = tenantId ? { tenantId } : {}

    if (summary) {
      const limit = take ?? 5

      const [total, open, recentOrders] = await prisma.$transaction([
        prisma.workOrder.count({ where: tenantFilter }),
        prisma.workOrder.count({
          where: {
            ...tenantFilter,
            status: {
              not: "COMPLETED",
            },
          },
        }),
        prisma.workOrder.findMany({
          where: tenantFilter,
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

      const statusCounts = await prisma.workOrder.groupBy({
        by: ["status"],
        where: tenantFilter,
        _count: { _all: true },
      })

      const activeCustomers = await prisma.vehicle.findMany({
        where: {
          WorkOrders: {
            some: {
              ...tenantFilter,
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
      "laborTotal",
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
      "vehicle.currentMileage",
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
      "vehicle.currentMileage",
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

    // Build where clause for filtering (always scope to tenant)
    const whereClause = { ...tenantFilter, ...(vehicleId ? { vehicleId } : {}) }

    // ── Field-selection path (mobile / lightweight clients) ──────────────────
    if (selectedFields && selectedFields.size > 0) {
      const wos = await prisma.workOrder.findMany({
        where: whereClause,
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
          laborTotal: selectedFields.has("laborTotal"),
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
                  currentMileage: useDefaultVehicleFields || selectedFields.has("vehicle.currentMileage"),
                  licensePlate: useDefaultVehicleFields || selectedFields.has("vehicle.licensePlate"),
                  customerId: useDefaultVehicleFields || selectedFields.has("vehicle.customerId"),
                  Customer: selectedFields.has("vehicle.customer")
                    ? { select: { id: true, name: true, phone: true, email: true } }
                    : false,
                },
              }
            : false,
        },
      })

      // Dynamic select result — narrowed as needed with explicit property access
      const transformed = wos.map((wo) => {
        const v = (wo as { Vehicle?: Record<string, unknown> | null }).Vehicle
        const vehicle = v
          ? {
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.id") ? { id: v["id"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.vin") ? { vin: v["vin"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.unitNumber") ? { unitNumber: v["unitNumber"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.make") ? { make: v["make"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.model") ? { model: v["model"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.year") ? { year: v["year"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.currentMileage") ? { mileage: v["currentMileage"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.licensePlate") ? { licensePlate: v["licensePlate"] } : {}),
              ...(useDefaultVehicleFields || selectedFields.has("vehicle.customerId") ? { customerId: v["customerId"] } : {}),
              ...(selectedFields.has("vehicle.customer")
                ? {
                    customer: (v["Customer"] as Record<string, unknown> | null)
                      ? { id: (v["Customer"] as Record<string, unknown>)["id"], name: (v["Customer"] as Record<string, unknown>)["name"], phone: (v["Customer"] as Record<string, unknown>)["phone"], email: (v["Customer"] as Record<string, unknown>)["email"] }
                      : undefined,
                  }
                : {}),
            }
          : undefined

        const r = wo as Record<string, unknown>
        return {
          ...(selectedFields.has("id") ? { id: r["id"] } : {}),
          ...(selectedFields.has("vehicleId") ? { vehicleId: r["vehicleId"] } : {}),
          ...(selectedFields.has("status") ? { status: r["status"] } : {}),
          ...(selectedFields.has("description") ? { description: r["description"] } : {}),
          ...(selectedFields.has("checklist") ? { checklist: r["checklist"] } : {}),
          ...(selectedFields.has("notes") ? { notes: r["notes"] } : {}),
          ...(selectedFields.has("laborTotal") ? { laborHours: r["laborTotal"] } : {}),
          ...(selectedFields.has("partsTotal") ? { partsTotal: r["partsTotal"] } : {}),
          ...(selectedFields.has("laborRate") ? { laborRate: r["laborRate"] } : {}),
          ...(selectedFields.has("createdAt") ? { createdAt: (r["createdAt"] as Date | undefined)?.toISOString?.() } : {}),
          ...(selectedFields.has("updatedAt") ? { updatedAt: (r["updatedAt"] as Date | undefined)?.toISOString?.() } : {}),
          ...(includeVehicle ? { vehicle } : {}),
        }
      })

      return NextResponse.json(transformed)
    }

    // ── Default full-include path ─────────────────────────────────────────────
    const wos = await prisma.workOrder.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        Vehicle: { include: { Customer: true } },
        Assignments: { include: { EmployeeProfile: true } },
        Labor: { include: { EmployeeProfile: true } },
        Parts: { include: { Part: true } },
      },
    })

    console.log("GET /api/work-orders - found", wos.length, "work orders")

    const transformed = wos.map((wo) => ({
      id: wo.id,
      vehicleId: wo.vehicleId,
      status: wo.status,
      description: wo.description,
      checklist: wo.checklist,
      notes: wo.notes,
      laborHours: wo.laborTotal,
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
            mileage: wo.Vehicle.currentMileage,
            licensePlate: wo.Vehicle.licensePlate,
            customerId: wo.Vehicle.customerId,
            customer: wo.Vehicle.Customer
              ? { id: wo.Vehicle.Customer.id, name: wo.Vehicle.Customer.name, phone: wo.Vehicle.Customer.phone, email: wo.Vehicle.Customer.email }
              : undefined,
          }
        : undefined,
      assignments: wo.Assignments.map((a) => ({
        employee: a.EmployeeProfile
          ? { id: a.EmployeeProfile.id, name: a.EmployeeProfile.name, role: a.EmployeeProfile.role }
          : undefined,
      })),
      laborEntries: wo.Labor.map((l) => ({
        id: l.id,
        hours: l.hours,
        rate: l.rate,
        note: l.note,
        employee: l.EmployeeProfile
          ? { id: l.EmployeeProfile.id, name: l.EmployeeProfile.name, role: l.EmployeeProfile.role }
          : undefined,
      })),
      partsUsed: wo.Parts.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        markupPct: p.markupPct,
        part: p.Part
          ? { id: p.Part.id, sku: p.Part.sku, name: p.Part.name, category: p.Part.category, cost: p.Part.cost, price: p.Part.price, stock: p.Part.stock, reorderPoint: p.Part.reorderPoint }
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
    // Verify authentication (supports both session and Bearer token)
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated) {
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

    const callerTenantId = authResult.tenantId ?? undefined
    if (!vehicle || (callerTenantId && vehicle.tenantId !== callerTenantId)) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const woCount = await prisma.workOrder.count({ where: { tenantId: vehicle.tenantId } })
    const workOrderNumber = `WO-${new Date().getFullYear()}-${String(woCount + 1).padStart(5, "0")}`

    const workOrder = await prisma.workOrder.create({
      data: {
        tenantId: vehicle.tenantId,
        customerId: vehicle.customerId,
        vehicleId: data.vehicleId,
        workOrderNumber,
        description: data.description,
        notes: data.notes || null,
        checklist: data.checklist || null,
        status: "DIAGNOSED",
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
      laborHours: workOrder.laborTotal,
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
