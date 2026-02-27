import { NextResponse } from "next/server";
import { withPermission } from "@/lib/auth/with-permission";
import { P } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

export const GET = withPermission(P.REPORTS_VIEW_FINANCIAL, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise;
  const id = params.id;

  const loans = await prisma.loanAdvance.findMany({
    where: {
      employeeId: id,
      tenantId: auth.tenantId,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(loans);
});

export const POST = withPermission(P.USERS_UPDATE, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise;
  const id = params.id;
  const body = await request.json();

  const { description, originalAmount, remainingBalance, monthlyPayment, issuedDate, notes } = body;

  const loan = await prisma.loanAdvance.create({
    data: {
      tenantId: auth.tenantId,
      employeeId: id,
      description,
      originalAmount,
      remainingBalance,
      monthlyPayment,
      issuedDate: new Date(issuedDate),
      notes: notes ?? null,
      isActive: true,
    },
  });

  return NextResponse.json(loan, { status: 201 });
});
