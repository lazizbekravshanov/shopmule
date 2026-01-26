import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || 'ShopMule <noreply@shopmule.com>';

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, html, text, from = DEFAULT_FROM } = options;

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    if (error) {
      console.error('Resend email error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendPaymentLinkEmail(options: {
  to: string;
  customerName: string;
  vehicleInfo: string;
  paymentLink: string;
  totalAmount: number;
  shopName?: string;
  customMessage?: string;
}): Promise<EmailResult> {
  const {
    to,
    customerName,
    vehicleInfo,
    paymentLink,
    totalAmount,
    shopName = 'ShopMule Auto',
    customMessage,
  } = options;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalAmount);

  const subject = `Your invoice from ${shopName} is ready - ${formattedAmount}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${shopName}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Hi ${customerName},
              </h2>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Your vehicle service has been completed and your invoice is ready for payment.
              </p>

              <!-- Vehicle Info Box -->
              <table role="presentation" style="width: 100%; background-color: #f4f4f5; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Vehicle</p>
                    <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 500;">${vehicleInfo}</p>
                  </td>
                </tr>
              </table>

              <!-- Amount Box -->
              <table role="presentation" style="width: 100%; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #166534; font-size: 14px;">Amount Due</p>
                    <p style="margin: 0; color: #166534; font-size: 32px; font-weight: 700;">${formattedAmount}</p>
                  </td>
                </tr>
              </table>

              ${customMessage ? `
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6; padding: 16px; background-color: #fefce8; border-radius: 8px; border-left: 4px solid #eab308;">
                ${customMessage}
              </p>
              ` : ''}

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 8px 0 24px;">
                    <a href="${paymentLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Pay Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:<br>
                <a href="${paymentLink}" style="color: #2563eb; word-break: break-all;">${paymentLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                This payment link expires in 30 days.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                If you have any questions, please contact us directly.
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

  return sendEmail({
    to,
    subject,
    html,
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
