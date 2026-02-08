import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  identifier?: string;
  message?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory store for development/single-instance deployments
const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired entries periodically
 */
function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryStore, 60 * 1000);
}

/**
 * In-memory rate limiter
 */
function checkMemoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (record.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.limit - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Database-backed rate limiter for distributed deployments
 * Uses the RateLimitRecord model in schema
 */
async function checkDbRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  try {
    // Try to find or create a record for this window
    const record = await prisma.rateLimitRecord.findFirst({
      where: {
        identifier,
        endpoint,
        windowStart: { gte: windowStart },
      },
      orderBy: { windowStart: 'desc' },
    });

    if (record) {
      // Record exists in current window
      if (record.count >= config.limit) {
        const resetTime = record.windowStart.getTime() + config.windowMs;
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime - now.getTime()) / 1000),
        };
      }

      // Increment count
      await prisma.rateLimitRecord.update({
        where: { id: record.id },
        data: { count: record.count + 1 },
      });

      return {
        allowed: true,
        remaining: config.limit - record.count - 1,
        resetTime: record.windowStart.getTime() + config.windowMs,
      };
    }

    // Create new record for this window
    await prisma.rateLimitRecord.create({
      data: {
        identifier,
        endpoint,
        count: 1,
        windowStart: now,
      },
    });

    return {
      allowed: true,
      remaining: config.limit - 1,
      resetTime: now.getTime() + config.windowMs,
    };
  } catch (error) {
    console.error('Rate limit DB error:', error);
    // Fall back to allowing the request if DB fails
    return {
      allowed: true,
      remaining: config.limit,
      resetTime: now.getTime() + config.windowMs,
    };
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest, customId?: string): string {
  if (customId) {
    return customId;
  }

  // Try to get IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to unknown
  return 'unknown';
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request, config.identifier);
  const endpoint = request.nextUrl.pathname;
  const key = `${endpoint}:${identifier}`;

  // Use database in production for distributed rate limiting
  // Use memory store in development or when DB is unavailable
  const useDb = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL;

  if (useDb) {
    return checkDbRateLimit(identifier, endpoint, config);
  }

  return checkMemoryRateLimit(key, config);
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(config: RateLimitConfig) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const result = await checkRateLimit(request, config);

      if (!result.allowed) {
        return NextResponse.json(
          {
            error: config.message || 'Too many requests',
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(result.retryAfter || 60),
              'X-RateLimit-Limit': String(config.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
            },
          }
        );
      }

      const response = await handler(request);

      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', String(config.limit));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

      return response;
    };
  };
}

/**
 * Preset rate limit configurations
 */
export const rateLimits = {
  // Strict: 10 requests per minute (auth, password reset)
  strict: { limit: 10, windowMs: 60 * 1000 },

  // Standard: 60 requests per minute
  standard: { limit: 60, windowMs: 60 * 1000 },

  // Relaxed: 200 requests per minute (read-heavy endpoints)
  relaxed: { limit: 200, windowMs: 60 * 1000 },

  // Burst: 30 requests per 10 seconds
  burst: { limit: 30, windowMs: 10 * 1000 },

  // Daily: 1000 requests per day (export, expensive operations)
  daily: { limit: 1000, windowMs: 24 * 60 * 60 * 1000 },
};

/**
 * Clean up old rate limit records (run as cron job)
 */
export async function cleanupRateLimitRecords(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMs);
  const result = await prisma.rateLimitRecord.deleteMany({
    where: {
      windowStart: { lt: cutoff },
    },
  });
  return result.count;
}
