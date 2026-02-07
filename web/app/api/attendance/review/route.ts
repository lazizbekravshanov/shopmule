import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const daysBack = parseInt(searchParams.get('daysBack') || '7')
    const onlyFlagged = searchParams.get('onlyFlagged') === 'true'

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    startDate.setHours(0, 0, 0, 0)

    // Build where clause
    const whereClause: Record<string, unknown> = {
      timestamp: { gte: startDate },
    }

    if (shopId) {
      whereClause.shopId = shopId
    }

    // Get punches that may need review
    const punches = await prisma.punchRecord.findMany({
      where: whereClause,
      include: {
        EmployeeProfile: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    })

    // Transform punches and add flags
    const punchesForReview = punches.map((punch) => {
      const flags = {
        outsideGeofence: punch.isWithinGeofence === false,
        offlinePunch: punch.isOfflinePunch,
        manualEntry: punch.punchMethod === 'MANUAL',
        missingPhoto: !punch.photoUrl && punch.type === 'CLOCK_IN',
        unusual: false, // Could add time-based anomaly detection here
      }

      // Check for unusual patterns (e.g., very early/late punches)
      const punchHour = new Date(punch.timestamp).getHours()
      if (punchHour < 4 || punchHour > 22) {
        flags.unusual = true
      }

      const hasFlagged = Object.values(flags).some(Boolean)

      // If only flagged is requested, skip unflagged punches
      if (onlyFlagged && !hasFlagged) {
        return null
      }

      return {
        id: punch.id,
        employee: {
          id: punch.EmployeeProfile.id,
          name: punch.EmployeeProfile.name,
          photoUrl: punch.EmployeeProfile.photoUrl,
        },
        type: punch.type,
        timestamp: punch.timestamp.toISOString(),
        shop: punch.Shop ? {
          id: punch.Shop.id,
          name: punch.Shop.name,
        } : undefined,
        location: punch.latitude && punch.longitude ? {
          latitude: punch.latitude,
          longitude: punch.longitude,
          isWithinGeofence: punch.isWithinGeofence ?? true,
          distanceFromGeofence: punch.distanceFromGeofence ?? undefined,
        } : undefined,
        punchMethod: punch.punchMethod,
        photoUrl: punch.photoUrl,
        deviceInfo: punch.deviceInfo,
        ipAddress: punch.ipAddress,
        isOfflinePunch: punch.isOfflinePunch,
        notes: punch.notes,
        flags,
      }
    }).filter(Boolean)

    // Summary stats
    const flaggedCount = punchesForReview.filter(
      p => p && Object.values(p.flags).some(Boolean)
    ).length
    const outsideGeofenceCount = punchesForReview.filter(
      p => p?.flags.outsideGeofence
    ).length
    const offlineCount = punchesForReview.filter(
      p => p?.flags.offlinePunch
    ).length
    const manualCount = punchesForReview.filter(
      p => p?.flags.manualEntry
    ).length

    return NextResponse.json({
      punches: punchesForReview,
      summary: {
        total: punchesForReview.length,
        flagged: flaggedCount,
        outsideGeofence: outsideGeofenceCount,
        offline: offlineCount,
        manual: manualCount,
      },
      period: {
        start: startDate,
        end: new Date(),
        days: daysBack,
      },
    })
  } catch (error) {
    console.error('Get punches for review error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch punches for review' },
      { status: 500 }
    )
  }
}

// Approve/reject/edit punches
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, punchId, reason, newTimestamp, notes } = body

    if (!punchId) {
      return NextResponse.json(
        { error: 'punchId is required' },
        { status: 400 }
      )
    }

    const punch = await prisma.punchRecord.findUnique({
      where: { id: punchId },
    })

    if (!punch) {
      return NextResponse.json(
        { error: 'Punch not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'approve':
        // Mark punch as approved (could add a reviewedAt/reviewedBy field)
        await prisma.punchRecord.update({
          where: { id: punchId },
          data: {
            notes: punch.notes
              ? `${punch.notes}\n[APPROVED]`
              : '[APPROVED]',
          },
        })
        return NextResponse.json({
          success: true,
          message: 'Punch approved',
        })

      case 'reject':
        if (!reason) {
          return NextResponse.json(
            { error: 'Reason is required for rejection' },
            { status: 400 }
          )
        }
        // Soft delete by adding rejection note
        await prisma.punchRecord.update({
          where: { id: punchId },
          data: {
            notes: punch.notes
              ? `${punch.notes}\n[REJECTED: ${reason}]`
              : `[REJECTED: ${reason}]`,
          },
        })
        return NextResponse.json({
          success: true,
          message: 'Punch rejected',
        })

      case 'edit':
        const updateData: Record<string, unknown> = {}
        if (newTimestamp) {
          updateData.timestamp = new Date(newTimestamp)
        }
        if (notes !== undefined) {
          updateData.notes = punch.notes
            ? `${punch.notes}\n[EDITED: ${notes}]`
            : `[EDITED: ${notes}]`
        }
        await prisma.punchRecord.update({
          where: { id: punchId },
          data: updateData,
        })
        return NextResponse.json({
          success: true,
          message: 'Punch updated',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Review punch error:', error)
    return NextResponse.json(
      { error: 'Failed to process review action' },
      { status: 500 }
    )
  }
}
