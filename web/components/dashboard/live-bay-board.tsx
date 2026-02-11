'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Truck,
  User,
  Clock,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  AlertCircle,
  Wrench,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface BayAssignment {
  id: string
  bayNumber: number
  status: 'occupied' | 'available' | 'maintenance'
  vehicle?: {
    make: string
    model: string
    year: number
    licensePlate: string
  }
  workOrder?: {
    id: string
    description: string
    status: 'in-progress' | 'waiting-parts' | 'inspection'
    startTime: string
    estimatedCompletion: string
  }
  technician?: {
    name: string
    avatar?: string
  }
}

const statusConfig = {
  'in-progress': { label: 'In Progress', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
  'waiting-parts': { label: 'Waiting Parts', color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-900/30' },
  'inspection': { label: 'Inspection', color: 'bg-purple-500', textColor: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-900/30' },
}

export function LiveBayBoard() {
  const [selectedBay, setSelectedBay] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery<BayAssignment[]>({
    queryKey: ['dashboard', 'bays'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/bays')
      if (!res.ok) {
        throw new Error('Failed to fetch bay data')
      }
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch bay data')
      }
      return json.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
    retry: 2,
  })

  const bays = data || []
  const occupiedCount = bays.filter(b => b.status === 'occupied').length
  const availableCount = bays.filter(b => b.status === 'available').length

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Live Bay Status</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Real-time shop floor view</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
              <span className="text-neutral-600 dark:text-neutral-400">{occupiedCount} occupied</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-neutral-600 dark:text-neutral-400">{availableCount} available</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bay Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Failed to load bay status
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </Button>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {bays.map((bay) => (
            <motion.button
              key={bay.id}
              onClick={() => setSelectedBay(selectedBay === bay.id ? null : bay.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Bay ${bay.bayNumber} - ${bay.status}`}
              aria-pressed={selectedBay === bay.id}
              className={cn(
                'relative p-3 rounded-xl border-2 transition-all text-left',
                bay.status === 'occupied' && 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700',
                bay.status === 'available' && 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 border-dashed',
                bay.status === 'maintenance' && 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400',
                selectedBay === bay.id && 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white dark:ring-offset-neutral-800'
              )}
            >
              {/* Bay Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-xs font-bold',
                  bay.status === 'occupied' && 'text-blue-700 dark:text-blue-300',
                  bay.status === 'available' && 'text-green-700 dark:text-green-300',
                  bay.status === 'maintenance' && 'text-neutral-500 dark:text-neutral-400'
                )}>
                  BAY {bay.bayNumber}
                </span>
                {bay.status === 'occupied' && bay.workOrder && (
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full animate-pulse',
                      statusConfig[bay.workOrder.status].color
                    )}
                    aria-label={statusConfig[bay.workOrder.status].label}
                  />
                )}
              </div>

              {/* Content */}
              {bay.status === 'occupied' && bay.vehicle && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate" title={`${bay.vehicle.year} ${bay.vehicle.make}`}>
                    {bay.vehicle.year} {bay.vehicle.make}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate" title={bay.vehicle.model}>
                    {bay.vehicle.model}
                  </div>
                  {bay.workOrder && (
                    <div className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full inline-block',
                      statusConfig[bay.workOrder.status].bgColor,
                      statusConfig[bay.workOrder.status].textColor
                    )}>
                      {statusConfig[bay.workOrder.status].label}
                    </div>
                  )}
                </div>
              )}

              {bay.status === 'available' && (
                <div className="flex flex-col items-center justify-center py-2 text-green-600 dark:text-green-400">
                  <Plus className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-[10px] font-medium">Available</span>
                </div>
              )}

              {bay.status === 'maintenance' && (
                <div className="flex flex-col items-center justify-center py-2 text-neutral-500 dark:text-neutral-400">
                  <Wrench className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-[10px] font-medium">Maintenance</span>
                </div>
              )}

              {/* Technician Badge */}
              {bay.technician && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-neutral-700 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center shadow-sm"
                  title={bay.technician.name}
                >
                  <span className="text-[8px] font-bold text-blue-700 dark:text-blue-300">
                    {bay.technician.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
            </motion.button>
          ))}
        </div>
        )}
      </div>

      {/* Selected Bay Details */}
      {selectedBay && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-neutral-100 dark:border-neutral-700"
        >
          {(() => {
            const bay = bays.find(b => b.id === selectedBay)
            if (!bay || bay.status !== 'occupied') return null

            return (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                        {bay.vehicle?.year} {bay.vehicle?.make} {bay.vehicle?.model}
                      </h4>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{bay.vehicle?.licensePlate}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">{bay.workOrder?.description}</p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" aria-hidden="true" />
                        {bay.technician?.name || 'Unassigned'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {bay.workOrder?.startTime} - {bay.workOrder?.estimatedCompletion}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/work-orders/${bay.workOrder?.id}`}
                    className="px-3 py-1.5 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                  >
                    View Order
                  </a>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}
