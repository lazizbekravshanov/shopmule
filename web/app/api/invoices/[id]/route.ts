import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        Customer: true,
        WorkOrder: {
          include: {
            Vehicle: true,
            Parts: {
              include: {
                Part: true,
              },
            },
            Labor: {
              include: {
                EmployeeProfile: true,
              },
            },
          },
        },
        LegacyPayments: true,
      },
    })

    if (!invoice || invoice.tenantId !== tenantId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: invoice.id,
      workOrderId: invoice.workOrderId,
      customerId: invoice.customerId,
      subtotalParts: invoice.subtotalParts,
      subtotalLabor: invoice.subtotalLabor,
      tax: invoice.tax,
      discount: invoice.discount,
      total: invoice.total,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      customer: invoice.Customer
        ? {
            id: invoice.Customer.id,
            name: invoice.Customer.name,
            contactName: invoice.Customer.contactName,
            email: invoice.Customer.email,
            phone: invoice.Customer.phone,
            billingAddress: invoice.Customer.billingAddress,
          }
        : null,
      workOrder: invoice.WorkOrder
        ? {
            id: invoice.WorkOrder.id,
            description: invoice.WorkOrder.description,
            status: invoice.WorkOrder.status,
            notes: invoice.WorkOrder.notes,
            vehicle: invoice.WorkOrder.Vehicle
              ? {
                  id: invoice.WorkOrder.Vehicle.id,
                  make: invoice.WorkOrder.Vehicle.make,
                  model: invoice.WorkOrder.Vehicle.model,
                  year: invoice.WorkOrder.Vehicle.year,
                  vin: invoice.WorkOrder.Vehicle.vin,
                  licensePlate: invoice.WorkOrder.Vehicle.licensePlate,
                }
              : null,
            parts: invoice.WorkOrder.Parts.map((p) => ({
              id: p.id,
              quantity: p.quantity,
              unitPrice: p.unitPrice,
              markupPct: p.markupPct,
              total: p.quantity * p.unitPrice * (1 + p.markupPct),
              part: p.Part
                ? {
                    id: p.Part.id,
                    name: p.Part.name,
                    sku: p.Part.sku,
                  }
                : null,
            })),
            labor: invoice.WorkOrder.Labor.map((l) => ({
              id: l.id,
              hours: l.hours,
              rate: l.rate,
              total: l.hours * l.rate,
              note: l.note,
              employee: l.EmployeeProfile
                ? {
                    id: l.EmployeeProfile.id,
                    name: l.EmployeeProfile.name,
                  }
                : null,
            })),
          }
        : null,
      payments: invoice.LegacyPayments.map((p) => ({
        id: p.id,
        method: p.method,
        amount: p.amount,
        receivedAt: p.receivedAt.toISOString(),
        stripePaymentIntentId: p.stripePaymentIntentId,
      })),
    })
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    )
  }
}
