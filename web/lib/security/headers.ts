import { NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',

  // XSS protection (legacy, but still useful for older browsers)
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Prevent DNS prefetch for external domains
  'X-DNS-Prefetch-Control': 'off',

  // Disable browser features we don't need
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(self), payment=(self)',

  // Strict transport security (HTTPS only)
  // Note: Only applied in production
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Don't cache sensitive pages
  'Cache-Control': 'no-store, max-age=0',
};

/**
 * Content Security Policy directives
 */
export const cspDirectives = {
  // Only allow scripts from our domain and specific trusted sources
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],

  // Only allow styles from our domain
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],

  // Only allow images from our domain and data URIs
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],

  // Only allow fonts from our domain and Google Fonts
  'font-src': ["'self'", 'https://fonts.gstatic.com'],

  // Only allow connections to our domain and Stripe
  'connect-src': [
    "'self'",
    'https://api.stripe.com',
    'https://maps.googleapis.com',
    process.env.NEXT_PUBLIC_APP_URL || '',
  ].filter(Boolean),

  // Only allow frames from Stripe (for payments)
  'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],

  // Default fallback
  'default-src': ["'self'"],

  // Form actions
  'form-action': ["'self'"],

  // Base URI restriction
  'base-uri': ["'self'"],

  // Object/embed restriction
  'object-src': ["'none'"],
};

/**
 * Build CSP header string
 */
export function buildCspHeader(): string {
  return Object.entries(cspDirectives)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply standard security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    // Only apply HSTS in production
    if (header === 'Strict-Transport-Security' && process.env.NODE_ENV !== 'production') {
      return;
    }
    response.headers.set(header, value);
  });

  // Apply CSP in production (can break dev with hot reload)
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_CSP === 'true') {
    response.headers.set('Content-Security-Policy', buildCspHeader());
  } else {
    // Use report-only in development
    response.headers.set('Content-Security-Policy-Report-Only', buildCspHeader());
  }

  return response;
}

/**
 * CORS headers for API responses
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[];

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (process.env.NODE_ENV === 'development') {
    // Be more permissive in development
    headers['Access-Control-Allow-Origin'] = origin || '*';
  }

  return headers;
}

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  return response;
}

/**
 * Create a preflight (OPTIONS) response
 */
export function createPreflightResponse(origin?: string): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(response, origin);
}
