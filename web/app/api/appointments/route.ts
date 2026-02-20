import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { isValidId } from '@/lib/security'

const createSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().optional().nullable(),
  technicianId: z.string().optional().nullable(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(480).default(60),
  type: z.enum(['APPOINTMENT', 'DROP_OFF', 'PICKUP', 'FOLLOW_UP']).default('APPOINTMENT'),
  notes: z.string().max(1000).optional().nullable(),
  bayNumber: z.string().max(10).optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      where.scheduledStart = dateFilter
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledStart: 'asc' },
      include: {
        Customer: { select: { id: true, name: true, phone: true } },
        Vehicle: { select: { id: true, make: true, model: true, year: true, licensePlate: true } },
        Technician: { select: { id: true, name: true, role: true } },
      },
    })

    const transformed = appointments.map((a) => ({
      id: a.id,
      type: a.type,
      status: a.status,
      scheduledStart: a.scheduledStart.toISOString(),
      scheduledEnd: a.scheduledEnd.toISOString(),
      durationMinutes: a.durationMinutes,
      bayNumber: a.bayNumber,
      notes: a.notes,
      customer: a.Customer ? { id: a.Customer.id, name: a.Customer.name, phone: a.Customer.phone } : null,
      vehicle: a.Vehicle
        ? { id: a.Vehicle.id, make: a.Vehicle.make, model: a.Vehicle.model, year: a.Vehicle.year, licensePlate: a.Vehicle.licensePlate }
        : null,
      technician: a.Technician ? { id: a.Technician.id, name: a.Technician.name, role: a.Technician.role } : null,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await request.json()
    const data = createSchema.parse(body)

    if (!isValidId(data.customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } })
    if (!customer || customer.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        customerId: data.customerId,
        vehicleId: data.vehicleId ?? null,
        technicianId: data.technicianId ?? null,
        scheduledStart: new Date(data.scheduledStart),
        scheduledEnd: new Date(data.scheduledEnd),
        durationMinutes: data.durationMinutes,
        type: data.type,
        notes: data.notes ?? null,
        bayNumber: data.bayNumber ?? null,
      },
      include: {
        Customer: { select: { id: true, name: true, phone: true } },
        Vehicle: { select: { id: true, make: true, model: true, year: true } },
        Technician: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      id: appointment.id,
      type: appointment.type,
      status: appointment.status,
      scheduledStart: appointment.scheduledStart.toISOString(),
      scheduledEnd: appointment.scheduledEnd.toISOString(),
      durationMinutes: appointment.durationMinutes,
      customer: appointment.Customer,
      vehicle: appointment.Vehicle,
      technician: appointment.Technician,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
