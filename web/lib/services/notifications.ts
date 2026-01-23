import { sendPaymentLinkEmail, type EmailResult } from './email';
import { sendPaymentLinkSms, type SmsResult } from './sms';

export type NotificationChannel = 'email' | 'sms';

export interface PaymentLinkNotificationOptions {
  channels: NotificationChannel[];
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerName: string;
  vehicleInfo: string;
  paymentLink: string;
  totalAmount: number;
  shopName?: string;
  customMessage?: string;
}

export interface NotificationResult {
  success: boolean;
  email?: EmailResult;
  sms?: SmsResult;
  sentTo: {
    email?: string;
    phone?: string;
  };
  errors: string[];
}

export async function sendPaymentLinkNotification(
  options: PaymentLinkNotificationOptions
): Promise<NotificationResult> {
  const {
    channels,
    customerEmail,
    customerPhone,
    customerName,
    vehicleInfo,
    paymentLink,
    totalAmount,
    shopName,
    customMessage,
  } = options;

  const result: NotificationResult = {
    success: false,
    sentTo: {},
    errors: [],
  };

  const promises: Promise<void>[] = [];

  // Send email if requested and email is available
  if (channels.includes('email')) {
    if (customerEmail) {
      promises.push(
        sendPaymentLinkEmail({
          to: customerEmail,
          customerName,
          vehicleInfo,
          paymentLink,
          totalAmount,
          shopName,
          customMessage,
        }).then((emailResult) => {
          result.email = emailResult;
          if (emailResult.success) {
            result.sentTo.email = customerEmail;
          } else if (emailResult.error) {
            result.errors.push(`Email: ${emailResult.error}`);
          }
        })
      );
    } else {
      result.errors.push('Email requested but customer has no email address');
    }
  }

  // Send SMS if requested and phone is available
  if (channels.includes('sms')) {
    if (customerPhone) {
      promises.push(
        sendPaymentLinkSms({
          to: customerPhone,
          customerName,
          paymentLink,
          totalAmount,
          shopName,
        }).then((smsResult) => {
          result.sms = smsResult;
          if (smsResult.success) {
            result.sentTo.phone = customerPhone;
          } else if (smsResult.error) {
            result.errors.push(`SMS: ${smsResult.error}`);
          }
        })
      );
    } else {
      result.errors.push('SMS requested but customer has no phone number');
    }
  }

  // Wait for all notifications to complete
  await Promise.all(promises);

  // Consider success if at least one notification was sent
  result.success =
    (result.email?.success ?? false) || (result.sms?.success ?? false);

  return result;
}

export function getAvailableChannels(
  email?: string | null,
  phone?: string | null
): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  if (email) channels.push('email');
  if (phone) channels.push('sms');
  return channels;
}
