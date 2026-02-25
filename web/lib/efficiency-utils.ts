/**
 * Shared efficiency/time utilities used by both the per-employee performance
 * route and the shop-wide efficiency route.
 */

export function computeHoursFromPunches(
  punches: { type: string; timestamp: Date }[],
  now: Date
): number {
  let totalMs = 0
  let clockInTime: Date | null = null

  for (const punch of punches) {
    if (punch.type === "CLOCK_IN") {
      clockInTime = punch.timestamp
    } else if (punch.type === "CLOCK_OUT" && clockInTime) {
      totalMs += punch.timestamp.getTime() - clockInTime.getTime()
      clockInTime = null
    }
  }

  // If still clocked in, count time up to now
  if (clockInTime) {
    totalMs += now.getTime() - clockInTime.getTime()
  }

  return totalMs / (1000 * 60 * 60)
}

export function getPeriodRange(period: string): Date {
  const now = new Date()

  switch (period) {
    case "week": {
      const start = new Date(now)
      start.setDate(start.getDate() - start.getDay())
      start.setHours(0, 0, 0, 0)
      return start
    }
    case "quarter": {
      const quarter = Math.floor(now.getMonth() / 3)
      return new Date(now.getFullYear(), quarter * 3, 1)
    }
    case "year": {
      return new Date(now.getFullYear(), 0, 1)
    }
    default: {
      // month
      return new Date(now.getFullYear(), now.getMonth(), 1)
    }
  }
}
