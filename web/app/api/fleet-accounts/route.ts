import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await request.json()
    const {
      companyName,
      paymentTerms = 'NET_30',
      discountRatePercent = 0,
      creditLimit = 0,
      notes = '',
    } = body

    if (!companyName?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    const count = await prisma.fleetAccount.count({ where: { tenantId } })
    const accountNumber = `FL-${String(count + 1).padStart(4, '0')}`

    const account = await prisma.fleetAccount.create({
      data: {
        tenantId,
        companyName: companyName.trim(),
        accountNumber,
        status: 'ACTIVE',
        paymentTerms,
        discountRatePercent: parseFloat(discountRatePercent) || 0,
        creditLimit: parseFloat(creditLimit) || 0,
        currentBalance: 0,
        notes,
      },
    })

    return NextResponse.json({ success: true, account }, { status: 201 })
  } catch (error) {
    console.error('Error creating fleet account:', error)
    return NextResponse.json({ error: 'Failed to create fleet account' }, { status: 500 })
  }
}
