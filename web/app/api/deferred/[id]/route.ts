import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isValidId } from '@/lib/security'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['PENDING', 'SCHEDULED', 'COMPLETED', 'DISMISSED']).optional(),
  resolvedWorkOrderId: z.string().optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const existing = await prisma.deferredWork.findFirst({
      where: { id, tenantId: session.user.tenantId! },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const data = patchSchema.parse(body)

    const updateData: Record<string, unknown> = {}
    if (data.status) {
      updateData.status = data.status
      if (data.status === 'COMPLETED' || data.status === 'DISMISSED') {
        updateData.resolvedAt = new Date()
      }
    }
    if (data.resolvedWorkOrderId !== undefined) {
      updateData.resolvedWorkOrderId = data.resolvedWorkOrderId
    }

    const updated = await prisma.deferredWork.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      resolvedAt: updated.resolvedAt?.toISOString() ?? null,
      resolvedWorkOrderId: updated.resolvedWorkOrderId,
    })
  } catch (error) {
    console.error('Error updating deferred work:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update deferred work' }, { status: 500 })
  }
}
