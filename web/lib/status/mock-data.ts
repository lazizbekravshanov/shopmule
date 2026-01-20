import type { PlatformStatus, DayStatus, StatusLevel } from "./types"

function generateHistoricalData(days: number): DayStatus[] {
  const data: DayStatus[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    // Generate mostly operational days with occasional issues
    const rand = Math.random()
    let status: StatusLevel = "operational"
    let uptimePercent = 100
    let incidents = 0

    if (rand > 0.95) {
      // ~5% chance of degraded
      status = "degraded"
      uptimePercent = 98 + Math.random() * 1.9
      incidents = 1
    } else if (rand > 0.98) {
      // ~2% chance of outage
      status = "outage"
      uptimePercent = 95 + Math.random() * 3
      incidents = 1
    } else if (rand > 0.92) {
      // ~3% chance of maintenance
      status = "maintenance"
      uptimePercent = 99 + Math.random() * 0.9
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

export const mockPlatformStatus: PlatformStatus = {
  currentStatus: "operational",
  statusMessage: "All systems operational",
  lastUpdated: new Date().toISOString(),
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
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      duration: 45,
    },
    {
      id: "inc-002",
      title: "Scheduled Database Maintenance",
      description: "Routine database maintenance and optimization.",
      status: "resolved",
      severity: "minor",
      affectedComponents: ["db"],
      startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
      duration: 120,
    },
  ],
  historicalData: generateHistoricalData(90),
}

export function getMockStatus(): PlatformStatus {
  return {
    ...mockPlatformStatus,
    lastUpdated: new Date().toISOString(),
  }
}
