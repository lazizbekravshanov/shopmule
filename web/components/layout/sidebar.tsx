'use client';

import { ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from './sidebar-nav';
import { useUIStore } from '@/lib/stores/ui-store';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'relative hidden h-screen border-r bg-background transition-all duration-300 lg:flex lg:flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b px-4',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <Truck className="h-6 w-6 text-primary" />
        {!sidebarCollapsed && (
          <span className="ml-2 text-lg font-semibold">ShopMule</span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <SidebarNav collapsed={sidebarCollapsed} />
      </ScrollArea>

      {/* Collapse button */}
      <Separator />
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
