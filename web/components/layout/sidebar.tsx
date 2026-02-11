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
        'relative hidden h-screen border-r border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900 transition-all duration-300 ease-in-out lg:flex lg:flex-col',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo - Apple style: Clean, centered, prominent */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-neutral-200/80 dark:border-neutral-800 px-5',
          sidebarCollapsed && 'justify-center px-3'
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 group-hover:scale-105 transition-all duration-300">
            <MuleIcon className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 tracking-tight">
              ShopMule
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <SidebarNav collapsed={sidebarCollapsed} />
      </nav>

      {/* Collapse toggle - Apple style: Subtle, elegant */}
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-xl h-10 transition-all duration-300',
            sidebarCollapsed && 'px-0'
          )}
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
