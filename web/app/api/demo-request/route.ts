import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/services/email';
import { z } from 'zod';

// Validation schema
const demoRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  shopSize: z.enum(['1-5', '6-15', '16-50', '50+']).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().optional(),
});

// Rate limiting - simple in-memory (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 5 requests
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Rate limit check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = demoRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check for duplicate email in last 24 hours
    const existingRequest = await prisma.demoRequest.findFirst({
      where: {
        email: data.email,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already requested a demo. We will contact you shortly.' },
        { status: 409 }
      );
    }

    // Create demo request record
    const demoRequest = await prisma.demoRequest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        shopSize: data.shopSize,
        message: data.message,
        source: data.source || 'website',
        ipAddress: ip,
        userAgent,
        status: 'NEW',
      },
    });

    // Send confirmation email to prospect
    await sendEmail({
      to: data.email,
      subject: 'Your ShopMule Demo Request',
      html: generateProspectEmail(data.firstName, data.company),
    });

    // Send notification to sales team
    const salesEmail = process.env.SALES_EMAIL || process.env.ADMIN_EMAIL;
    if (salesEmail) {
      await sendEmail({
        to: salesEmail,
        subject: `New Demo Request: ${data.firstName} ${data.lastName} - ${data.company || 'Individual'}`,
        html: generateSalesNotificationEmail(demoRequest),
      });
    }

    // Log for audit trail
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'DemoRequest',
        entityId: demoRequest.id,
        newValues: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          company: data.company,
          shopSize: data.shopSize,
        },
        ipAddress: ip,
        userAgent,
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully. We will contact you shortly.',
      id: demoRequest.id,
    });
  } catch (error) {
    console.error('Demo request error:', error);

    // Log failed attempt
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'DemoRequest',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        },
      });
    } catch {
      // Ignore audit log failures
    }

    return NextResponse.json(
      { error: 'Failed to submit demo request. Please try again.' },
      { status: 500 }
    );
  }
}

function generateProspectEmail(firstName: string, company?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ShopMule</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ee7a14 0%, #d96a0a 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ShopMule</h1>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your Shop's Hardest Worker</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">
                Thanks for your interest, ${firstName}!
              </h2>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                We've received your demo request${company ? ` for ${company}` : ''} and our team is excited to show you how ShopMule can transform your shop operations.
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">What happens next?</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #52525b; line-height: 1.8;">
                  <li>A ShopMule specialist will reach out within 24 hours</li>
                  <li>We'll schedule a personalized demo at your convenience</li>
                  <li>See exactly how ShopMule fits your shop's needs</li>
                  <li>Get your questions answered by our experts</li>
                </ul>
              </div>

              <p style="margin: 0 0 32px; color: #52525b; font-size: 16px; line-height: 1.6;">
                In the meantime, feel free to explore our features on our website or reply to this email with any questions.
              </p>

              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://shopmule.com" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Explore ShopMule
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                Questions? Just reply to this email.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                © ${new Date().getFullYear()} ShopMule. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateSalesNotificationEmail(demoRequest: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  shopSize?: string | null;
  message?: string | null;
  source?: string | null;
  createdAt: Date;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Demo Request</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e4e4e7;">
    <tr>
      <td style="background-color: #18181b; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">🎯 New Demo Request</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <strong style="color: #71717a;">Name:</strong>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5; color: #18181b;">
              ${demoRequest.firstName} ${demoRequest.lastName}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <strong style="color: #71717a;">Email:</strong>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <a href="mailto:${demoRequest.email}" style="color: #2563eb;">${demoRequest.email}</a>
            </td>
          </tr>
          ${demoRequest.phone ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <strong style="color: #71717a;">Phone:</strong>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <a href="tel:${demoRequest.phone}" style="color: #2563eb;">${demoRequest.phone}</a>
            </td>
          </tr>
          ` : ''}
          ${demoRequest.company ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <strong style="color: #71717a;">Company:</strong>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5; color: #18181b;">
              ${demoRequest.company}
            </td>
          </tr>
          ` : ''}
          ${demoRequest.shopSize ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <strong style="color: #71717a;">Shop Size:</strong>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5; color: #18181b;">
              ${demoRequest.shopSize} employees
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
              <strong style="color: #71717a;">Source:</strong>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5; color: #18181b;">
              ${demoRequest.source || 'Website'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <strong style="color: #71717a;">Submitted:</strong>
            </td>
            <td style="padding: 8px 0; color: #18181b;">
              ${demoRequest.createdAt.toLocaleString()}
            </td>
          </tr>
        </table>

        ${demoRequest.message ? `
        <div style="margin-top: 20px; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
          <strong style="color: #71717a; display: block; margin-bottom: 8px;">Message:</strong>
          <p style="margin: 0; color: #18181b; line-height: 1.6;">${demoRequest.message}</p>
        </div>
        ` : ''}

        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.shopmule.com'}/admin/leads/${demoRequest.id}"
             style="display: inline-block; background-color: #ee7a14; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
            View in Dashboard
          </a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// GET - Retrieve demo requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['OWNER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = status ? { status: status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DEMO_SCHEDULED' | 'DEMO_COMPLETED' | 'NEGOTIATING' | 'CONVERTED' | 'LOST' } : {};

    const [requests, total] = await Promise.all([
      prisma.demoRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.demoRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: requests,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch demo requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo requests' },
      { status: 500 }
    );
  }
}
