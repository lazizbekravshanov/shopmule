'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { workOrderKeys } from '@/lib/queries/work-orders';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 10_000,
  });

  const markRead = useMutation({
    mutationFn: async (params: { id?: string; markAll?: boolean }) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to update');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Refresh WO data when AI notifications are marked read
      queryClient.invalidateQueries({ queryKey: workOrderKeys.all });
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 relative"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markRead.mutate({ markAll: true })}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markRead.mutate({ id: n.id });
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors',
                    !n.isRead && 'bg-blue-50/50 dark:bg-blue-950/20'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {n.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
