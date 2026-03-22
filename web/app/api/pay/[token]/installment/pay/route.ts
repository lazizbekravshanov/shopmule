import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const hash = hashToken(token);

    const invoice = await prisma.invoice.findFirst({
      where: {
        portalTokenHash: hash,
        portalTokenExpiresAt: { gt: new Date() },
      },
      include: {
        InstallmentPlan: {
          include: {
            Payments: { orderBy: { sequenceNumber: "asc" } },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invalid or expired payment link" }, { status: 404 });
    }

    const plan = invoice.InstallmentPlan;
    if (!plan) {
      return NextResponse.json({ error: "No installment plan found" }, { status: 400 });
    }

    // Find next unpaid installment
    const nextPayment = plan.Payments.find(
      (p) => p.status === "DUE" || p.status === "UPCOMING" || p.status === "OVERDUE"
    );

    if (!nextPayment) {
      return NextResponse.json({ error: "All installments are paid" }, { status: 400 });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(nextPayment.amount * 100),
      currency: "usd",
      metadata: {
        invoiceId: invoice.id,
        installmentPlanId: plan.id,
        installmentPaymentId: nextPayment.id,
        installmentNumber: String(nextPayment.sequenceNumber),
      },
    });

    // Mark as processing
    await prisma.installmentPayment.update({
      where: { id: nextPayment.id },
      data: { status: "PROCESSING" },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      installment: {
        id: nextPayment.id,
        sequenceNumber: nextPayment.sequenceNumber,
        amount: nextPayment.amount,
        dueDate: nextPayment.dueDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("[Installment Pay Error]", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
