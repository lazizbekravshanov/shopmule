import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-csrf-secret';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = '__Host-csrf';
const TOKEN_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(16).toString('hex');
  const payload = `${timestamp}.${random}`;
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 16);

  return `${payload}.${signature}`;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [timestamp, random, signature] = parts;

  // Check timestamp validity
  const tokenTime = parseInt(timestamp, 36);
  if (isNaN(tokenTime) || Date.now() - tokenTime > TOKEN_VALIDITY_MS) {
    return false;
  }

  // Verify signature
  const payload = `${timestamp}.${random}`;
  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 16);

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * CSRF validation middleware for API routes
 * Checks both header and cookie for double-submit pattern
 */
export function validateCsrfRequest(request: NextRequest): boolean {
  // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER);

  // Get token from cookie for double-submit validation
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  // Both must be present and match
  if (!headerToken || !cookieToken) {
    return false;
  }

  // Tokens must match (double-submit cookie pattern)
  if (headerToken !== cookieToken) {
    return false;
  }

  // Validate the token itself
  return validateCsrfToken(headerToken);
}

/**
 * Create a response with CSRF cookie set
 */
export function withCsrfCookie(response: NextResponse): NextResponse {
  const token = generateCsrfToken();

  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by JS for double-submit
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });

  return response;
}

/**
 * CSRF middleware wrapper for API handlers
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // Skip CSRF for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }

    // Validate CSRF token
    if (!validateCsrfRequest(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

/**
 * API endpoint to get a new CSRF token
 * Call this from the client before making mutations
 */
export function getCsrfTokenHandler(): NextResponse {
  const token = generateCsrfToken();

  const response = NextResponse.json({ token });

  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  return response;
}

/**
 * Origin validation for additional protection
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // No origin header (same-origin request)
  if (!origin) {
    return true;
  }

  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }

  // Check if origin matches host
  try {
    const originUrl = new URL(origin);
    const allowedHosts = [
      host,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL,
    ].filter(Boolean);

    return allowedHosts.some((allowed) => {
      if (!allowed) return false;
      const allowedHost = allowed.replace(/^https?:\/\//, '').split('/')[0];
      return originUrl.host === allowedHost;
    });
  } catch {
    return false;
  }
}
