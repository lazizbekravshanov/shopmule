"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Bell, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusIndicator } from "./status-indicator"
import { UptimeMetrics } from "./uptime-metrics"
import { UptimeCalendar } from "./uptime-calendar"
import { ComponentStatusList } from "./component-status"
import { IncidentList } from "./incident-list"
import { getMockStatus, type PlatformStatus } from "@/lib/status"

interface StatusSectionProps {
  initialData?: PlatformStatus
  refreshInterval?: number // in milliseconds
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export function StatusSection({
  initialData,
  refreshInterval = 60000, // 1 minute default
}: StatusSectionProps) {
  const [status, setStatus] = useState<PlatformStatus>(
    initialData || getMockStatus()
  )
  const [isExpanded, setIsExpanded] = useState(false)

  // Refresh status data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getMockStatus())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  return (
    <section
      className="bg-gray-50 border-t border-gray-200"
      aria-labelledby="status-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            id="status-heading"
            className="text-3xl font-light text-gray-900 mb-2"
          >
            Platform Status
          </h2>
          <p className="text-muted-foreground">
            Real-time operational status and historical uptime data
          </p>
        </motion.div>

        {/* Current Status Banner */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <StatusIndicator
              status={status.currentStatus}
              message={status.statusMessage}
              lastUpdated={status.lastUpdated}
              size="lg"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={toggleExpanded}
              >
                {isExpanded ? "Show less" : "Show details"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Expanded Content */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="space-y-8 pb-8">
            {/* Uptime Metrics */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <UptimeMetrics metrics={status.uptime} />
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Component Status */}
              <motion.div
                {...fadeInUp}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <ComponentStatusList components={status.components} />
              </motion.div>

              {/* 90-Day Calendar */}
              <motion.div
                {...fadeInUp}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <UptimeCalendar data={status.historicalData} />
              </motion.div>
            </div>

            {/* Incident History */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <IncidentList incidents={status.incidents} />
            </motion.div>
          </div>
        </motion.div>

        {/* Always Visible Summary */}
        {!isExpanded && (
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Quick Uptime */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <p className="text-3xl font-semibold text-green-600">
                {status.uptime.last30Days.toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                30-day uptime
              </p>
            </div>

            {/* Component Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <p className="text-3xl font-semibold text-green-600">
                {status.components.filter((c) => c.status === "operational").length}/
                {status.components.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Systems operational
              </p>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <p className="text-3xl font-semibold text-gray-900">
                {status.incidents.filter((i) => i.status !== "resolved").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Active incidents
              </p>
            </div>
          </motion.div>
        )}

        {/* Subscribe Actions */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="w-4 h-4" />
            Subscribe to updates
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Rss className="w-4 h-4" />
            RSS feed
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View full status page
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
