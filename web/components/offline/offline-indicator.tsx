'use client';

import { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';
import { offlineQueue } from '@/lib/offline-queue';
import { cn } from '@/lib/utils';

type SyncState = 'idle' | 'syncing' | 'done';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [mounted, setMounted] = useState(false);

  // Read initial state only after mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);
    setQueueCount(offlineQueue.count());
  }, []);

  const drain = useCallback(async () => {
    if (syncState === 'syncing') return;
    setSyncState('syncing');
    await offlineQueue.drain();
    setSyncState('done');
    setQueueCount(offlineQueue.count());
    // Show "done" checkmark briefly then return to idle
    setTimeout(() => setSyncState('idle'), 3000);
  }, [syncState]);

  useEffect(() => {
    if (!mounted) return;

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-drain when coming back online
      if (offlineQueue.count() > 0) {
        drain();
      }
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueChange = () => setQueueCount(offlineQueue.count());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-queue-change', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-queue-change', handleQueueChange);
    };
  }, [mounted, drain]);

  if (!mounted) return null;

  // Nothing to show when online + no pending items + not just synced
  if (isOnline && queueCount === 0 && syncState === 'idle') return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg px-4 py-2.5 shadow-lg border text-sm font-medium transition-all duration-300',
        !isOnline
          ? 'bg-neutral-900 border-neutral-700 text-white'
          : syncState === 'syncing'
            ? 'bg-blue-600 border-blue-500 text-white'
            : syncState === 'done'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-amber-500 border-amber-400 text-white',
      )}
    >
      {/* Icon */}
      {!isOnline && <WifiOff className="h-4 w-4 shrink-0" />}
      {isOnline && syncState === 'syncing' && <RefreshCw className="h-4 w-4 animate-spin shrink-0" />}
      {isOnline && syncState === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
      {isOnline && syncState === 'idle' && queueCount > 0 && <CloudUpload className="h-4 w-4 shrink-0" />}

      {/* Label */}
      <span>
        {!isOnline && queueCount === 0 && 'Offline — changes will sync on reconnect'}
        {!isOnline && queueCount > 0 && `Offline — ${queueCount} change${queueCount !== 1 ? 's' : ''} queued`}
        {isOnline && syncState === 'syncing' && `Syncing ${queueCount > 0 ? `${queueCount} change${queueCount !== 1 ? 's' : ''}` : 'changes'}…`}
        {isOnline && syncState === 'done' && 'All changes synced'}
        {isOnline && syncState === 'idle' && queueCount > 0 && `${queueCount} change${queueCount !== 1 ? 's' : ''} pending`}
      </span>

      {/* Manual sync button — shown when online + queue has items + not already syncing */}
      {isOnline && syncState === 'idle' && queueCount > 0 && (
        <button
          onClick={drain}
          className="ml-1 rounded bg-white/20 hover:bg-white/30 px-2 py-0.5 text-xs font-semibold transition-colors"
        >
          Sync now
        </button>
      )}
    </div>
  );
}
