import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'PAYMENT'
  | 'GENERATE'
  | 'SEND'
  | 'VIEW';

export interface AuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}

interface RequestContext {
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extract request context from headers
 */
export async function getRequestContext(): Promise<RequestContext> {
  const headersList = await headers();
  const session = await getServerSession(authOptions);

  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : headersList.get('x-real-ip') || 'unknown';

  return {
    userId: session?.user?.id,
    userEmail: session?.user?.email || undefined,
    ipAddress,
    userAgent: headersList.get('user-agent') || undefined,
    requestId: headersList.get('x-request-id') || generateRequestId(),
  };
}

/**
 * Log an audit event
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const context = await getRequestContext();

    await prisma.auditLog.create({
      data: {
        userId: context.userId,
        userEmail: context.userEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues || undefined,
        newValues: input.newValues || undefined,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestId: context.requestId,
        success: input.success ?? true,
        errorMessage: input.errorMessage,
        metadata: input.metadata || undefined,
      },
    });
  } catch (error) {
    // Log to console but don't fail the request
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log with timing information
 */
export async function logAuditWithTiming(
  input: AuditLogInput,
  startTime: number
): Promise<void> {
  const duration = Date.now() - startTime;
  await logAudit({
    ...input,
    metadata: {
      ...input.metadata,
      durationMs: duration,
    },
  });
}

/**
 * Wrapper for auditing async operations
 */
export async function withAudit<T>(
  input: Omit<AuditLogInput, 'success' | 'errorMessage'>,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    await logAuditWithTiming(
      {
        ...input,
        success: true,
      },
      startTime
    );
    return result;
  } catch (error) {
    await logAuditWithTiming(
      {
        ...input,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
      startTime
    );
    throw error;
  }
}

/**
 * High-level audit helpers for common operations
 */
export const audit = {
  async create(entityType: string, entityId: string, newValues?: Record<string, unknown>) {
    await logAudit({
      action: 'CREATE',
      entityType,
      entityId,
      newValues,
    });
  },

  async update(
    entityType: string,
    entityId: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>
  ) {
    await logAudit({
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
    });
  },

  async delete(entityType: string, entityId: string, oldValues?: Record<string, unknown>) {
    await logAudit({
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
    });
  },

  async login(userId: string, email: string, success: boolean, errorMessage?: string) {
    await logAudit({
      action: 'LOGIN',
      entityType: 'User',
      entityId: userId,
      success,
      errorMessage,
      metadata: { email },
    });
  },

  async payment(
    invoiceId: string,
    amount: number,
    method: string,
    success: boolean,
    errorMessage?: string
  ) {
    await logAudit({
      action: 'PAYMENT',
      entityType: 'Invoice',
      entityId: invoiceId,
      success,
      errorMessage,
      metadata: { amount, method },
    });
  },

  async export(entityType: string, format: string, recordCount: number) {
    await logAudit({
      action: 'EXPORT',
      entityType,
      metadata: { format, recordCount },
    });
  },

  async send(
    entityType: string,
    entityId: string,
    channel: 'email' | 'sms',
    recipient: string,
    success: boolean
  ) {
    await logAudit({
      action: 'SEND',
      entityType,
      entityId,
      success,
      metadata: { channel, recipient },
    });
  },
};
