"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Search, Eye } from "lucide-react"
import type { Incident } from "@/lib/status"

interface IncidentListProps {
  incidents: Incident[]
  maxItems?: number
}

const getStatusIcon = (status: Incident["status"]) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "monitoring":
      return <Eye className="w-4 h-4 text-blue-600" />
    case "identified":
      return <AlertCircle className="w-4 h-4 text-yellow-600" />
    case "investigating":
      return <Search className="w-4 h-4 text-orange-600" />
  }
}

const getSeverityColor = (severity: Incident["severity"]) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-200"
    case "major":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "minor":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
  }
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const IncidentItem = memo(function IncidentItem({
  incident,
}: {
  incident: Incident
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-lg">
      <div className="mt-0.5">{getStatusIcon(incident.status)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-gray-900">{incident.title}</h4>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border capitalize",
              getSeverityColor(incident.severity)
            )}
          >
            {incident.severity}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {incident.description}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{formatDate(incident.startedAt)}</span>
          {incident.duration && (
            <span>Duration: {formatDuration(incident.duration)}</span>
          )}
          <span className="capitalize">{incident.status}</span>
        </div>
        {incident.affectedComponents.length > 0 && (
          <div className="flex gap-1 mt-2">
            {incident.affectedComponents.map((comp) => (
              <span
                key={comp}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
              >
                {comp}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export const IncidentList = memo(function IncidentList({
  incidents,
  maxItems = 5,
}: IncidentListProps) {
  const displayedIncidents = incidents.slice(0, maxItems)
  const hasMore = incidents.length > maxItems

  if (incidents.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
          Recent Incidents
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p>No incidents reported in the last 90 days</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
        Recent Incidents
      </h3>
      <div className="space-y-3">
        {displayedIncidents.map((incident) => (
          <IncidentItem key={incident.id} incident={incident} />
        ))}
      </div>
      {hasMore && (
        <button className="text-sm text-primary hover:underline">
          View all {incidents.length} incidents
        </button>
      )}
    </div>
  )
})
