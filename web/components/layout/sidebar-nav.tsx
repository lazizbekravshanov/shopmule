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
  Plus,
  CalendarDays,
  Truck,
  Settings,
  HelpCircle,
  Plug,
  Building2,
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
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Quick Actions - Always visible at top
const quickActions: NavItem[] = [
  { title: 'New Work Order', href: '/work-orders/new', icon: Plus },
];

// Grouped Navigation
const navGroups: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Work Orders', href: '/work-orders', icon: Wrench },
      { title: 'Schedule', href: '/schedule', icon: CalendarDays },
    ],
  },
  {
    label: 'Finance',
    items: [
      { title: 'Invoices', href: '/invoices', icon: FileText },
      { title: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Team',
    items: [
      { title: 'Technicians', href: '/technicians', icon: UserCog },
      { title: 'Time Clock', href: '/time-clock', icon: Clock },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { title: 'Parts & Supplies', href: '/inventory', icon: Package },
    ],
  },
  {
    label: 'Customers',
    items: [
      { title: 'All Customers', href: '/customers', icon: Users },
      { title: 'Fleet Accounts', href: '/fleet-accounts', icon: Truck },
    ],
  },
];

// Bottom Navigation
const bottomNav: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings },
  { title: 'Integrations', href: '/integrations', icon: Plug },
  { title: 'Help & Support', href: '/help', icon: HelpCircle },
];

interface SidebarNavProps {
  collapsed?: boolean;
}

export function SidebarNav({ collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, isQuickAction = false) => {
    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isQuickAction
            ? 'bg-[#ee7a14] hover:bg-[#d96a0a] text-white shadow-sm shadow-orange-500/20'
            : isActive
            ? 'bg-white/10 text-white'
            : 'text-neutral-400 hover:text-white hover:bg-white/5',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', isQuickAction && 'text-white')} strokeWidth={1.5} />
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
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
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      <div className="px-3 mb-6">
        {quickActions.map((item) => renderNavItem(item, true))}
      </div>

      {/* Main Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <h4 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                {group.label}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="px-3 pt-4 mt-4 border-t border-neutral-800 space-y-1">
        {bottomNav.map((item) => renderNavItem(item))}
      </div>
    </div>
  );
}
