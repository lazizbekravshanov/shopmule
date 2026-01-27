'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from './status-indicator';
import { UptimeMetrics } from './uptime-metrics';
import { UptimeCalendar } from './uptime-calendar';
import { ComponentStatusList } from './component-status';
import { IncidentList } from './incident-list';
import { getMockStatus, type PlatformStatus } from '@/lib/status';

interface StatusSectionProps {
  initialData?: PlatformStatus;
  refreshInterval?: number;
}

export function StatusSection({
  initialData,
  refreshInterval = 60000,
}: StatusSectionProps) {
  const [status, setStatus] = useState<PlatformStatus>(
    initialData || getMockStatus()
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getMockStatus());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <section
      className="py-24 bg-neutral-50 border-y border-neutral-200"
      aria-labelledby="status-heading"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
            Status
          </span>
          <h2
            id="status-heading"
            className="mt-2 text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight"
          >
            System status.
          </h2>
        </motion.div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg border border-neutral-200 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <StatusIndicator
              status={status.currentStatus}
              message={status.statusMessage}
              lastUpdated={status.lastUpdated}
              size="lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="text-neutral-600 hover:text-neutral-900"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
              {isExpanded ? (
                <ChevronUp className="ml-2 w-4 h-4" />
              ) : (
                <ChevronDown className="ml-2 w-4 h-4" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Expanded Details */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="space-y-6 pb-6">
            {/* Uptime Metrics */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <UptimeMetrics metrics={status.uptime} />
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <ComponentStatusList components={status.components} />
              </div>
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <UptimeCalendar data={status.historicalData} />
              </div>
            </div>

            {/* Incidents */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <IncidentList incidents={status.incidents} />
            </div>
          </div>
        </motion.div>

        {/* Summary Cards (when collapsed) */}
        {!isExpanded && (
          <div className="grid md:grid-cols-3 gap-px bg-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-white p-6 text-center">
              <p className="text-3xl font-bold text-neutral-900 tracking-tight">
                {status.uptime.last30Days.toFixed(1)}%
              </p>
              <p className="text-sm text-neutral-500 mt-1">30-day uptime</p>
            </div>
            <div className="bg-white p-6 text-center">
              <p className="text-3xl font-bold text-neutral-900 tracking-tight">
                {status.components.filter((c) => c.status === 'operational').length}/
                {status.components.length}
              </p>
              <p className="text-sm text-neutral-500 mt-1">Systems operational</p>
            </div>
            <div className="bg-white p-6 text-center">
              <p className="text-3xl font-bold text-neutral-900 tracking-tight">
                {status.incidents.filter((i) => i.status !== 'resolved').length}
              </p>
              <p className="text-sm text-neutral-500 mt-1">Active incidents</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
