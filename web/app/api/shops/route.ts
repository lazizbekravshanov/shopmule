import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeGeofences = searchParams.get('includeGeofences') === 'true'
    const includeEmployees = searchParams.get('includeEmployees') === 'true'

    const shops = await prisma.shop.findMany({
      include: {
        Geofences: includeGeofences ? {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            radiusMeters: true,
            isRequired: true,
          },
        } : false,
        ShopAssignments: includeEmployees ? {
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
