import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/services/email';
import { sendSms } from '@/lib/services/sms';
import {
  CustomerNotificationType,
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '@prisma/client';

// ==========================================
// TYPES
// ==========================================

export interface NotificationPayload {
  customerId: string;
  type: CustomerNotificationType;
  subject: string;
  content: string;
  metadata?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export interface NotificationResult {
  id: string;
  channel: NotificationChannel;
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface CustomerWithPreferences {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  NotificationPreference: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    workOrderUpdates: boolean;
    estimateAlerts: boolean;
    invoiceReminders: boolean;
    marketingEmails: boolean;
  } | null;
}

// ==========================================
// MAIN NOTIFICATION SERVICE
// ==========================================

export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResult[]> {
  const { customerId, type, subject, content, metadata, channels } = payload;

  // Get customer with preferences
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { NotificationPreference: true },
  });

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  // Determine which channels to use
  const enabledChannels = getEnabledChannels(customer, type, channels);

  if (enabledChannels.length === 0) {
    console.log(`No enabled channels for customer ${customerId}, type ${type}`);
    return [];
  }

  const results: NotificationResult[] = [];

  // Send to each enabled channel
  for (const channel of enabledChannels) {
    const result = await sendToChannel({
      customer,
      channel,
      type,
      subject,
      content,
      metadata,
    });
    results.push(result);
  }

  return results;
}

// ==========================================
// CHANNEL ROUTING
// ==========================================

function getEnabledChannels(
  customer: CustomerWithPreferences,
  type: CustomerNotificationType,
  requestedChannels?: NotificationChannel[]
): NotificationChannel[] {
  const prefs = customer.NotificationPreference;
  const channels: NotificationChannel[] = [];

  // Default preferences if none set
  const emailEnabled = prefs?.emailEnabled ?? true;
  const smsEnabled = prefs?.smsEnabled ?? false;
  const pushEnabled = prefs?.pushEnabled ?? true;

  // Check if this notification type is enabled
  const typeEnabled = isTypeEnabled(type, prefs);
  if (!typeEnabled) {
    return [];
  }

  // Check each channel
  if (emailEnabled && customer.email) {
    if (!requestedChannels || requestedChannels.includes('EMAIL')) {
      channels.push('EMAIL');
    }
  }

  if (smsEnabled && customer.phone) {
    if (!requestedChannels || requestedChannels.includes('SMS')) {
      channels.push('SMS');
    }
  }

  if (pushEnabled) {
    if (!requestedChannels || requestedChannels.includes('PUSH')) {
      // Push notifications require web push subscription - skip for now
      // channels.push('PUSH');
    }
  }

  return channels;
}

function isTypeEnabled(
  type: CustomerNotificationType,
  prefs: CustomerWithPreferences['NotificationPreference']
): boolean {
  if (!prefs) return true; // Default to enabled

  switch (type) {
    case 'WORK_ORDER_CREATED':
    case 'WORK_ORDER_STATUS_UPDATE':
    case 'SERVICE_COMPLETE':
      return prefs.workOrderUpdates;

    case 'ESTIMATE_READY':
    case 'ESTIMATE_APPROVED':
      return prefs.estimateAlerts;

    case 'INVOICE_CREATED':
    case 'INVOICE_REMINDER':
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_FAILED':
      return prefs.invoiceReminders;

    case 'MARKETING':
      return prefs.marketingEmails;

    case 'PORTAL_LINK':
    case 'APPOINTMENT_REMINDER':
      return true; // Always send these

    default:
      return true;
  }
}

// ==========================================
// CHANNEL SENDERS
// ==========================================

async function sendToChannel(params: {
  customer: CustomerWithPreferences;
  channel: NotificationChannel;
  type: CustomerNotificationType;
  subject: string;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<NotificationResult> {
  const { customer, channel, type, subject, content, metadata } = params;

  // Create notification record first
  const notification = await prisma.customerNotification.create({
    data: {
      customerId: customer.id,
      type,
      channel,
      subject,
      content,
      metadata: metadata as Prisma.JsonObject,
      status: 'SENDING',
    },
  });

  try {
    let result: { success: boolean; messageId?: string; error?: string };

    switch (channel) {
      case 'EMAIL':
        result = await sendEmail({
          to: customer.email!,
          subject,
          html: generateEmailHtml(subject, content, customer.name, metadata),
        });
        break;

      case 'SMS':
        result = await sendSms({
          to: customer.phone!,
          body: generateSmsBody(subject, content, metadata),
        });
        break;

      case 'PUSH':
        // TODO: Implement web push
        result = { success: false, error: 'Push not implemented' };
        break;

      default:
        result = { success: false, error: 'Unknown channel' };
    }

    // Update notification status
    await prisma.customerNotification.update({
      where: { id: notification.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
        failedAt: result.success ? null : new Date(),
        failureReason: result.error || null,
        externalId: result.messageId || null,
      },
    });

    return {
      id: notification.id,
      channel,
      success: result.success,
      externalId: result.messageId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await prisma.customerNotification.update({
      where: { id: notification.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: errorMessage,
      },
    });

    return {
      id: notification.id,
      channel,
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// EMAIL HTML GENERATION
// ==========================================

function generateEmailHtml(
  subject: string,
  content: string,
  customerName: string,
  metadata?: Record<string, unknown>
): string {
  const ctaUrl = metadata?.ctaUrl as string | undefined;
  const ctaText = metadata?.ctaText as string | undefined;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ee7a14 0%, #d96a0a 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">ShopMule</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your Shop's Hardest Worker</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 8px; color: #18181b; font-size: 20px; font-weight: 600;">
                Hi ${customerName},
              </h2>
              <p style="margin: 0 0 24px; color: #71717a; font-size: 14px;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
                ${content.replace(/\n/g, '<br>')}
              </div>

              ${ctaUrl ? `
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${ctaUrl}" style="display: inline-block; background-color: #ee7a14; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      ${ctaText || 'View Details'}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                Questions? Reply to this email or contact us directly.
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

function generateSmsBody(
  subject: string,
  content: string,
  metadata?: Record<string, unknown>
): string {
  const ctaUrl = metadata?.ctaUrl as string | undefined;
  let sms = `ShopMule: ${content}`;

  if (ctaUrl) {
    sms += ` ${ctaUrl}`;
  }

  // SMS max length is 160 chars for single segment
  if (sms.length > 160) {
    sms = sms.substring(0, 157) + '...';
  }

  return sms;
}

// ==========================================
// CONVENIENCE METHODS
// ==========================================

export async function notifyWorkOrderCreated(
  customerId: string,
  workOrderId: string,
  vehicleInfo: string,
  portalUrl: string
) {
  return sendNotification({
    customerId,
    type: 'WORK_ORDER_CREATED',
    subject: 'New Work Order Created',
    content: `A new work order has been created for your ${vehicleInfo}. We'll keep you updated on the progress.`,
    metadata: {
      workOrderId,
      vehicleInfo,
      ctaUrl: portalUrl,
      ctaText: 'View Work Order',
    },
  });
}

export async function notifyWorkOrderStatusUpdate(
  customerId: string,
  workOrderId: string,
  vehicleInfo: string,
  newStatus: string,
  portalUrl: string
) {
  const statusMessages: Record<string, string> = {
    DIAGNOSED: 'has been diagnosed and an estimate is being prepared',
    APPROVED: 'has been approved and work will begin shortly',
    IN_PROGRESS: 'is now being worked on by our technicians',
    COMPLETED: 'has been completed and is ready for pickup',
  };

  return sendNotification({
    customerId,
    type: 'WORK_ORDER_STATUS_UPDATE',
    subject: `Work Order Update: ${newStatus.replace('_', ' ')}`,
    content: `Your ${vehicleInfo} ${statusMessages[newStatus] || 'status has been updated'}.`,
    metadata: {
      workOrderId,
      vehicleInfo,
      status: newStatus,
      ctaUrl: portalUrl,
      ctaText: 'View Details',
    },
  });
}

export async function notifyEstimateReady(
  customerId: string,
  workOrderId: string,
  vehicleInfo: string,
  estimateTotal: number,
  portalUrl: string
) {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(estimateTotal);

  return sendNotification({
    customerId,
    type: 'ESTIMATE_READY',
    subject: 'Your Estimate is Ready for Review',
    content: `The estimate for your ${vehicleInfo} is ready. The total comes to ${formattedTotal}. Please review and approve to proceed with the repairs.`,
    metadata: {
      workOrderId,
      vehicleInfo,
      estimateTotal,
      ctaUrl: portalUrl,
      ctaText: 'Review & Approve',
    },
  });
}

export async function notifyInvoiceCreated(
  customerId: string,
  invoiceId: string,
  vehicleInfo: string,
  total: number,
  paymentUrl: string
) {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total);

  return sendNotification({
    customerId,
    type: 'INVOICE_CREATED',
    subject: `Invoice Ready - ${formattedTotal}`,
    content: `Your invoice for ${vehicleInfo} is ready. Total amount due: ${formattedTotal}. You can pay securely online.`,
    metadata: {
      invoiceId,
      vehicleInfo,
      total,
      ctaUrl: paymentUrl,
      ctaText: 'Pay Now',
    },
  });
}

export async function notifyPaymentReceived(
  customerId: string,
  invoiceId: string,
  amount: number,
  vehicleInfo: string
) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  return sendNotification({
    customerId,
    type: 'PAYMENT_RECEIVED',
    subject: 'Payment Received - Thank You!',
    content: `We've received your payment of ${formattedAmount} for ${vehicleInfo}. Thank you for your business!`,
    metadata: {
      invoiceId,
      amount,
      vehicleInfo,
    },
  });
}

export async function notifyPortalLink(
  customerId: string,
  portalUrl: string
) {
  return sendNotification({
    customerId,
    type: 'PORTAL_LINK',
    subject: 'Your Customer Portal Access',
    content: 'You can now access your customer portal to view your vehicles, work orders, and invoices.',
    metadata: {
      ctaUrl: portalUrl,
      ctaText: 'Access Portal',
    },
  });
}

// ==========================================
// NOTIFICATION PREFERENCES
// ==========================================

export async function getOrCreatePreferences(customerId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { customerId },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: {
        customerId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        workOrderUpdates: true,
        estimateAlerts: true,
        invoiceReminders: true,
        marketingEmails: false,
      },
    });
  }

  return prefs;
}

export async function updatePreferences(
  customerId: string,
  updates: Partial<{
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    workOrderUpdates: boolean;
    estimateAlerts: boolean;
    invoiceReminders: boolean;
    marketingEmails: boolean;
  }>
) {
  return prisma.notificationPreference.upsert({
    where: { customerId },
    create: {
      customerId,
      emailEnabled: updates.emailEnabled ?? true,
      smsEnabled: updates.smsEnabled ?? false,
      pushEnabled: updates.pushEnabled ?? true,
      workOrderUpdates: updates.workOrderUpdates ?? true,
      estimateAlerts: updates.estimateAlerts ?? true,
      invoiceReminders: updates.invoiceReminders ?? true,
      marketingEmails: updates.marketingEmails ?? false,
    },
    update: updates,
  });
}

// ==========================================
// NOTIFICATION HISTORY
// ==========================================

export async function getNotificationHistory(
  customerId: string,
  options?: { limit?: number; offset?: number }
) {
  return prisma.customerNotification.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
}
