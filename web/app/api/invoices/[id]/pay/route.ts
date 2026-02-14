import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const paymentSchema = z.object({
  method: z.enum(["CASH", "CHECK", "CREDIT_CARD", "BANK_TRANSFER", "OTHER"]),
  amount: z.number().positive("Amount must be positive"),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const parsed = paymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { method, amount } = parsed.data

    // Get invoice with existing payments
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        LegacyPayments: true,
        Customer: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Calculate total paid so far
    const totalPaid = invoice.LegacyPayments.reduce((sum, p) => sum + p.amount, 0)
    const remainingBalance = invoice.total - totalPaid

    if (amount > remainingBalance) {
      return NextResponse.json(
        { error: `Amount exceeds remaining balance of $${remainingBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        method,
        amount,
        receivedAt: new Date(),
      },
    })

    // Update invoice status
    const newTotalPaid = totalPaid + amount
    const newStatus = newTotalPaid >= invoice.total ? "PAID" : "PARTIAL"

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: newStatus },
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        method: payment.method,
        amount: payment.amount,
        receivedAt: payment.receivedAt.toISOString(),
      },
      invoice: {
        id: invoice.id,
        status: newStatus,
        total: invoice.total,
        totalPaid: newTotalPaid,
        remainingBalance: invoice.total - newTotalPaid,
      },
    })
  } catch (error) {
    console.error("POST /api/invoices/[id]/pay error:", error)
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    )
  }
}
