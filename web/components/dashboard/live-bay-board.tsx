'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Truck,
  User,
  Clock,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  AlertCircle,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

const mockBays: BayAssignment[] = [
  {
    id: '1',
    bayNumber: 1,
    status: 'occupied',
    vehicle: { make: 'Freightliner', model: 'Cascadia', year: 2022, licensePlate: 'ABC-1234' },
    workOrder: { id: 'WO-1042', description: 'Brake system overhaul', status: 'in-progress', startTime: '08:30', estimatedCompletion: '14:00' },
    technician: { name: 'Mike Johnson' },
  },
  {
    id: '2',
    bayNumber: 2,
    status: 'occupied',
    vehicle: { make: 'Peterbilt', model: '579', year: 2021, licensePlate: 'XYZ-5678' },
    workOrder: { id: 'WO-1043', description: 'Engine diagnostics', status: 'waiting-parts', startTime: '09:15', estimatedCompletion: '16:00' },
    technician: { name: 'Sarah Chen' },
  },
  {
    id: '3',
    bayNumber: 3,
    status: 'available',
  },
  {
    id: '4',
    bayNumber: 4,
    status: 'occupied',
    vehicle: { make: 'Kenworth', model: 'T680', year: 2023, licensePlate: 'DEF-9012' },
    workOrder: { id: 'WO-1044', description: 'DOT inspection', status: 'inspection', startTime: '10:00', estimatedCompletion: '12:00' },
    technician: { name: 'James Wilson' },
  },
  {
    id: '5',
    bayNumber: 5,
    status: 'maintenance',
  },
  {
    id: '6',
    bayNumber: 6,
    status: 'available',
  },
]

const statusConfig = {
  'in-progress': { label: 'In Progress', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  'waiting-parts': { label: 'Waiting Parts', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
  'inspection': { label: 'Inspection', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
}

export function LiveBayBoard() {
  const [selectedBay, setSelectedBay] = useState<string | null>(null)

  const occupiedCount = mockBays.filter(b => b.status === 'occupied').length
  const availableCount = mockBays.filter(b => b.status === 'available').length

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Live Bay Status</h3>
              <p className="text-xs text-neutral-500">Real-time shop floor view</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-neutral-600">{occupiedCount} occupied</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-neutral-600">{availableCount} available</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bay Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {mockBays.map((bay) => (
            <motion.button
              key={bay.id}
              onClick={() => setSelectedBay(selectedBay === bay.id ? null : bay.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative p-3 rounded-xl border-2 transition-all text-left',
                bay.status === 'occupied' && 'bg-blue-50 border-blue-200 hover:border-blue-300',
                bay.status === 'available' && 'bg-green-50 border-green-200 hover:border-green-300 border-dashed',
                bay.status === 'maintenance' && 'bg-neutral-100 border-neutral-300 hover:border-neutral-400',
                selectedBay === bay.id && 'ring-2 ring-offset-2 ring-neutral-900'
              )}
            >
              {/* Bay Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-xs font-bold',
                  bay.status === 'occupied' && 'text-blue-700',
                  bay.status === 'available' && 'text-green-700',
                  bay.status === 'maintenance' && 'text-neutral-500'
                )}>
                  BAY {bay.bayNumber}
                </span>
                {bay.status === 'occupied' && bay.workOrder && (
                  <span className={cn(
                    'w-2 h-2 rounded-full animate-pulse',
                    statusConfig[bay.workOrder.status].color
                  )} />
                )}
              </div>

              {/* Content */}
              {bay.status === 'occupied' && bay.vehicle && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-neutral-900 truncate">
                    {bay.vehicle.year} {bay.vehicle.make}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
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
                <div className="flex flex-col items-center justify-center py-2 text-green-600">
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Available</span>
                </div>
              )}

              {bay.status === 'maintenance' && (
                <div className="flex flex-col items-center justify-center py-2 text-neutral-500">
                  <Wrench className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Maintenance</span>
                </div>
              )}

              {/* Technician Badge */}
              {bay.technician && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-blue-700">
                    {bay.technician.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Bay Details */}
      {selectedBay && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-neutral-100"
        >
          {(() => {
            const bay = mockBays.find(b => b.id === selectedBay)
            if (!bay || bay.status !== 'occupied') return null

            return (
              <div className="p-4 bg-neutral-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-neutral-900 text-sm">
                        {bay.vehicle?.year} {bay.vehicle?.make} {bay.vehicle?.model}
                      </h4>
                      <span className="text-xs text-neutral-500">{bay.vehicle?.licensePlate}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mb-3">{bay.workOrder?.description}</p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {bay.technician?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {bay.workOrder?.startTime} - {bay.workOrder?.estimatedCompletion}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/work-orders/${bay.workOrder?.id}`}
                    className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
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
