import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    const accounts = await prisma.fleetAccount.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        Customers: {
          where: { deletedAt: null },
          select: { id: true },
        },
        Vehicles: {
          where: { deletedAt: null },
          select: { id: true },
        },
        WorkOrders: {
          where: { status: { not: 'COMPLETED' } },
          select: { id: true },
        },
      },
    })

    const transformed = accounts.map((a) => ({
      id: a.id,
      companyName: a.companyName,
      accountNumber: a.accountNumber,
      status: a.status,
      paymentTerms: a.paymentTerms,
      discountRatePercent: a.discountRatePercent,
      creditLimit: a.creditLimit,
      currentBalance: a.currentBalance,
      autoApproveUnder: a.autoApproveUnder,
      notes: a.notes,
      customerCount: a.Customers.length,
      vehicleCount: a.Vehicles.length,
      activeJobCount: a.WorkOrders.length,
      createdAt: a.createdAt.toISOString(),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching fleet accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch fleet accounts' }, { status: 500 })
  }
}
