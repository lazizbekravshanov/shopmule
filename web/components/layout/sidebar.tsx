'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MuleIcon } from '@/components/ui/mule-logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';
import { useUIStore } from '@/lib/stores/ui-store';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'relative hidden h-screen border-r border-neutral-200 bg-neutral-50 transition-all duration-200 lg:flex lg:flex-col',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-neutral-200 px-4',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded flex items-center justify-center">
            <MuleIcon className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-neutral-900">ShopMule</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <SidebarNav collapsed={sidebarCollapsed} />
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-neutral-200 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
