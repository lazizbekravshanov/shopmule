"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import type { UptimeMetrics as UptimeMetricsType } from "@/lib/status"

interface UptimeMetricsProps {
  metrics: UptimeMetricsType
}

interface MetricItemProps {
  label: string
  value: number
  highlight?: boolean
}

const MetricItem = memo(function MetricItem({
  label,
  value,
  highlight = false,
}: MetricItemProps) {
  const getColor = (percent: number) => {
    if (percent >= 99.9) return "text-green-600"
    if (percent >= 99) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center p-4 rounded-lg",
        highlight ? "bg-gray-50" : ""
      )}
    >
      <span className={cn("text-2xl font-semibold", getColor(value))}>
        {value.toFixed(2)}%
      </span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  )
})

export const UptimeMetrics = memo(function UptimeMetrics({
  metrics,
}: UptimeMetricsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
        Uptime
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricItem label="24 hours" value={metrics.last24Hours} highlight />
        <MetricItem label="7 days" value={metrics.last7Days} />
        <MetricItem label="30 days" value={metrics.last30Days} />
        <MetricItem label="90 days" value={metrics.last90Days} />
      </div>

      {/* Progress bar for 30-day uptime */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">30-day uptime</span>
          <span className="font-medium">{metrics.last30Days.toFixed(2)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              metrics.last30Days >= 99.9
                ? "bg-green-500"
                : metrics.last30Days >= 99
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${Math.min(metrics.last30Days, 100)}%` }}
            role="progressbar"
            aria-valuenow={metrics.last30Days}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`30-day uptime: ${metrics.last30Days}%`}
          />
        </div>
      </div>
    </div>
  )
})
