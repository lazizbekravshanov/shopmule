'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, FileText, Wrench, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalHeaderProps {
  customerName: string;
  token: string;
}

export function PortalHeader({ customerName, token }: PortalHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/portal/${token}`, label: 'Home', icon: Home, exact: true },
    { href: `/portal/${token}/vehicles`, label: 'Vehicles', icon: Car },
    { href: `/portal/${token}/work-orders`, label: 'Work Orders', icon: Wrench },
    { href: `/portal/${token}/invoices`, label: 'Invoices', icon: FileText },
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Customer Portal</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {customerName}
            </p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-[#ee7a14] text-white'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
