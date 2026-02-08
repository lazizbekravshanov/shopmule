import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateToken, hashToken, generatePortalLink } from '@/lib/tokens';
import {
  successResponse,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api/response';
import { audit } from '@/lib/security/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return notFoundResponse('Customer not found');
    }

    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.customer.update({
      where: { id },
      data: {
        portalTokenHash: tokenHash,
        portalTokenExpiresAt: expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const portalLink = generatePortalLink(baseUrl, token);

    // Audit log: Portal link generated
    await audit.create('CustomerPortalLink', id, {
      customerId: id,
      customerEmail: customer.email,
      expiresAt: expiresAt.toISOString(),
    });

    return successResponse({
      portalLink,
      expiresAt: expiresAt.toISOString(),
      customerEmail: customer.email,
      customerPhone: customer.phone,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
