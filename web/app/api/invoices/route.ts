import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createInvoiceSchema = z.object({
  workOrderId: z.string().min(1, "Work order ID is required"),
  taxRate: z.number().min(0).max(1).optional().default(0.08),
  discount: z.number().min(0).optional().default(0),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        Customer: true,
        WorkOrder: {
          include: {
            Vehicle: true,
          },
        },
        LegacyPayments: true,
      },
    })

    const transformed = invoices.map((inv) => ({
      id: inv.id,
      workOrderId: inv.workOrderId,
      customerId: inv.customerId,
      subtotalParts: inv.subtotalParts,
      subtotalLabor: inv.subtotalLabor,
      tax: inv.tax,
      discount: inv.discount,
      total: inv.total,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      customer: inv.Customer
        ? {
            id: inv.Customer.id,
            name: inv.Customer.name,
            email: inv.Customer.email,
            phone: inv.Customer.phone,
          }
        : null,
      workOrder: inv.WorkOrder
        ? {
            id: inv.WorkOrder.id,
            description: inv.WorkOrder.description,
            status: inv.WorkOrder.status,
            vehicle: inv.WorkOrder.Vehicle
              ? {
                  id: inv.WorkOrder.Vehicle.id,
                  make: inv.WorkOrder.Vehicle.make,
                  model: inv.WorkOrder.Vehicle.model,
                  year: inv.WorkOrder.Vehicle.year,
                  vin: inv.WorkOrder.Vehicle.vin,
                }
              : null,
          }
        : null,
      payments: inv.LegacyPayments.map((p) => ({
        id: p.id,
        method: p.method,
        amount: p.amount,
        receivedAt: p.receivedAt.toISOString(),
      })),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("GET /api/invoices error:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
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
    const parsed = createInvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { workOrderId, taxRate, discount } = parsed.data

    // Check if invoice already exists for this work order
    const existingInvoice = await prisma.invoice.findUnique({
      where: { workOrderId },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists for this work order" },
        { status: 400 }
      )
    }

    // Get work order with parts and labor
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        Vehicle: {
          include: {
            Customer: true,
          },
        },
        Parts: {
          include: {
            Part: true,
          },
        },
        Labor: true,
      },
    })

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

    if (!workOrder.Vehicle?.Customer) {
      return NextResponse.json(
        { error: "Work order must have a customer" },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotalParts = workOrder.Parts.reduce((sum, p) => {
      const partTotal = p.quantity * p.unitPrice * (1 + p.markupPct)
      return sum + partTotal
    }, 0)

    const subtotalLabor = workOrder.Labor.reduce((sum, l) => {
      return sum + l.hours * l.rate
    }, 0)

    const subtotal = subtotalParts + subtotalLabor
    const tax = subtotal * taxRate
    const total = subtotal + tax - discount

    // Get tenantId from session user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant associated with user" }, { status: 400 })
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({ where: { tenantId: user.tenantId } })
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: user.tenantId,
        invoiceNumber,
        workOrderId,
        customerId: workOrder.Vehicle.Customer.id,
        subtotalParts,
        subtotalLabor,
        tax,
        discount,
        total,
        status: "UNPAID",
      },
      include: {
        Customer: true,
        WorkOrder: {
          include: {
            Vehicle: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
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
        customer: invoice.Customer
          ? {
              id: invoice.Customer.id,
              name: invoice.Customer.name,
              email: invoice.Customer.email,
              phone: invoice.Customer.phone,
            }
          : null,
        workOrder: invoice.WorkOrder
          ? {
              id: invoice.WorkOrder.id,
              description: invoice.WorkOrder.description,
              vehicle: invoice.WorkOrder.Vehicle
                ? {
                    make: invoice.WorkOrder.Vehicle.make,
                    model: invoice.WorkOrder.Vehicle.model,
                    year: invoice.WorkOrder.Vehicle.year,
                  }
                : null,
            }
          : null,
        payments: [],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/invoices error:", error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}
