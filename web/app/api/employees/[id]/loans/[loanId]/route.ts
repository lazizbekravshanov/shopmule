import { NextResponse } from "next/server";
import { withPermission } from "@/lib/auth/with-permission";
import { P } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

export const PATCH = withPermission(P.USERS_UPDATE, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise;
  const loanId = params.loanId;

  const existing = await prisma.loanAdvance.findFirst({
    where: { id: loanId, tenantId: auth.tenantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  const body = await request.json();
  const { description, remainingBalance, monthlyPayment, isActive, notes } = body;

  const loan = await prisma.loanAdvance.update({
    where: { id: loanId },
    data: {
      ...(description !== undefined && { description }),
      ...(remainingBalance !== undefined && { remainingBalance }),
      ...(monthlyPayment !== undefined && { monthlyPayment }),
      ...(isActive !== undefined && { isActive }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(loan);
});
