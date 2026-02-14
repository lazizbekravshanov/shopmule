import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        Geofences: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            radiusMeters: true,
            isRequired: true,
            isActive: true,
            _count: {
              select: { GeofenceAssignments: true },
            },
          },
        },
        ShopAssignments: {
          include: {
            EmployeeProfile: {
              select: {
                id: true,
                name: true,
                role: true,
                photoUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            PunchRecords: true,
          },
        },
      },
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Get shop error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shop' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const shop = await prisma.shop.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({
      success: true,
      shop,
    })
  } catch (error) {
    console.error('Update shop error:', error)
    return NextResponse.json(
      { error: 'Failed to update shop' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.shop.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Shop deleted',
    })
  } catch (error) {
    console.error('Delete shop error:', error)
    return NextResponse.json(
      { error: 'Failed to delete shop' },
      { status: 500 }
    )
  }
}
