import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Email service not configured. Set RESEND_API_KEY in .env.local.' },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);

    const body = await request.json();
    const { name, email, phone, company, mcNumber, subject, message, carrierVerified } = body;

    if (!name || !email || !mcNumber || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const toEmail = process.env.CONTACT_EMAIL || 'hello@shopmule.com';

    const { error } = await resend.emails.send({
      from: 'ShopMule Contact <onboarding@resend.dev>',
      to: [toEmail],
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="border-bottom: 2px solid #ee7a14; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 20px; color: #171717;">New Contact Form Submission</h1>
            <p style="margin: 4px 0 0; font-size: 14px; color: #737373;">${subject}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 12px; color: #737373; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 8px 12px; color: #171717; font-weight: 500;">${name}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px 12px; color: #737373; vertical-align: top;">Email</td>
              <td style="padding: 8px 12px;"><a href="mailto:${email}" style="color: #ee7a14; text-decoration: none;">${email}</a></td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding: 8px 12px; color: #737373; vertical-align: top;">Phone</td>
              <td style="padding: 8px 12px; color: #171717;">${phone}</td>
            </tr>` : ''}
            ${company ? `
            <tr style="background: #fafafa;">
              <td style="padding: 8px 12px; color: #737373; vertical-align: top;">Company</td>
              <td style="padding: 8px 12px; color: #171717;">${company}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 12px; color: #737373; vertical-align: top;">MC Number</td>
              <td style="padding: 8px 12px; color: #171717; font-family: monospace;">
                ${mcNumber}
                ${carrierVerified ? ' <span style="color: #059669; font-family: sans-serif;">&#10003; FMCSA Verified</span>' : ''}
              </td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #fafafa; border-radius: 8px; border: 1px solid #e5e5e5;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #737373; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
            <p style="margin: 0; font-size: 14px; color: #171717; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #a3a3a3;">
            Sent from ShopMule contact form &middot; Reply directly to respond to ${name}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
