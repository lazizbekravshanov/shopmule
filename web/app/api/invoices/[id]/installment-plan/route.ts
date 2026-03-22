import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isValidId } from "@/lib/security";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  numberOfPayments: z.number().min(2).max(6).default(4),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).default("BIWEEKLY"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: { InstallmentPlan: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.InstallmentPlan) {
      return NextResponse.json({ error: "Installment plan already exists" }, { status: 400 });
    }

    if (invoice.status === "PAID" || invoice.status === "VOID") {
      return NextResponse.json({ error: "Invoice is already paid or voided" }, { status: 400 });
    }

    const remainingBalance = invoice.total - invoice.amountPaid;
    if (remainingBalance <= 0) {
      return NextResponse.json({ error: "No balance due" }, { status: 400 });
    }

    // Calculate installment schedule: 25% down payment + equal remaining payments
    const downPayment = Math.round(remainingBalance * 0.25 * 100) / 100;
    const remainingAfterDown = remainingBalance - downPayment;
    const regularPayment = Math.round((remainingAfterDown / (data.numberOfPayments - 1)) * 100) / 100;
    // Adjust last payment for rounding
    const lastPayment = Math.round((remainingAfterDown - regularPayment * (data.numberOfPayments - 2)) * 100) / 100;

    const frequencyDays = data.frequency === "WEEKLY" ? 7 : data.frequency === "BIWEEKLY" ? 14 : 30;

    const installments = [];
    for (let i = 0; i < data.numberOfPayments; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i * frequencyDays);

      let amount: number;
      if (i === 0) amount = downPayment;
      else if (i === data.numberOfPayments - 1) amount = lastPayment;
      else amount = regularPayment;

      installments.push({
        sequenceNumber: i + 1,
        amount,
        dueDate,
        status: i === 0 ? "DUE" as const : "UPCOMING" as const,
      });
    }

    const plan = await prisma.installmentPlan.create({
      data: {
        invoiceId: id,
        totalAmount: remainingBalance,
        numberOfPayments: data.numberOfPayments,
        frequency: data.frequency,
        Payments: { create: installments },
      },
      include: { Payments: { orderBy: { sequenceNumber: "asc" } } },
    });

    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.flatten() }, { status: 400 });
    }
    console.error("[Installment Plan Error]", error);
    return NextResponse.json({ error: "Failed to create installment plan" }, { status: 500 });
  }
}
