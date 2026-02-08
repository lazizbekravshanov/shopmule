import { createHash, randomBytes } from 'crypto';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generatePaymentLink(baseUrl: string, token: string): string {
  return `${baseUrl}/pay/${token}`;
}

export function generatePortalLink(baseUrl: string, token: string): string {
  return `${baseUrl}/portal/${token}`;
}
