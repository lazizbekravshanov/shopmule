import { getCsrfTokenHandler } from '@/lib/security/csrf';

export async function GET() {
  return getCsrfTokenHandler();
}
