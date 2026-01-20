import type { PlatformStatus, DayStatus, StatusLevel } from "./types"

// Fixed reference date to prevent hydration mismatch
const REFERENCE_DATE = new Date("2026-01-20T00:00:00.000Z")

// Seeded random for consistent server/client rendering
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Hash string to number for seeding
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function generateHistoricalData(days: number): DayStatus[] {
  const data: DayStatus[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(REFERENCE_DATE)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    // Use seeded random based on date string for consistency
    const seed = hashString(dateStr)
    const rand = seededRandom(seed)

    let status: StatusLevel = "operational"
    let uptimePercent = 100
    let incidents = 0

    if (rand > 0.95) {
      status = "degraded"
      uptimePercent = 98 + seededRandom(seed + 1) * 1.9
      incidents = 1
    } else if (rand > 0.98) {
      status = "outage"
      uptimePercent = 95 + seededRandom(seed + 2) * 3
      incidents = 1
    } else if (rand > 0.92) {
      status = "maintenance"
      uptimePercent = 99 + seededRandom(seed + 3) * 0.9
      incidents = 0
    }

    data.push({
      date: dateStr,
      uptimePercent: Number(uptimePercent.toFixed(2)),
      status,
      incidents,
    })
  }

  return data
}

// Pre-compute static incident dates
const incident1Start = new Date(REFERENCE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
const incident1Resolved = new Date(REFERENCE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
const incident2Start = new Date(REFERENCE_DATE.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
const incident2Resolved = new Date(REFERENCE_DATE.getTime() - 10 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString()

export const mockPlatformStatus: PlatformStatus = {
  currentStatus: "operational",
  statusMessage: "All systems operational",
  lastUpdated: REFERENCE_DATE.toISOString(),
  uptime: {
    last24Hours: 100,
    last7Days: 99.98,
    last30Days: 99.95,
    last90Days: 99.92,
  },
  components: [
    { id: "api", name: "API Server", status: "operational" },
    { id: "db", name: "Database", status: "operational" },
    { id: "auth", name: "Authentication", status: "operational" },
    { id: "storage", name: "File Storage", status: "operational" },
    { id: "cdn", name: "CDN", status: "operational" },
    { id: "payments", name: "Payment Gateway", status: "operational" },
  ],
  incidents: [
    {
      id: "inc-001",
      title: "API Response Delays",
      description: "Some users experienced slower than usual API response times.",
      status: "resolved",
      severity: "minor",
      affectedComponents: ["api"],
      startedAt: incident1Start,
      resolvedAt: incident1Resolved,
      duration: 45,
    },
    {
      id: "inc-002",
      title: "Scheduled Database Maintenance",
      description: "Routine database maintenance and optimization.",
      status: "resolved",
      severity: "minor",
      affectedComponents: ["db"],
      startedAt: incident2Start,
      resolvedAt: incident2Resolved,
      duration: 120,
    },
  ],
  historicalData: generateHistoricalData(90),
}

export function getMockStatus(): PlatformStatus {
  return {
    ...mockPlatformStatus,
    lastUpdated: REFERENCE_DATE.toISOString(),
  }
}
