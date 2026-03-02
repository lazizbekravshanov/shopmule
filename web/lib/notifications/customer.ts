import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/services/email";
import { sendSms } from "@/lib/services/sms";
import type {
  CustomerNotificationType,
  NotificationChannel,
} from "@prisma/client";

const STATUS_MESSAGES: Record<
  string,
  { subject: string; smsBody: string; notifType: CustomerNotificationType } | undefined
> = {
  DIAGNOSED: {
    subject: "Your estimate is ready",
    smsBody: "Your vehicle diagnosis is complete and an estimate is ready for your review.",
    notifType: "ESTIMATE_READY",
  },
  APPROVED: {
    subject: "Work has been authorized",
    smsBody: "Your work order has been approved. We'll begin work shortly.",
    notifType: "ESTIMATE_APPROVED",
  },
  IN_PROGRESS: {
    subject: "Work has started on your vehicle",
    smsBody: "We've started working on your vehicle. We'll keep you updated on progress.",
    notifType: "WORK_ORDER_STATUS_UPDATE",
  },
  COMPLETED: {
    subject: "Your vehicle is ready for pickup",
    smsBody: "Great news! Your vehicle is ready for pickup.",
    notifType: "SERVICE_COMPLETE",
  },
  READY_FOR_PICKUP: {
    subject: "Your vehicle is ready for pickup",
    smsBody: "Great news! Your vehicle is ready for pickup.",
    notifType: "SERVICE_COMPLETE",
  },
  INVOICED: {
    subject: "Your invoice is ready",
    smsBody: "Your invoice is ready. View and pay online through your customer portal.",
    notifType: "INVOICE_CREATED",
  },
};

interface SendNotificationParams {
  workOrderId: string;
  newStatus: string;
}

export async function sendWorkOrderStatusNotification({
  workOrderId,
  newStatus,
}: SendNotificationParams): Promise<void> {
  try {
    const config = STATUS_MESSAGES[newStatus.toUpperCase()];
    if (!config) return;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        Vehicle: true,
        Customer: true,
      },
    });

    if (!workOrder || !workOrder.Customer) return;

    const customer = workOrder.Customer;
    const vehicle = workOrder.Vehicle;
    const vehicleInfo = vehicle
      ? `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim()
      : "Your vehicle";

    // Check notification preferences
    const prefs = await prisma.notificationPreference.findUnique({
      where: { customerId: customer.id },
    });

    // Default: email enabled, sms disabled
    const emailEnabled = prefs?.emailEnabled ?? true;
    const smsEnabled = prefs?.smsEnabled ?? false;

    // Check category preference
    const status = newStatus.toUpperCase();
    if (
      (status === "DIAGNOSED" || status === "APPROVED") &&
      prefs &&
      !prefs.estimateAlerts
    )
      return;
    if (
      status !== "DIAGNOSED" &&
      status !== "APPROVED" &&
      status !== "INVOICED" &&
      prefs &&
      !prefs.workOrderUpdates
    )
      return;
    if (status === "INVOICED" && prefs && !prefs.invoiceReminders) return;

    const portalLink = customer.portalTokenHash
      ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/portal/${customer.portalTokenHash}`
      : undefined;

    // Send email
    if (emailEnabled && customer.email) {
      let html: string;
      const customerName = customer.displayName || customer.name;

      if (status === "DIAGNOSED" && workOrder.aiEstimate) {
        const estimate = workOrder.aiEstimate as Record<string, unknown>;
        html = buildEstimateEmail({
          customerName,
          orderNumber: workOrder.workOrderNumber,
          vehicleInfo,
          estimateTotal: formatCurrency(
            (estimate.totalEstimate as number) ?? workOrder.grandTotal
          ),
          laborTotal: formatCurrency(workOrder.laborTotal),
          partsTotal: formatCurrency(workOrder.partsTotal),
          portalLink: portalLink || "#",
        });
      } else {
        html = buildStatusUpdateEmail({
          customerName,
          orderNumber: workOrder.workOrderNumber,
          vehicleInfo,
          status: newStatus.replace(/_/g, " "),
          portalLink,
        });
      }

      const emailResult = await sendEmail({
        to: customer.email,
        subject: `${config.subject} - ${vehicleInfo}`,
        html,
      });

      await logCustomerNotification({
        customerId: customer.id,
        type: config.notifType,
        channel: "EMAIL",
        subject: config.subject,
        content: html,
        status: emailResult.success ? "SENT" : "FAILED",
        externalId: emailResult.messageId,
        failureReason: emailResult.error,
      });
    }

    // Send SMS
    if (smsEnabled && customer.phone) {
      const shopName = "ShopMule Auto";
      const smsBody = `${shopName}: ${config.smsBody} (${vehicleInfo})`;

      const smsResult = await sendSms({
        to: customer.phone,
        body: smsBody,
      });

      await logCustomerNotification({
        customerId: customer.id,
        type: config.notifType,
        channel: "SMS",
        subject: config.subject,
        content: smsBody,
        status: smsResult.success ? "SENT" : "FAILED",
        externalId: smsResult.messageId,
        failureReason: smsResult.error,
      });
    }
  } catch (error) {
    console.error("[Customer Notifications] Failed:", error);
  }
}

async function logCustomerNotification(params: {
  customerId: string;
  type: CustomerNotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  status: "SENT" | "FAILED";
  externalId?: string;
  failureReason?: string;
}) {
  try {
    await prisma.customerNotification.create({
      data: {
        customerId: params.customerId,
        type: params.type,
        channel: params.channel,
        subject: params.subject,
        content: params.content,
        status: params.status,
        sentAt: params.status === "SENT" ? new Date() : undefined,
        failedAt: params.status === "FAILED" ? new Date() : undefined,
        failureReason: params.failureReason,
        externalId: params.externalId,
      },
    });
  } catch (error) {
    console.error("[Customer Notifications] Failed to log notification:", error);
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// ─── Email HTML builders ──────────────────────────────────────────────────────

function emailWrapper(content: string, shopName = "ShopMule"): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:8px;overflow:hidden">
<tr><td style="background-color:#171717;padding:24px;text-align:center"><h1 style="margin:0;color:#fff;font-size:24px;font-weight:600">${shopName}</h1></td></tr>
<tr><td style="padding:32px 24px">${content}</td></tr>
<tr><td style="background-color:#f4f4f5;padding:24px;text-align:center;border-top:1px solid #e5e5e5"><p style="margin:0;color:#71717a;font-size:14px">Powered by ShopMule</p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildStatusUpdateEmail(params: {
  customerName: string;
  orderNumber: string;
  vehicleInfo: string;
  status: string;
  portalLink?: string;
}): string {
  const statusColor =
    params.status.toUpperCase() === "COMPLETED"
      ? "#10b981"
      : params.status.toUpperCase() === "IN PROGRESS"
        ? "#3b82f6"
        : params.status.toUpperCase() === "APPROVED"
          ? "#ee7a14"
          : "#71717a";

  const portalButton = params.portalLink
    ? `<table width="100%"><tr><td align="center" style="padding:8px 0"><a href="${params.portalLink}" style="display:inline-block;background-color:#171717;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:500">View Details</a></td></tr></table>`
    : "";

  return emailWrapper(`
    <h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600">Work Order Update</h2>
    <p style="margin:0 0 16px;color:#525252;font-size:16px;line-height:24px">Hi ${params.customerName},</p>
    <p style="margin:0 0 24px;color:#525252;font-size:16px;line-height:24px">We have an update on your work order:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:8px;margin-bottom:24px"><tr><td style="padding:16px">
      <table width="100%">
        <tr><td style="color:#71717a;font-size:14px;padding-bottom:8px">Order #</td><td align="right" style="color:#171717;font-size:14px;padding-bottom:8px">${params.orderNumber}</td></tr>
        <tr><td style="color:#71717a;font-size:14px;padding-bottom:8px">Vehicle</td><td align="right" style="color:#171717;font-size:14px;padding-bottom:8px">${params.vehicleInfo}</td></tr>
        <tr><td style="color:#71717a;font-size:14px">Status</td><td align="right"><span style="display:inline-block;background-color:${statusColor};color:#fff;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:500">${params.status}</span></td></tr>
      </table>
    </td></tr></table>
    ${portalButton}`);
}

function buildEstimateEmail(params: {
  customerName: string;
  orderNumber: string;
  vehicleInfo: string;
  estimateTotal: string;
  laborTotal: string;
  partsTotal: string;
  portalLink: string;
}): string {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600">Estimate Ready for Approval</h2>
    <p style="margin:0 0 16px;color:#525252;font-size:16px;line-height:24px">Hi ${params.customerName},</p>
    <p style="margin:0 0 24px;color:#525252;font-size:16px;line-height:24px">We've completed the diagnosis on your vehicle and prepared an estimate for the recommended repairs.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:8px;margin-bottom:24px"><tr><td style="padding:16px">
      <table width="100%">
        <tr><td style="color:#71717a;font-size:14px;padding-bottom:8px">Work Order</td><td align="right" style="color:#171717;font-size:14px;padding-bottom:8px">${params.orderNumber}</td></tr>
        <tr><td style="color:#71717a;font-size:14px;padding-bottom:8px">Vehicle</td><td align="right" style="color:#171717;font-size:14px;padding-bottom:8px">${params.vehicleInfo}</td></tr>
        <tr><td colspan="2" style="border-top:1px solid #e5e5e5;padding-top:12px"></td></tr>
        <tr><td style="color:#71717a;font-size:14px;padding-bottom:4px">Labor</td><td align="right" style="color:#171717;font-size:14px;padding-bottom:4px">${params.laborTotal}</td></tr>
        <tr><td style="color:#71717a;font-size:14px;padding-bottom:8px">Parts</td><td align="right" style="color:#171717;font-size:14px;padding-bottom:8px">${params.partsTotal}</td></tr>
        <tr><td style="color:#171717;font-size:16px;font-weight:600">Estimated Total</td><td align="right" style="color:#171717;font-size:18px;font-weight:600">${params.estimateTotal}</td></tr>
      </table>
    </td></tr></table>
    <table width="100%"><tr><td align="center"><a href="${params.portalLink}" style="display:inline-block;background-color:#ee7a14;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:500">Review &amp; Approve Estimate</a></td></tr></table>
    <p style="margin:24px 0 0;color:#71717a;font-size:14px;text-align:center">Have questions? Reply to this email or call us to discuss the repairs.</p>`);
}
