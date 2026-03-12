import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    const shops = await prisma.shop.findMany({
      where: { tenantId },
      include: {
        Geofences: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            radiusMeters: true,
            isRequired: true,
          },
        },
        ShopAssignments: {
          include: {
            EmployeeProfile: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            ShopAssignments: true,
            PunchRecords: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Get shops error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Plan gating — Multi-location requires ENTERPRISE
    const { checkFeatureAccess } = await import('@/lib/plans')
    const planCheck = await checkFeatureAccess(tenantId, 'multiLocation')
    if (!planCheck.allowed) {
      // Allow first shop for any plan
      const shopCount = await prisma.shop.count({ where: { tenantId } })
      if (shopCount >= 1) {
        return NextResponse.json(
          { error: planCheck.error, requiredPlan: planCheck.requiredPlan },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const {
      name,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      timezone = 'America/New_York',
      geofenceRadius = 150,
      geofenceEnabled = true,
      photoOnPunch = false,
      qrCodeEnabled = false,
      pinEnabled = true,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const shop = await prisma.shop.create({
      data: {
        tenantId,
        name,
        address,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        timezone,
        geofenceRadius,
        geofenceEnabled,
        photoOnPunch,
        qrCodeEnabled,
        pinEnabled,
      },
    })

    // If coordinates provided, create a default geofence
    if (latitude && longitude) {
      await prisma.geofence.create({
        data: {
          shopId: shop.id,
          name: `${name} - Main`,
          latitude,
          longitude,
          radiusMeters: geofenceRadius,
          isRequired: geofenceEnabled,
        },
      })
    }

    return NextResponse.json({
      success: true,
      shop,
    })
  } catch (error) {
    console.error('Create shop error:', error)
    return NextResponse.json(
      { error: 'Failed to create shop' },
      { status: 500 }
    )
  }
}
