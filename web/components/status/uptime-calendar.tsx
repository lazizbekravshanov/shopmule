"use client"

import { memo, useState } from "react"
import { cn } from "@/lib/utils"
import type { DayStatus, StatusLevel } from "@/lib/status"

interface UptimeCalendarProps {
  data: DayStatus[]
}

const getColorForStatus = (status: StatusLevel, uptimePercent: number) => {
  switch (status) {
    case "operational":
      return "bg-green-400 hover:bg-green-500"
    case "degraded":
      return "bg-yellow-400 hover:bg-yellow-500"
    case "outage":
      return "bg-red-400 hover:bg-red-500"
    case "maintenance":
      return "bg-blue-400 hover:bg-blue-500"
    default:
      return "bg-gray-200"
  }
}

interface TooltipProps {
  day: DayStatus
  position: { x: number; y: number }
}

const Tooltip = ({ day, position }: TooltipProps) => {
  const date = new Date(day.date)
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  return (
    <div
      className="absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none"
      style={{
        left: position.x,
        top: position.y - 60,
        transform: "translateX(-50%)",
      }}
    >
      <p className="font-medium">{formatted}</p>
      <p className="text-gray-300">
        {day.uptimePercent.toFixed(2)}% uptime
      </p>
      {day.incidents > 0 && (
        <p className="text-yellow-300">
          {day.incidents} incident{day.incidents > 1 ? "s" : ""}
        </p>
      )}
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid #111827",
        }}
      />
    </div>
  )
}

export const UptimeCalendar = memo(function UptimeCalendar({
  data,
}: UptimeCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    day: DayStatus
    position: { x: number; y: number }
  } | null>(null)

  const handleMouseEnter = (
    day: DayStatus,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoveredDay({
      day,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    })
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
          90-Day Uptime
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-400" />
            Operational
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-yellow-400" />
            Degraded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-400" />
            Outage
          </span>
        </div>
      </div>

      <div className="relative">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(10px, 1fr))",
          }}
          role="img"
          aria-label="90-day uptime calendar showing daily operational status"
        >
          {data.map((day) => (
            <div
              key={day.date}
              className={cn(
                "aspect-square rounded-sm cursor-pointer transition-all duration-150",
                getColorForStatus(day.status, day.uptimePercent)
              )}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={handleMouseLeave}
              role="gridcell"
              aria-label={`${day.date}: ${day.uptimePercent}% uptime`}
            />
          ))}
        </div>

        {hoveredDay && (
          <Tooltip day={hoveredDay.day} position={hoveredDay.position} />
        )}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
})
