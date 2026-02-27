import { NextResponse } from "next/server";
import { withPermission } from "@/lib/auth/with-permission";
import { P } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

export const PATCH = withPermission(P.USERS_UPDATE, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise;
  const deductionId = params.deductionId;

  const existing = await prisma.deduction.findFirst({
    where: { id: deductionId, tenantId: auth.tenantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Deduction not found" }, { status: 404 });
  }

  const body = await request.json();
  const { type, description, amount, percentage, isRecurring, isActive } = body;

  const deduction = await prisma.deduction.update({
    where: { id: deductionId },
    data: {
      ...(type !== undefined && { type }),
      ...(description !== undefined && { description }),
      ...(amount !== undefined && { amount }),
      ...(percentage !== undefined && { percentage }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(deduction);
});

export const DELETE = withPermission(P.USERS_UPDATE, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise;
  const deductionId = params.deductionId;

  const existing = await prisma.deduction.findFirst({
    where: { id: deductionId, tenantId: auth.tenantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Deduction not found" }, { status: 404 });
  }

  await prisma.deduction.delete({
    where: { id: deductionId },
  });

  return NextResponse.json({ success: true });
});
