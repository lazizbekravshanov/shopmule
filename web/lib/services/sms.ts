import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? new Twilio(accountSid, authToken) : null;

export interface SendSmsOptions {
  to: string;
  body: string;
  from?: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSms(options: SendSmsOptions): Promise<SmsResult> {
  const { to, body, from = fromNumber } = options;

  if (!client || !from) {
    console.warn('Twilio not configured, skipping SMS');
    return {
      success: false,
      error: 'SMS service not configured',
    };
  }

  try {
    const message = await client.messages.create({
      body,
      from,
      to: formatPhoneNumber(to),
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendPaymentLinkSms(options: {
  to: string;
  customerName: string;
  paymentLink: string;
  totalAmount: number;
  shopName?: string;
}): Promise<SmsResult> {
  const {
    to,
    customerName,
    paymentLink,
    totalAmount,
    shopName = 'ShopMule Auto',
  } = options;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalAmount);

  const body = `Hi ${customerName}, your invoice of ${formattedAmount} from ${shopName} is ready. Pay securely here: ${paymentLink}`;

  return sendSms({ to, body });
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it's a 10-digit US number, add +1 prefix
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it already has country code, just add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Otherwise return with + prefix if not present
  return phone.startsWith('+') ? phone : `+${digits}`;
}
