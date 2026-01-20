'use client';

import { useEffect } from 'react';
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

export function CommandPalette() {
  const router = useRouter();
  const { commandOpen, setCommandOpen } = useUIStore();

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

  const runCommand = (command: () => void) => {
    setCommandOpen(false);
    command();
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.href}
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
              onSelect={() => runCommand(() => router.push(page.href))}
            >
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
