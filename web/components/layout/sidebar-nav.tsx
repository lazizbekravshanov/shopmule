'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Users,
  Clock,
  Package,
  UserCog,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Work Orders', href: '/work-orders', icon: Wrench },
  { title: 'Invoices', href: '/invoices', icon: FileText },
  { title: 'Customers', href: '/customers', icon: Users },
  { title: 'Inventory', href: '/inventory', icon: Package },
  { title: 'Technicians', href: '/technicians', icon: UserCog },
  { title: 'Time Clock', href: '/time-clock', icon: Clock },
  { title: 'Reports', href: '/reports', icon: BarChart3 },
];

interface SidebarNavProps {
  collapsed?: boolean;
}

export function SidebarNav({ collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const button = (
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              collapsed && 'justify-center px-2'
            )}
            asChild
          >
            <Link href={item.href}>
              <Icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          </Button>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right">{item.title}</TooltipContent>
            </Tooltip>
          );
        }

        return <div key={item.href}>{button}</div>;
      })}
    </nav>
  );
}
