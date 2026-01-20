'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'work-orders': 'Work Orders',
  invoices: 'Invoices',
  customers: 'Customers',
  inventory: 'Inventory',
  technicians: 'Technicians',
  'time-clock': 'Time Clock',
  reports: 'Reports',
  new: 'New',
  edit: 'Edit',
};

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLast, segment };
  });

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map(({ href, label, isLast, segment }) => (
        <div key={href} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {isLast ? (
            <span className="ml-1 font-medium">{label}</span>
          ) : (
            <Link
              href={href}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              {label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
