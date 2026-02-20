'use client';

import { useSession } from 'next-auth/react';
import { Bell, Menu, Search, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import { useUIStore } from '@/lib/stores/ui-store';
import { Breadcrumbs } from './breadcrumbs';
import { MuleIcon } from '@/components/ui/mule-logo';
import { LogoutButton } from '@/components/logout-button';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen, setCommandOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-neutral-600"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0 bg-neutral-900 border-neutral-800">
          <div className="flex h-14 items-center border-b border-neutral-800 px-4">
            <div className="w-7 h-7 bg-[#ee7a14] rounded-lg flex items-center justify-center mr-2">
              <MuleIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">ShopMule</span>
          </div>
          <div className="py-4">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>

      {/* Breadcrumbs */}
      <Breadcrumbs className="hidden md:flex" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <Button
        variant="outline"
        className="hidden w-56 justify-start text-neutral-400 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 md:flex"
        onClick={() => setCommandOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="text-sm">Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-200 bg-neutral-100 px-1.5 font-mono text-[10px] font-medium text-neutral-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        <span className="sr-only">Notifications</span>
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full hover:bg-neutral-100"
          >
            <Avatar className="h-8 w-8 border border-neutral-200">
              <AvatarFallback className="bg-neutral-100 text-neutral-600">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-neutral-900">
                {session?.user?.email || 'User'}
              </p>
              <p className="text-xs text-neutral-500">
                {session?.user?.role || 'User'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
