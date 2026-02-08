'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Users,
  Clock,
  Package,
  UserCog,
  BarChart3,
  Plus,
  Car,
  Search,
  Loader2,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useUIStore } from '@/lib/stores/ui-store';

const pages = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Work Orders', href: '/work-orders', icon: Wrench },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Technicians', href: '/technicians', icon: UserCog },
  { name: 'Time Clock', href: '/time-clock', icon: Clock },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const quickActions = [
  { name: 'New Work Order', href: '/work-orders/new', icon: Plus },
  { name: 'New Customer', href: '/customers/new', icon: Plus },
  { name: 'New Invoice', href: '/invoices/new', icon: Plus },
];

interface SearchResults {
  customers: Array<{
    id: string;
    name: string;
    email: string | null;
    company: string | null;
  }>;
  vehicles: Array<{
    id: string;
    name: string;
    vin: string | null;
    licensePlate: string | null;
    customer: string | null;
  }>;
  workOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    vehicle: string | null;
    customer: string | null;
  }>;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function CommandPalette() {
  const router = useRouter();
  const { commandOpen, setCommandOpen } = useUIStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandOpen, setCommandOpen]);

  useEffect(() => {
    if (!commandOpen) {
      setSearch('');
      setResults(null);
    }
  }, [commandOpen]);

  const searchData = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchData(debouncedSearch);
  }, [debouncedSearch, searchData]);

  const runCommand = (command: () => void) => {
    setCommandOpen(false);
    command();
  };

  const hasSearchResults =
    results &&
    (results.customers.length > 0 ||
      results.vehicles.length > 0 ||
      results.workOrders.length > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'IN_PROGRESS':
        return 'text-blue-600';
      case 'DIAGNOSED':
      case 'APPROVED':
        return 'text-amber-600';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput
        placeholder="Search customers, vehicles, work orders..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}

        {!loading && search.length >= 2 && !hasSearchResults && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {!loading && hasSearchResults && (
          <>
            {results.customers.length > 0 && (
              <CommandGroup heading="Customers">
                {results.customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`customer-${customer.id}-${customer.name}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/customers/${customer.id}`))
                    }
                  >
                    <Users className="mr-2 h-4 w-4 text-neutral-500" />
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-neutral-500">
                        {customer.company || customer.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.vehicles.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Vehicles">
                  {results.vehicles.map((vehicle) => (
                    <CommandItem
                      key={vehicle.id}
                      value={`vehicle-${vehicle.id}-${vehicle.name}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/vehicles/${vehicle.id}`))
                      }
                    >
                      <Car className="mr-2 h-4 w-4 text-neutral-500" />
                      <div className="flex flex-col">
                        <span>{vehicle.name}</span>
                        <span className="text-xs text-neutral-500">
                          {vehicle.licensePlate || vehicle.vin}
                          {vehicle.customer && ` - ${vehicle.customer}`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results.workOrders.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Work Orders">
                  {results.workOrders.map((wo) => (
                    <CommandItem
                      key={wo.id}
                      value={`workorder-${wo.id}-${wo.orderNumber}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/work-orders/${wo.id}`))
                      }
                    >
                      <Wrench className="mr-2 h-4 w-4 text-neutral-500" />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span>{wo.orderNumber}</span>
                          <span
                            className={`text-xs font-medium ${getStatusColor(wo.status)}`}
                          >
                            {wo.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500">
                          {wo.vehicle}
                          {wo.customer && ` - ${wo.customer}`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}

        {(!search || search.length < 2) && !loading && (
          <>
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.href}
                  value={action.name}
                  onSelect={() => runCommand(() => router.push(action.href))}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.href}
                  value={page.name}
                  onSelect={() => runCommand(() => router.push(page.href))}
                >
                  <page.icon className="mr-2 h-4 w-4" />
                  <span>{page.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
