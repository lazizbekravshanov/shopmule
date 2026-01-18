"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG, type StatusLevel } from "@/lib/status"

interface StatusIndicatorProps {
  status: StatusLevel
  message?: string
  lastUpdated?: string
  showPulse?: boolean
  size?: "sm" | "md" | "lg"
}

export const StatusIndicator = memo(function StatusIndicator({
  status,
  message,
  lastUpdated,
  showPulse = true,
  size = "md",
}: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status]

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  const formatLastUpdated = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <span
          className={cn(
            "rounded-full",
            dotSizes[size],
            config.dotColor
          )}
          aria-hidden="true"
        />
        {showPulse && status === "operational" && (
          <span
            className={cn(
              "absolute rounded-full animate-ping opacity-75",
              dotSizes[size],
              config.dotColor
            )}
            aria-hidden="true"
          />
        )}
      </div>
      <div>
        <p className={cn("font-medium", textSizes[size], config.color)}>
          {message || config.label}
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </div>
    </div>
  )
})
