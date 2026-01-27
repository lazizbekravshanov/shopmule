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
    <div className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const linkContent = (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.title}
              </TooltipContent>
            </Tooltip>
          );
        }

        return <div key={item.href}>{linkContent}</div>;
      })}
    </div>
  );
}
