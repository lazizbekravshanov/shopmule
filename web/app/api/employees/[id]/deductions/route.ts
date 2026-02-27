import { NextResponse } from "next/server";
import { withPermission } from "@/lib/auth/with-permission";
import { P } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

export const GET = withPermission(P.REPORTS_VIEW_FINANCIAL, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise;
  const id = params.id;

  const deductions = await prisma.deduction.findMany({
    where: {
      employeeId: id,
      tenantId: auth.tenantId,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deductions);
});

export const POST = withPermission(P.USERS_UPDATE, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise;
  const id = params.id;
  const body = await request.json();

  const { type, description, amount, percentage, isRecurring, isActive } = body;

  const deduction = await prisma.deduction.create({
    data: {
      tenantId: auth.tenantId,
      employeeId: id,
      type,
      description,
      amount,
      percentage: percentage ?? null,
      isRecurring: isRecurring ?? true,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json(deduction, { status: 201 });
});
