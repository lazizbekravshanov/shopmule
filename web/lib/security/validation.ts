import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Common validation schemas
 */
export const schemas = {
  // IDs
  id: z.string().min(1).max(100),
  cuid: z.string().regex(/^c[a-z0-9]{24}$/i, 'Invalid CUID format'),
  uuid: z.string().uuid(),

  // Strings
  email: z.string().email().max(255).toLowerCase().trim(),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]{10,20}$/, 'Invalid phone number format')
    .transform((val) => val.replace(/\s/g, '')),
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(5000).trim(),
  url: z.string().url().max(2048),

  // Numbers
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().nonnegative(),
  positiveNumber: z.number().positive(),
  percentage: z.number().min(0).max(100),
  currency: z.number().min(0).multipleOf(0.01),

  // Dates
  date: z.coerce.date(),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isoDateTime: z.string().datetime(),

  // Geo
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(50000),

  // VIN
  vin: z
    .string()
    .length(17)
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Invalid VIN format'),

  // License plate
  licensePlate: z.string().min(1).max(10).toUpperCase().trim(),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Validate request body against schema
 */
export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; error: NextResponse }
> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: result.error.flatten().fieldErrors,
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: NextResponse } {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Validate path parameters
 */
export function validateParams<T extends z.ZodType>(
  params: Record<string, string | string[]>,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: NextResponse } {
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid path parameters',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Create a validated API handler
 */
export function createValidatedHandler<TBody extends z.ZodType, TQuery extends z.ZodType>(options: {
  bodySchema?: TBody;
  querySchema?: TQuery;
  handler: (req: NextRequest, context: {
    body?: z.infer<TBody>;
    query?: z.infer<TQuery>;
  }) => Promise<NextResponse>;
}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context: { body?: z.infer<TBody>; query?: z.infer<TQuery> } = {};

    // Validate body if schema provided
    if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const bodyResult = await validateBody(request.clone() as NextRequest, options.bodySchema);
      if (bodyResult.success === false) {
        return bodyResult.error;
      }
      context.body = bodyResult.data;
    }

    // Validate query if schema provided
    if (options.querySchema) {
      const queryResult = validateQuery(
        new URL(request.url).searchParams,
        options.querySchema
      );
      if (queryResult.success === false) {
        return queryResult.error;
      }
      context.query = queryResult.data;
    }

    return options.handler(request, context);
  };
}

/**
 * Strict input filters for SQL injection prevention
 */
export const sqlSafe = {
  identifier: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid identifier format'),

  orderDirection: z.enum(['asc', 'desc', 'ASC', 'DESC']).transform((v) => v.toLowerCase()),

  // Whitelist approach for sortable fields
  createSortSchema: <T extends readonly string[]>(allowedFields: T) =>
    z.object({
      sortBy: z.enum(allowedFields as unknown as [string, ...string[]]).optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }),
};
