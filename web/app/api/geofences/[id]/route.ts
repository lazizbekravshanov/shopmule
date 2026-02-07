import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const geofence = await prisma.geofence.findUnique({
      where: { id },
      include: {
        Shop: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        GeofenceAssignment: {
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
            PunchRecord: true,
          },
        },
      },
    })

    if (!geofence) {
      return NextResponse.json(
        { error: 'Geofence not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ geofence })
  } catch (error) {
    console.error('Get geofence error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geofence' },
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
    const {
      name,
      latitude,
      longitude,
      radiusMeters,
      isRequired,
      isActive,
      employeeIds,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (radiusMeters !== undefined) updateData.radiusMeters = radiusMeters
    if (isRequired !== undefined) updateData.isRequired = isRequired
    if (isActive !== undefined) updateData.isActive = isActive

    // Update geofence
    const geofence = await prisma.geofence.update({
      where: { id },
      data: updateData,
      include: {
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Update employee assignments if provided
    if (employeeIds !== undefined) {
      // Remove existing assignments
      await prisma.geofenceAssignment.deleteMany({
        where: { geofenceId: id },
      })

      // Create new assignments
      if (employeeIds.length > 0) {
        await prisma.geofenceAssignment.createMany({
          data: employeeIds.map((employeeId: string) => ({
            geofenceId: id,
            employeeId,
          })),
        })
      }
    }

    // Fetch updated geofence with assignments
    const updatedGeofence = await prisma.geofence.findUnique({
      where: { id },
      include: {
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
        GeofenceAssignment: {
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
      geofence: updatedGeofence,
    })
  } catch (error) {
    console.error('Update geofence error:', error)
    return NextResponse.json(
      { error: 'Failed to update geofence' },
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

    // Check if geofence has punch records
    const punchCount = await prisma.punchRecord.count({
      where: { geofenceId: id },
    })

    if (punchCount > 0) {
      // Soft delete by deactivating instead of hard delete
      await prisma.geofence.update({
        where: { id },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        message: 'Geofence deactivated (has associated punch records)',
        deactivated: true,
      })
    }

    // Hard delete if no punch records
    await prisma.geofenceAssignment.deleteMany({
      where: { geofenceId: id },
    })

    await prisma.geofence.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Geofence deleted',
      deactivated: false,
    })
  } catch (error) {
    console.error('Delete geofence error:', error)
    return NextResponse.json(
      { error: 'Failed to delete geofence' },
      { status: 500 }
    )
  }
}
