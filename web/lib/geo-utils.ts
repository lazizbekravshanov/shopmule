/**
 * Geolocation utility functions for geofencing and distance calculations
 */

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Check if a point is within a circular geofence
 */
export function isWithinGeofence(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): { isWithin: boolean; distance: number } {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon)
  return {
    isWithin: distance <= radiusMeters,
    distance: Math.round(distance),
  }
}

/**
 * Find the nearest geofence from a list
 */
export function findNearestGeofence(
  pointLat: number,
  pointLon: number,
  geofences: Array<{
    id: string
    latitude: number
    longitude: number
    radiusMeters: number
  }>
): {
  geofence: (typeof geofences)[0] | null
  distance: number
  isWithin: boolean
} {
  if (geofences.length === 0) {
    return { geofence: null, distance: Infinity, isWithin: false }
  }

  let nearestGeofence = geofences[0]
  let minDistance = calculateDistance(
    pointLat,
    pointLon,
    geofences[0].latitude,
    geofences[0].longitude
  )

  for (const geofence of geofences.slice(1)) {
    const distance = calculateDistance(
      pointLat,
      pointLon,
      geofence.latitude,
      geofence.longitude
    )
    if (distance < minDistance) {
      minDistance = distance
      nearestGeofence = geofence
    }
  }

  return {
    geofence: nearestGeofence,
    distance: Math.round(minDistance),
    isWithin: minDistance <= nearestGeofence.radiusMeters,
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Get a human-readable direction from one point to another
 */
export function getDirection(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): string {
  const dLat = toLat - fromLat
  const dLon = toLon - fromLon
  const angle = (Math.atan2(dLon, dLat) * 180) / Math.PI

  if (angle >= -22.5 && angle < 22.5) return 'N'
  if (angle >= 22.5 && angle < 67.5) return 'NE'
  if (angle >= 67.5 && angle < 112.5) return 'E'
  if (angle >= 112.5 && angle < 157.5) return 'SE'
  if (angle >= 157.5 || angle < -157.5) return 'S'
  if (angle >= -157.5 && angle < -112.5) return 'SW'
  if (angle >= -112.5 && angle < -67.5) return 'W'
  return 'NW'
}
