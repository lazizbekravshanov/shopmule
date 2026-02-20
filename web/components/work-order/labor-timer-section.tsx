'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Square, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { offlineQueue } from '@/lib/offline-queue';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useAddLabor,
  useStartLaborTimer,
  useStopLaborTimer,
  useDeleteLabor,
} from '@/lib/queries/work-orders';
import { cn } from '@/lib/utils';

interface LaborEntry {
  id: string;
  hours: number;
  rate: number;
  note?: string | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
  actualHours?: number | null;
  employee?: { id: string; name: string; role: string };
}

interface LaborTimerSectionProps {
  workOrderId: string;
  laborEntries: LaborEntry[];
  defaultRate?: number;
}

function formatHours(h: number): string {
  const totalMin = Math.round(h * 60);
  const hrs = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  if (hrs === 0) return `${min}m`;
  if (min === 0) return `${hrs}h`;
  return `${hrs}h ${min}m`;
}

function formatElapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function VarianceBadge({ flagged, actual }: { flagged: number; actual: number }) {
  const diff = actual - flagged;
  const over = diff > 0;
  const pct = flagged > 0 ? Math.abs(diff / flagged) * 100 : 0;
  const color = over ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
  const sign = over ? '+' : '-';
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border', color)}>
      {over ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
      {sign}{formatHours(Math.abs(diff))} ({pct.toFixed(0)}%)
    </span>
  );
}

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(startedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <span className="font-mono text-sm font-semibold text-orange-600 tabular-nums">
      {elapsed}
    </span>
  );
}

export function LaborTimerSection({
  workOrderId,
  laborEntries,
  defaultRate = 125,
}: LaborTimerSectionProps) {
  const { toast } = useToast();
  const addLabor = useAddLabor();
  const startTimer = useStartLaborTimer();
  const stopTimer = useStopLaborTimer();
  const deleteLabor = useDeleteLabor();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ hours: '0', rate: String(defaultRate), note: '' });

  const laborTotal = laborEntries.reduce((sum, l) => sum + l.hours * l.rate, 0);

  const handleAdd = useCallback(async () => {
    const hours = parseFloat(form.hours);
    const rate = parseFloat(form.rate);
    if (isNaN(hours) || hours < 0) {
      toast({ variant: 'destructive', title: 'Invalid hours' });
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      toast({ variant: 'destructive', title: 'Invalid rate' });
      return;
    }
    addLabor.mutate(
      { workOrderId, hours, rate, note: form.note || undefined },
      {
        onSuccess: () => {
          toast({ title: 'Labor line added' });
          setIsAddOpen(false);
          setForm({ hours: '0', rate: String(defaultRate), note: '' });
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Failed to add labor';
          toast({ variant: 'destructive', title: 'Error', description: msg });
        },
      }
    );
  }, [form, workOrderId, defaultRate, addLabor, toast]);

  const handleStart = useCallback(
    (laborId: string) => {
      if (!navigator.onLine) {
        offlineQueue.enqueue({
          url: `/api/work-orders/${workOrderId}/labor/${laborId}`,
          method: 'PATCH',
          body: JSON.stringify({ action: 'start' }),
          headers: { 'Content-Type': 'application/json' },
          label: 'Start labor timer',
        });
        toast({ title: 'Offline — timer queued', description: 'Will sync when reconnected' });
        return;
      }
      startTimer.mutate(
        { workOrderId, laborId },
        {
          onSuccess: () => toast({ title: 'Timer started' }),
          onError: (e: unknown) => {
            const msg = e instanceof Error ? e.message : 'Failed to start timer';
            toast({ variant: 'destructive', title: 'Error', description: msg });
          },
        }
      );
    },
    [workOrderId, startTimer, toast]
  );

  const handleStop = useCallback(
    (laborId: string) => {
      if (!navigator.onLine) {
        offlineQueue.enqueue({
          url: `/api/work-orders/${workOrderId}/labor/${laborId}`,
          method: 'PATCH',
          body: JSON.stringify({ action: 'stop' }),
          headers: { 'Content-Type': 'application/json' },
          label: 'Stop labor timer',
        });
        toast({ title: 'Offline — timer stop queued', description: 'Will sync when reconnected' });
        return;
      }
      stopTimer.mutate(
        { workOrderId, laborId },
        {
          onSuccess: () => toast({ title: 'Timer stopped' }),
          onError: (e: unknown) => {
            const msg = e instanceof Error ? e.message : 'Failed to stop timer';
            toast({ variant: 'destructive', title: 'Error', description: msg });
          },
        }
      );
    },
    [workOrderId, stopTimer, toast]
  );

  const handleDelete = useCallback(
    (laborId: string) => {
      deleteLabor.mutate(
        { workOrderId, laborId },
        {
          onSuccess: () => toast({ title: 'Labor line removed' }),
          onError: (e: unknown) => {
            const msg = e instanceof Error ? e.message : 'Failed to remove labor';
            toast({ variant: 'destructive', title: 'Error', description: msg });
          },
        }
      );
    },
    [workOrderId, deleteLabor, toast]
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Labor</span>
          {laborTotal > 0 && (
            <span className="text-xs text-neutral-400 ml-1">${laborTotal.toFixed(2)}</span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="h-3 w-3" />
          Add Line
        </Button>
      </div>

      {laborEntries.length === 0 ? (
        <p className="text-neutral-400 text-sm">No labor lines yet.</p>
      ) : (
        <div className="space-y-3">
          {laborEntries.map((entry) => {
            const isRunning = !!entry.startedAt && !entry.stoppedAt;
            const isStopped = !!entry.startedAt && !!entry.stoppedAt;
            const hasVariance = isStopped && entry.actualHours !== null && entry.actualHours !== undefined;

            return (
              <div
                key={entry.id}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  isRunning
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-neutral-100 bg-neutral-50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-neutral-900">
                        {entry.employee?.name ?? 'Unknown'}
                      </span>
                      {entry.employee?.role && (
                        <span className="text-xs text-neutral-400">{entry.employee.role}</span>
                      )}
                      {isRunning && (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{entry.note}</p>
                    )}

                    {/* Hours row */}
                    <div className="mt-2 flex items-center gap-3 flex-wrap text-xs">
                      <span className="text-neutral-500">
                        Flagged: <span className="font-medium text-neutral-700">{formatHours(entry.hours)}</span>
                      </span>
                      {isRunning && (
                        <span className="text-neutral-500">
                          Elapsed: <LiveTimer startedAt={entry.startedAt!} />
                        </span>
                      )}
                      {isStopped && entry.actualHours !== null && entry.actualHours !== undefined && (
                        <span className="text-neutral-500">
                          Actual: <span className="font-medium text-neutral-700">{formatHours(entry.actualHours)}</span>
                        </span>
                      )}
                      {hasVariance && (
                        <VarianceBadge flagged={entry.hours} actual={entry.actualHours!} />
                      )}
                      <span className="text-neutral-400 ml-auto">
                        ${(entry.hours * entry.rate).toFixed(2)} @ ${entry.rate}/hr
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isStopped && (
                      <Button
                        size="icon"
                        variant={isRunning ? 'destructive' : 'outline'}
                        className="h-7 w-7"
                        title={isRunning ? 'Stop timer' : 'Start timer'}
                        disabled={startTimer.isPending || stopTimer.isPending}
                        onClick={() => (isRunning ? handleStop(entry.id) : handleStart(entry.id))}
                      >
                        {isRunning ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-neutral-400 hover:text-red-500"
                      title="Remove"
                      disabled={deleteLabor.isPending}
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Labor Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Add Labor Line</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Description / Job</Label>
              <Input
                placeholder="e.g. Brake pad replacement"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Flagged Hours</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={form.hours}
                  onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                />
                <p className="text-xs text-neutral-400">Estimated / flat-rate</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Rate ($/hr)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={form.rate}
                  onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={addLabor.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {addLabor.isPending ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
