import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const includeAssignments = searchParams.get('includeAssignments') === 'true'

    const geofences = await prisma.geofence.findMany({
      where: {
        Shop: { tenantId },
        ...(shopId ? { shopId } : {}),
      },
      include: {
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
        GeofenceAssignments: includeAssignments ? {
          include: {
            EmployeeProfile: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        } : false,
        _count: {
          select: {
            GeofenceAssignments: true,
            PunchRecords: true,
          },
        },
      },
      orderBy: [
        { Shop: { name: 'asc' } },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ geofences })
  } catch (error) {
    console.error('Get geofences error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geofences' },
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
    const body = await request.json()
    const {
      shopId,
      name,
      latitude,
      longitude,
      radiusMeters = 150,
      isRequired = true,
      isActive = true,
      employeeIds = [],
    } = body

    if (!shopId) {
      return NextResponse.json(
        { error: 'shopId is required' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Verify shop exists and belongs to tenant
    const shop = await prisma.shop.findFirst({
      where: { id: shopId, tenantId },
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    const geofence = await prisma.geofence.create({
      data: {
        shopId,
        name,
        latitude,
        longitude,
        radiusMeters,
        isRequired,
        isActive,
        GeofenceAssignments: employeeIds.length > 0 ? {
          create: employeeIds.map((employeeId: string) => ({
            employeeId,
          })),
        } : undefined,
      },
      include: {
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
        GeofenceAssignments: {
          include: {
            EmployeeProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      geofence,
    })
  } catch (error) {
    console.error('Create geofence error:', error)
    return NextResponse.json(
      { error: 'Failed to create geofence' },
      { status: 500 }
    )
  }
}
