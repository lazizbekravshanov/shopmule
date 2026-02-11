'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Search,
  Wrench,
  DollarSign,
  Users,
  Car,
  Package,
  Clock,
  LayoutDashboard,
  FileText,
  Settings,
  Plus,
  LogOut,
  BarChart3,
  Calendar,
  Building2,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'customer' | 'vehicle' | 'work_order' | 'invoice' | 'part';
  title: string;
  subtitle?: string;
  href: string;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortcut: 'D' },
  { name: 'Work Orders', href: '/work-orders', icon: Wrench, shortcut: 'W' },
  { name: 'Invoices', href: '/invoices', icon: FileText, shortcut: 'I' },
  { name: 'Customers', href: '/customers', icon: Users, shortcut: 'C' },
  { name: 'Inventory', href: '/inventory', icon: Package, shortcut: 'P' },
  { name: 'Technicians', href: '/technicians', icon: Building2 },
  { name: 'Time Clock', href: '/time-clock', icon: Clock },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const quickActions = [
  { name: 'New Work Order', href: '/work-orders/new', icon: Plus, keywords: ['create', 'add'] },
  { name: 'New Invoice', href: '/invoices?action=new', icon: Plus, keywords: ['create', 'add', 'bill'] },
  { name: 'Add Customer', href: '/customers?action=new', icon: Plus, keywords: ['create', 'add'] },
  { name: 'Add Vehicle', href: '/customers?action=add-vehicle', icon: Plus, keywords: ['create', 'add', 'car'] },
  { name: 'Clock In/Out', href: '/time-clock', icon: Clock, keywords: ['punch', 'attendance'] },
];

const typeIcons: Record<SearchResult['type'], React.ElementType> = {
  customer: Users,
  vehicle: Car,
  work_order: Wrench,
  invoice: DollarSign,
  part: Package,
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const router = useRouter();
  const { data: session } = useSession();

  // Global keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search API
  const { data: searchResults, isLoading } = useQuery<{ success: boolean; data: SearchResult[] }>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return { success: true, data: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: query.length >= 2,
    staleTime: 10000,
  });

  const results = searchResults?.data || [];

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const handleSignOut = () => {
    setOpen(false);
    router.push('/signout');
  };

  return (
    <>
      {/* Trigger button for navbar */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 px-1.5 font-mono text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search customers, vehicles, work orders..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Searching...' : 'No results found.'}
            </CommandEmpty>

            {/* Search Results */}
            {results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((result) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.title} ${result.subtitle || ''}`}
                      onSelect={() => handleSelect(result.href)}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        result.type === 'customer' && 'bg-blue-100 dark:bg-blue-900/30',
                        result.type === 'vehicle' && 'bg-green-100 dark:bg-green-900/30',
                        result.type === 'work_order' && 'bg-amber-100 dark:bg-amber-900/30',
                        result.type === 'invoice' && 'bg-purple-100 dark:bg-purple-900/30',
                        result.type === 'part' && 'bg-indigo-100 dark:bg-indigo-900/30',
                      )}>
                        <Icon className={cn(
                          'w-4 h-4',
                          result.type === 'customer' && 'text-blue-600 dark:text-blue-400',
                          result.type === 'vehicle' && 'text-green-600 dark:text-green-400',
                          result.type === 'work_order' && 'text-amber-600 dark:text-amber-400',
                          result.type === 'invoice' && 'text-purple-600 dark:text-purple-400',
                          result.type === 'part' && 'text-indigo-600 dark:text-indigo-400',
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400 capitalize">
                        {result.type.replace('_', ' ')}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Quick Actions */}
            {!query && (
              <>
                <CommandGroup heading="Quick Actions">
                  {quickActions.map((action) => (
                    <CommandItem
                      key={action.href}
                      value={`${action.name} ${action.keywords?.join(' ') || ''}`}
                      onSelect={() => handleSelect(action.href)}
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      <span>{action.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Navigation */}
            <CommandGroup heading="Navigation">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.name}
                  onSelect={() => handleSelect(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  {item.shortcut && (
                    <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* User Actions */}
            {session && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Account">
                  <CommandItem onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
