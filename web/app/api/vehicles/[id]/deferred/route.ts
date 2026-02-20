import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isValidId } from '@/lib/security'
import { z } from 'zod'

const createSchema = z.object({
  description: z.string().min(1).max(500),
  category: z.string().max(100).optional().nullable(),
  estimatedCost: z.number().min(0).optional().nullable(),
  declinedReason: z.string().max(500).optional().nullable(),
  sourceWorkOrderId: z.string().optional().nullable(),
})

function transform(d: any) {
  return {
    id: d.id,
    vehicleId: d.vehicleId,
    description: d.description,
    category: d.category,
    estimatedCost: d.estimatedCost,
    declinedAt: d.declinedAt.toISOString(),
    declinedReason: d.declinedReason,
    status: d.status,
    resolvedAt: d.resolvedAt?.toISOString() ?? null,
    sourceWorkOrderId: d.sourceWorkOrderId,
    resolvedWorkOrderId: d.resolvedWorkOrderId,
    createdAt: d.createdAt.toISOString(),
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: vehicleId } = await params
    if (!isValidId(vehicleId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const items = await prisma.deferredWork.findMany({
      where: {
        vehicleId,
        status: 'PENDING',
        Tenant: { id: session.user.tenantId! },
      },
      orderBy: { declinedAt: 'desc' },
    })

    return NextResponse.json(items.map(transform))
  } catch (error) {
    console.error('Error fetching deferred work:', error)
    return NextResponse.json({ error: 'Failed to fetch deferred work' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tenantId = session.user.tenantId
    const { id: vehicleId } = await params
    if (!isValidId(vehicleId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle || vehicle.tenantId !== tenantId) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

    const body = await request.json()
    const data = createSchema.parse(body)

    if (data.sourceWorkOrderId && !isValidId(data.sourceWorkOrderId)) {
      return NextResponse.json({ error: 'Invalid sourceWorkOrderId' }, { status: 400 })
    }

    const item = await prisma.deferredWork.create({
      data: {
        tenantId: vehicle.tenantId,
        vehicleId,
        description: data.description,
        category: data.category ?? null,
        estimatedCost: data.estimatedCost ?? null,
        declinedReason: data.declinedReason ?? null,
        sourceWorkOrderId: data.sourceWorkOrderId ?? null,
      },
    })

    return NextResponse.json(transform(item), { status: 201 })
  } catch (error) {
    console.error('Error creating deferred work:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create deferred work' }, { status: 500 })
  }
}
