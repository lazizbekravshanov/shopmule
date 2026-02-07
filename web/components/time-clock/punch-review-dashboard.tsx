'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  X,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  Filter,
  Calendar,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface PunchForReview {
  id: string
  employee: {
    id: string
    name: string
    photoUrl?: string
  }
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END'
  timestamp: string
  shop?: {
    id: string
    name: string
  }
  location?: {
    latitude: number
    longitude: number
    isWithinGeofence: boolean
    distanceFromGeofence?: number
  }
  punchMethod: 'APP' | 'PIN' | 'QR_CODE' | 'FACIAL' | 'MANUAL' | 'KIOSK'
  photoUrl?: string
  deviceInfo?: string
  ipAddress?: string
  isOfflinePunch: boolean
  notes?: string
  flags: {
    outsideGeofence: boolean
    offlinePunch: boolean
    manualEntry: boolean
    missingPhoto: boolean
    unusual: boolean
  }
}

interface PunchReviewDashboardProps {
  punches: PunchForReview[]
  onApprove?: (punchId: string) => void
  onReject?: (punchId: string, reason: string) => void
  onEdit?: (punchId: string, newTimestamp: string, notes: string) => void
  isLoading?: boolean
}

function getPunchTypeLabel(type: PunchForReview['type']) {
  switch (type) {
    case 'CLOCK_IN': return 'Clock In'
    case 'CLOCK_OUT': return 'Clock Out'
    case 'BREAK_START': return 'Break Start'
    case 'BREAK_END': return 'Break End'
  }
}

function getPunchTypeColor(type: PunchForReview['type']) {
  switch (type) {
    case 'CLOCK_IN': return 'bg-green-100 text-green-700 border-green-200'
    case 'CLOCK_OUT': return 'bg-red-100 text-red-700 border-red-200'
    case 'BREAK_START': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'BREAK_END': return 'bg-blue-100 text-blue-700 border-blue-200'
  }
}

function FlagBadge({ type, label }: { type: 'warning' | 'error' | 'info'; label: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
      type === 'warning' && 'bg-amber-100 text-amber-700',
      type === 'error' && 'bg-red-100 text-red-700',
      type === 'info' && 'bg-blue-100 text-blue-700'
    )}>
      <AlertTriangle className="w-2.5 h-2.5" />
      {label}
    </span>
  )
}

function PunchRow({
  punch,
  index,
  onApprove,
  onReject,
  onEdit
}: {
  punch: PunchForReview
  index: number
  onApprove?: (id: string) => void
  onReject?: (id: string, reason: string) => void
  onEdit?: (id: string, timestamp: string, notes: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [editTimestamp, setEditTimestamp] = useState(punch.timestamp)
  const [editNotes, setEditNotes] = useState(punch.notes || '')
  const [rejectReason, setRejectReason] = useState('')

  const initials = punch.employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const hasFlags = Object.values(punch.flags).some(Boolean)
  const flagCount = Object.values(punch.flags).filter(Boolean).length

  const handleApprove = () => {
    onApprove?.(punch.id)
  }

  const handleReject = () => {
    onReject?.(punch.id, rejectReason)
    setShowRejectDialog(false)
    setRejectReason('')
  }

  const handleEdit = () => {
    onEdit?.(punch.id, editTimestamp, editNotes)
    setShowEditDialog(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={cn(
          "border rounded-lg overflow-hidden transition-all",
          hasFlags ? 'border-amber-200 bg-amber-50/50' : 'border-neutral-200 bg-white'
        )}
      >
        {/* Main Row */}
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Avatar */}
          <div className="relative">
            {punch.employee.photoUrl ? (
              <img
                src={punch.employee.photoUrl}
                alt={punch.employee.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-500 flex items-center justify-center text-white font-medium text-sm">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-neutral-900">{punch.employee.name}</span>
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-medium rounded border",
                getPunchTypeColor(punch.type)
              )}>
                {getPunchTypeLabel(punch.type)}
              </span>
              {punch.shop && (
                <span className="text-xs text-neutral-500">
                  @ {punch.shop.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(punch.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
              <span className="text-xs text-neutral-400">
                via {punch.punchMethod.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Flags */}
          {hasFlags && (
            <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
              {punch.flags.outsideGeofence && (
                <FlagBadge type="error" label="Outside Area" />
              )}
              {punch.flags.offlinePunch && (
                <FlagBadge type="warning" label="Offline" />
              )}
              {punch.flags.manualEntry && (
                <FlagBadge type="info" label="Manual" />
              )}
              {punch.flags.missingPhoto && (
                <FlagBadge type="warning" label="No Photo" />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleApprove}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowRejectDialog(true)}
            >
              <X className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Punch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-neutral-100 overflow-hidden"
            >
              <div className="px-4 py-3 bg-neutral-50/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {punch.location && (
                  <div>
                    <span className="text-xs text-neutral-500 block mb-1">Location</span>
                    <div className="flex items-center gap-1">
                      <MapPin className={cn(
                        "w-3.5 h-3.5",
                        punch.location.isWithinGeofence ? 'text-green-500' : 'text-red-500'
                      )} />
                      <span className="font-medium">
                        {punch.location.isWithinGeofence ? 'Within geofence' :
                          `${punch.location.distanceFromGeofence}m outside`}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {punch.location.latitude.toFixed(6)}, {punch.location.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-neutral-500 block mb-1">Device</span>
                  <span className="font-medium">{punch.deviceInfo || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block mb-1">IP Address</span>
                  <span className="font-mono text-xs">{punch.ipAddress || 'Unknown'}</span>
                </div>
                {punch.photoUrl && (
                  <div>
                    <span className="text-xs text-neutral-500 block mb-1">Photo</span>
                    <a href={punch.photoUrl} target="_blank" rel="noopener noreferrer"
                       className="text-[#ee7a14] hover:underline text-sm">
                      View Photo
                    </a>
                  </div>
                )}
                {punch.notes && (
                  <div className="col-span-2 md:col-span-4">
                    <span className="text-xs text-neutral-500 block mb-1">Notes</span>
                    <span className="text-neutral-700">{punch.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Punch</DialogTitle>
            <DialogDescription>
              Modify the punch time or add notes for {punch.employee.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="timestamp">Timestamp</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={editTimestamp.slice(0, 16)}
                onChange={(e) => setEditTimestamp(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add reason for edit..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-[#ee7a14] hover:bg-[#d16a0f]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Punch</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this punch from {punch.employee.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Reject Punch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function PunchReviewDashboard({
  punches,
  onApprove,
  onReject,
  onEdit,
  isLoading,
}: PunchReviewDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'outside' | 'manual'>('all')

  const filteredPunches = punches.filter(punch => {
    if (filter === 'all') return true
    if (filter === 'flagged') return Object.values(punch.flags).some(Boolean)
    if (filter === 'outside') return punch.flags.outsideGeofence
    if (filter === 'manual') return punch.flags.manualEntry
    return true
  })

  const flaggedCount = punches.filter(p => Object.values(p.flags).some(Boolean)).length
  const outsideCount = punches.filter(p => p.flags.outsideGeofence).length

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Punches for Review</h3>
              <p className="text-xs text-neutral-500">
                {punches.length} pending • {flaggedCount} flagged
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  {filter === 'all' ? 'All' :
                   filter === 'flagged' ? 'Flagged' :
                   filter === 'outside' ? 'Outside Area' : 'Manual'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Punches ({punches.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('flagged')}>
                  Flagged ({flaggedCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('outside')}>
                  Outside Geofence ({outsideCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('manual')}>
                  Manual Entries
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {filteredPunches.length > 0 && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => filteredPunches.forEach(p => onApprove?.(p.id))}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Approve All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-[#ee7a14] rounded-full animate-spin mx-auto" />
            <p className="text-neutral-500 mt-3">Loading punches...</p>
          </div>
        ) : filteredPunches.length > 0 ? (
          <AnimatePresence>
            {filteredPunches.map((punch, index) => (
              <PunchRow
                key={punch.id}
                punch={punch}
                index={index}
                onApprove={onApprove}
                onReject={onReject}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-neutral-900 font-medium">All caught up!</p>
            <p className="text-neutral-500 text-sm mt-1">
              No punches need review right now
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export type { PunchForReview }
