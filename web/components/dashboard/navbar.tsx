"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/command-palette"
import {
  LayoutDashboard,
  Wrench,
  Users,
  Clock,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { MuleIcon } from "@/components/ui/mule-logo"

interface NavBarProps {
  userName?: string | null
  userEmail: string
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/work-orders', label: 'Work Orders', icon: Wrench },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/technicians', label: 'Technicians', icon: Users },
  { href: '/time-clock', label: 'Time Clock', icon: Clock },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
]

export function NavBar({ userName, userEmail }: NavBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    router.push('/signout')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Nav Links */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <MuleIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold text-neutral-900 dark:text-white">
                  ShopMule
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.slice(0, 6).map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side: Search, User, Settings */}
            <div className="flex items-center gap-3">
              {/* Command Palette Search */}
              <CommandPalette />

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {userName || userEmail.split('@')[0]}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Admin
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-medium text-sm">
                  {(userName || userEmail)[0].toUpperCase()}
                </div>
              </div>

              {/* Settings */}
              <Link
                href="/settings"
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>

              {/* Sign Out */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Sign Out</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
