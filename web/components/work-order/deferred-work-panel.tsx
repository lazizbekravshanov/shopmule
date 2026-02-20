'use client';

import { useState, useCallback } from 'react';
import {
  Clock,
  Plus,
  Wrench,
  XCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useDeferredWork, useCreateDeferred, usePatchDeferred } from '@/lib/queries/deferred';
import { useAddLabor } from '@/lib/queries/work-orders';
import type { DeferredWorkItem } from '@/lib/api';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'Brakes', 'Engine', 'Transmission', 'Suspension', 'Steering',
  'Electrical', 'Tires', 'HVAC', 'Exhaust', 'Lighting', 'Other',
];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
}

// ─── Deferred item card ────────────────────────────────────────────────────

function DeferredCard({
  item,
  workOrderId,
  vehicleId,
  defaultLaborRate,
}: {
  item: DeferredWorkItem;
  workOrderId: string;
  vehicleId: string;
  defaultLaborRate: number;
}) {
  const { toast } = useToast();
  const patchDeferred = usePatchDeferred();
  const addLabor = useAddLabor();
  const [addingToWO, setAddingToWO] = useState(false);

  const handleAddToWO = useCallback(async () => {
    setAddingToWO(true);
    addLabor.mutate(
      {
        workOrderId,
        hours: 0,
        rate: defaultLaborRate,
        note: item.category ? `[${item.category}] ${item.description}` : item.description,
      },
      {
        onSuccess: () => {
          // Mark as scheduled once added to a WO
          patchDeferred.mutate(
            { id: item.id, vehicleId, status: 'SCHEDULED', resolvedWorkOrderId: workOrderId },
            {
              onSuccess: () => toast({ title: 'Added to work order', description: item.description }),
              onError: () => toast({ title: 'Added to WO', description: 'Could not update deferred status' }),
            }
          );
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Failed';
          toast({ variant: 'destructive', title: 'Error', description: msg });
        },
        onSettled: () => setAddingToWO(false),
      }
    );
  }, [item, workOrderId, vehicleId, defaultLaborRate, addLabor, patchDeferred, toast]);

  const handleDismiss = useCallback(() => {
    patchDeferred.mutate(
      { id: item.id, vehicleId, status: 'DISMISSED' },
      {
        onSuccess: () => toast({ title: 'Dismissed', description: item.description }),
        onError: () => toast({ variant: 'destructive', title: 'Failed to dismiss' }),
      }
    );
  }, [item, vehicleId, patchDeferred, toast]);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {item.category && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-amber-300 text-amber-700 bg-white">
              {item.category}
            </Badge>
          )}
          <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(item.declinedAt)}
          </span>
          {item.estimatedCost != null && (
            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
              <DollarSign className="h-2.5 w-2.5" />
              {item.estimatedCost.toFixed(0)} est.
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-800 mt-0.5 leading-snug">{item.description}</p>
        {item.declinedReason && (
          <p className="text-xs text-neutral-500 mt-0.5 italic">"{item.declinedReason}"</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] px-2 gap-1 bg-white"
          disabled={addingToWO || patchDeferred.isPending}
          onClick={handleAddToWO}
        >
          {addingToWO
            ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
            : <Wrench className="h-2.5 w-2.5" />
          }
          Add to WO
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-neutral-400 hover:text-red-500"
          disabled={patchDeferred.isPending}
          onClick={handleDismiss}
          title="Dismiss"
        >
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Decline & defer form dialog ───────────────────────────────────────────

function DeclineDialog({
  open,
  onOpenChange,
  vehicleId,
  workOrderId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vehicleId: string;
  workOrderId: string;
}) {
  const { toast } = useToast();
  const createDeferred = useCreateDeferred();
  const [form, setForm] = useState({
    description: '',
    category: '',
    estimatedCost: '',
    declinedReason: '',
  });

  const handleSave = () => {
    if (!form.description.trim()) return;
    createDeferred.mutate(
      {
        vehicleId,
        description: form.description.trim(),
        category: form.category || null,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : null,
        declinedReason: form.declinedReason.trim() || null,
        sourceWorkOrderId: workOrderId,
      },
      {
        onSuccess: () => {
          toast({ title: 'Repair deferred', description: 'Saved to this vehicle for the next visit.' });
          setForm({ description: '', category: '', estimatedCost: '', declinedReason: '' });
          onOpenChange(false);
        },
        onError: () => toast({ variant: 'destructive', title: 'Failed to save deferred repair' }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Decline & Defer Repair</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm">Repair Description *</Label>
            <Input
              placeholder="e.g. Replace left front brake lining"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Est. Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.estimatedCost}
                onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Customer&apos;s Reason (optional)</Label>
            <Input
              placeholder="e.g. Will come back next month"
              value={form.declinedReason}
              onChange={(e) => setForm((f) => ({ ...f, declinedReason: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!form.description.trim() || createDeferred.isPending}
            onClick={handleSave}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
          >
            {createDeferred.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Defer Repair
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────

interface DeferredWorkPanelProps {
  vehicleId: string | undefined;
  workOrderId: string;
  defaultLaborRate?: number;
}

export function DeferredWorkPanel({
  vehicleId,
  workOrderId,
  defaultLaborRate = 125,
}: DeferredWorkPanelProps) {
  const { data: items = [], isLoading } = useDeferredWork(vehicleId);
  const [collapsed, setCollapsed] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);

  if (!vehicleId) return null;

  const pending = items.filter((i) => i.status === 'PENDING');

  return (
    <>
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div
          className={cn(
            'flex items-center justify-between px-6 py-3.5 cursor-pointer hover:bg-neutral-50 transition-colors',
            pending.length > 0 && 'border-b border-amber-100'
          )}
          onClick={() => setCollapsed((c) => !c)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-neutral-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Deferred Repairs</span>
            </div>
            {!isLoading && pending.length > 0 && (
              <Badge className="bg-amber-400 text-white text-[10px] h-5 px-2 gap-1">
                <Clock className="h-2.5 w-2.5" />
                {pending.length} from previous visit{pending.length > 1 ? 's' : ''}
              </Badge>
            )}
            {!isLoading && pending.length === 0 && (
              <span className="text-xs text-neutral-400">None on file</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={(e) => { e.stopPropagation(); setDeclineOpen(true); }}
            >
              <Plus className="h-3 w-3" /> Defer Repair
            </Button>
            {collapsed
              ? <ChevronDown className="h-4 w-4 text-neutral-400" />
              : <ChevronUp className="h-4 w-4 text-neutral-400" />
            }
          </div>
        </div>

        {!collapsed && (
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-neutral-400 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                No deferred repairs on file for this vehicle.
              </div>
            ) : (
              <div className="space-y-2">
                {pending.map((item) => (
                  <DeferredCard
                    key={item.id}
                    item={item}
                    workOrderId={workOrderId}
                    vehicleId={vehicleId}
                    defaultLaborRate={defaultLaborRate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DeclineDialog
        open={declineOpen}
        onOpenChange={setDeclineOpen}
        vehicleId={vehicleId}
        workOrderId={workOrderId}
      />
    </>
  );
}
