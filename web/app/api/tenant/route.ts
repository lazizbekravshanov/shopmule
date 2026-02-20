import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      phone: true,
      email: true,
      website: true,
      taxRate: true,
      timezone: true,
      settings: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  return NextResponse.json({ tenant });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, address, city, state, zipCode, phone, email, website, taxRate, timezone, laborRate } = body;

  // Merge laborRate into settings JSON
  const existing = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { settings: true },
  });

  const currentSettings = (existing?.settings ?? {}) as Record<string, unknown>;
  const updatedSettings = (laborRate !== undefined
    ? { ...currentSettings, laborRate: parseFloat(laborRate) }
    : currentSettings) as unknown as Prisma.InputJsonValue;

  const tenant = await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: {
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zipCode !== undefined && { zipCode }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(website !== undefined && { website }),
      ...(taxRate !== undefined && { taxRate: parseFloat(taxRate) }),
      ...(timezone !== undefined && { timezone }),
      settings: updatedSettings,
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      phone: true,
      email: true,
      website: true,
      taxRate: true,
      timezone: true,
      settings: true,
    },
  });

  return NextResponse.json({ tenant });
}
