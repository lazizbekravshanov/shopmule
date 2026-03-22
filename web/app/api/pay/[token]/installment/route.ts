import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(
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
      select: {
        id: true,
        total: true,
        amountPaid: true,
        status: true,
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

    if (!invoice.InstallmentPlan) {
      return NextResponse.json({ plan: null, eligible: invoice.total - invoice.amountPaid > 50 });
    }

    const plan = invoice.InstallmentPlan;
    return NextResponse.json({
      plan: {
        id: plan.id,
        totalAmount: plan.totalAmount,
        numberOfPayments: plan.numberOfPayments,
        frequency: plan.frequency,
        status: plan.status,
        payments: plan.Payments.map((p) => ({
          id: p.id,
          sequenceNumber: p.sequenceNumber,
          amount: p.amount,
          dueDate: p.dueDate.toISOString(),
          status: p.status,
          paidAt: p.paidAt?.toISOString() || null,
        })),
      },
      eligible: false,
    });
  } catch (error) {
    console.error("[Installment Fetch Error]", error);
    return NextResponse.json({ error: "Failed to fetch installment plan" }, { status: 500 });
  }
}
