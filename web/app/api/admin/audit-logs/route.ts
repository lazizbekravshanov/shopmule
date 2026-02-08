import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  userId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  success: z.enum(['true', 'false']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin/manager role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const query = querySchema.parse(params);
    const skip = (query.page - 1) * query.limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.success !== undefined) {
      where.success = query.success === 'true';
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(query.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        select: {
          id: true,
          userId: true,
          userEmail: true,
          action: true,
          entityType: true,
          entityId: true,
          oldValues: true,
          newValues: true,
          ipAddress: true,
          userAgent: true,
          requestId: true,
          success: true,
          errorMessage: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

// Get audit log summary/stats
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate } = body;

    const where: Record<string, unknown> = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Get counts by action type
    const actionCounts = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { id: true },
    });

    // Get counts by entity type
    const entityCounts = await prisma.auditLog.groupBy({
      by: ['entityType'],
      where,
      _count: { id: true },
    });

    // Get failure count
    const failureCount = await prisma.auditLog.count({
      where: { ...where, success: false },
    });

    // Get total count
    const totalCount = await prisma.auditLog.count({ where });

    // Get unique users
    const uniqueUsers = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: { ...where, userId: { not: null } },
    });

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount,
        failures: failureCount,
        uniqueUsers: uniqueUsers.length,
        byAction: actionCounts.reduce(
          (acc, item) => {
            acc[item.action] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        byEntityType: entityCounts.reduce(
          (acc, item) => {
            acc[item.entityType] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    });
  } catch (error) {
    console.error('Failed to fetch audit log stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit log stats' },
      { status: 500 }
    );
  }
}
