export type StatusLevel = "operational" | "degraded" | "outage" | "maintenance"

export interface ComponentStatus {
  id: string
  name: string
  status: StatusLevel
  description?: string
}

export interface DayStatus {
  date: string // ISO date string (YYYY-MM-DD)
  uptimePercent: number
  status: StatusLevel
  incidents: number
}

export interface Incident {
  id: string
  title: string
  description: string
  status: "investigating" | "identified" | "monitoring" | "resolved"
  severity: "minor" | "major" | "critical"
  affectedComponents: string[]
  startedAt: string // ISO date string
  resolvedAt?: string // ISO date string
  duration?: number // minutes
  updates?: IncidentUpdate[]
}

export interface IncidentUpdate {
  id: string
  message: string
  status: Incident["status"]
  createdAt: string
}

export interface UptimeMetrics {
  last24Hours: number
  last7Days: number
  last30Days: number
  last90Days: number
}

export interface PlatformStatus {
  currentStatus: StatusLevel
  statusMessage: string
  lastUpdated: string
  uptime: UptimeMetrics
  components: ComponentStatus[]
  incidents: Incident[]
  historicalData: DayStatus[]
}

export const STATUS_CONFIG: Record<StatusLevel, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  dotColor: string
}> = {
  operational: {
    label: "Operational",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    dotColor: "bg-green-500",
  },
  degraded: {
    label: "Degraded Performance",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  outage: {
    label: "Major Outage",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
  },
  maintenance: {
    label: "Under Maintenance",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
  },
}
