'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  Wrench,
  Users,
  TrendingUp,
  Zap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface CommandItem {
  id: string;
  type: 'urgent' | 'attention' | 'opportunity' | 'success';
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  metric?: string;
}

interface SmartAction {
  id: string;
  type: string;
  label: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  href: string;
  badge?: string;
}

interface UnpaidInvoice {
  id: string;
  balance: number;
  daysOverdue: number;
}

interface DashboardData {
  smartActions: SmartAction[];
  unpaid: {
    invoices: UnpaidInvoice[];
    summary: {
      totalOverdue: number;
      overdueCount: number;
    };
  };
}

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Get first name from full name
function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'there';
  const firstName = fullName.split(' ')[0];
  return firstName || 'there';
}

export function AICommandCenter() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const userName = getFirstName(session?.user?.name);

  // Fetch dashboard data with proper error handling
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard', 'command-center'],
    queryFn: async () => {
      // Fetch multiple data points in parallel with error handling
      const [smartActionsRes, unpaidRes] = await Promise.all([
        fetch('/api/dashboard/smart-actions'),
        fetch('/api/dashboard/unpaid-invoices'),
      ]);

      // Check for HTTP errors
      if (!smartActionsRes.ok || !unpaidRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [smartActions, unpaid] = await Promise.all([
        smartActionsRes.json(),
        unpaidRes.json(),
      ]);

      return {
        smartActions: smartActions.data || [],
        unpaid: unpaid.data || { invoices: [], summary: { totalOverdue: 0, overdueCount: 0 } },
      };
    },
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 2,
  });

  // Build command items from data
  const commandItems: CommandItem[] = [];

  if (data && !isError) {
    // Add urgent smart actions
    const urgentActions = data.smartActions.filter((a) => a.urgency === 'high');
    if (urgentActions.length > 0) {
      commandItems.push({
        id: 'urgent-actions',
        type: 'urgent',
        icon: AlertTriangle,
        title: `${urgentActions.length} urgent item${urgentActions.length > 1 ? 's' : ''} need attention`,
        description: urgentActions[0]?.description || 'Review urgent tasks',
        href: '/work-orders?filter=urgent',
        metric: urgentActions.length.toString(),
      });
    }

    // Add overdue invoices from summary
    const overdueCount = data.unpaid.summary?.overdueCount || 0;
    const overdueTotal = data.unpaid.summary?.totalOverdue || 0;
    if (overdueCount > 0) {
      commandItems.push({
        id: 'overdue-invoices',
        type: 'attention',
        icon: DollarSign,
        title: `$${overdueTotal.toLocaleString()} in overdue invoices`,
        description: `${overdueCount} invoice${overdueCount > 1 ? 's' : ''} past due`,
        href: '/invoices?filter=overdue',
        metric: overdueCount.toString(),
      });
    }

    // Add medium priority items
    const mediumActions = data.smartActions.filter((a) => a.urgency === 'medium');
    if (mediumActions.length > 0 && commandItems.length < 3) {
      commandItems.push({
        id: 'medium-actions',
        type: 'attention',
        icon: Clock,
        title: mediumActions[0]?.label || 'Items need review',
        description: mediumActions[0]?.description || 'Review pending items',
        href: mediumActions[0]?.href || '/work-orders',
      });
    }
  }

  // If no items and not loading/error, show success state
  const isAllClear = !isLoading && !isError && commandItems.length === 0;

  const typeConfig = {
    urgent: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      hover: 'hover:bg-red-100 dark:hover:bg-red-950/50',
    },
    attention: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/50',
    },
    opportunity: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      hover: 'hover:bg-green-100 dark:hover:bg-green-950/50',
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5" />

      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                AI Command Center
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              {greeting}, {userName}.
            </h2>
            <p className="text-neutral-400 mt-2 text-lg">
              {isError
                ? "We couldn't load your dashboard data."
                : isAllClear
                ? "You're all caught up. Great work!"
                : "Here's what needs your attention today."
              }
            </p>
          </div>

          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-semibold text-white">{commandItems.length}</p>
              <p className="text-xs text-neutral-500">Items</p>
            </div>
          </div>
        </div>

        {/* Command Items */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 bg-white/5" />
            ))}
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-6 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Unable to load data</h3>
              <p className="text-neutral-400 text-sm">
                Check your connection and try again.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-white/20 text-white hover:bg-white/10 gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </Button>
          </motion.div>
        ) : isAllClear ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-6 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">All clear!</h3>
              <p className="text-neutral-400 text-sm">
                No urgent items. Focus on growth or take a well-deserved break.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {commandItems.slice(0, 3).map((item, index) => {
                const config = typeConfig[item.type];
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group',
                        config.bg,
                        config.border,
                        config.hover
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        config.bg,
                        config.border,
                        'border'
                      )}>
                        <Icon className={cn('w-5 h-5', config.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                          {item.description}
                        </p>
                      </div>
                      {item.metric && (
                        <div className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-bold',
                          item.type === 'urgent' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                        )}>
                          {item.metric}
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/10">
          <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Quick:</span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8"
          >
            <Link href="/work-orders/new">
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              New Work Order
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8"
          >
            <Link href="/invoices?action=new">
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              Create Invoice
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8"
          >
            <Link href="/customers?action=new">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
