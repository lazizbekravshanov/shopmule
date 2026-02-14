import { findNearestGeofence } from '@/lib/geo-utils'

interface GeofenceData {
  id: string
  latitude: number
  longitude: number
  radiusMeters: number
  isRequired: boolean
  shopId: string | null
}

interface ShopAssignmentWithGeofences {
  Shop: {
    id: string
    Geofence: Array<{
      id: string
      latitude: number
      longitude: number
      radiusMeters: number
      isRequired: boolean
    }>
  }
}

interface GeofenceAssignmentWithData {
  Geofence: {
    id: string
    latitude: number
    longitude: number
    radiusMeters: number
    isRequired: boolean
    shopId: string | null
  }
}

export interface GeofenceResult {
  isWithin: boolean
  distance: number
  geofenceId: string | null
  shopId: string | null
}

/**
 * Validate an employee's location against their assigned geofences.
 *
 * Returns the geofence result if location is provided.
 * If the employee has required geofences but no location is provided, returns an error string.
 * If location is valid or no geofences exist, returns the result.
 */
export function validateGeofence(
  latitude: number | undefined,
  longitude: number | undefined,
  shopAssignments: ShopAssignmentWithGeofences[],
  geofenceAssignments: GeofenceAssignmentWithData[],
  fallbackShopId?: string | null,
): { result: GeofenceResult; error?: string } {
  const defaultResult: GeofenceResult = {
    isWithin: true,
    distance: 0,
    geofenceId: null,
    shopId: fallbackShopId || null,
  }

  // Collect all geofences
  const allGeofences: GeofenceData[] = [
    ...shopAssignments.flatMap((sa) =>
      sa.Shop.Geofence.map((g) => ({ ...g, shopId: sa.Shop.id }))
    ),
    ...geofenceAssignments.map((ga) => ({
      ...ga.Geofence,
      shopId: ga.Geofence.shopId,
    })),
  ]

  // Deduplicate by id
  const uniqueGeofences = Array.from(
    new Map(allGeofences.map((g) => [g.id, g])).values()
  )

  if (uniqueGeofences.length === 0) {
    return { result: defaultResult }
  }

  const hasRequiredGeofences = uniqueGeofences.some((g) => g.isRequired)

  // If employee has required geofences but no location was sent, reject
  if (hasRequiredGeofences && (latitude === undefined || longitude === undefined)) {
    return {
      result: defaultResult,
      error: 'Location is required. Please enable location services.',
    }
  }

  // No location and no required geofences — allow
  if (latitude === undefined || longitude === undefined) {
    return { result: defaultResult }
  }

  const nearest = findNearestGeofence(
    latitude,
    longitude,
    uniqueGeofences.map((g) => ({
      id: g.id,
      latitude: g.latitude,
      longitude: g.longitude,
      radiusMeters: g.radiusMeters,
    }))
  )

  if (!nearest.geofence) {
    return { result: defaultResult }
  }

  const geoData = uniqueGeofences.find((g) => g.id === nearest.geofence!.id)

  const geofenceResult: GeofenceResult = {
    isWithin: nearest.isWithin,
    distance: nearest.distance,
    geofenceId: nearest.geofence.id,
    shopId: geoData?.shopId || null,
  }

  if (geoData?.isRequired && !nearest.isWithin) {
    return {
      result: geofenceResult,
      error: `You are ${nearest.distance} meters from the allowed area. Please move closer to your assigned shop location.`,
    }
  }

  return { result: geofenceResult }
}
