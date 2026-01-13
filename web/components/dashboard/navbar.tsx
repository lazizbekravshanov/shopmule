"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Clock, 
  FileText,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavBarProps {
  userName?: string | null
  userEmail: string
}

export function NavBar({ userName, userEmail }: NavBarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/repair-orders", label: "Repair Orders", icon: Wrench },
    { href: "/technicians", label: "Technicians", icon: Users },
    { href: "/time-clock", label: "Time Clock", icon: Clock },
    { href: "/invoices", label: "Invoices", icon: FileText },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors"
            >
              <Wrench className="h-6 w-6 text-orange-500" />
              <span className="hidden sm:inline">BodyShopper</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-orange-600" : "text-gray-400")} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Info and Sign Out */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {userName || userEmail.split("@")[0]}
              </span>
              <span className="text-xs text-gray-500 hidden md:inline">{userEmail}</span>
            </div>
            <div className="hidden md:block">
              <SignOutButton />
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-orange-600" : "text-gray-400")} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-4 border-t border-gray-200">
              <div className="px-4 py-2 mb-2">
                <div className="text-sm font-medium text-gray-900">
                  {userName || userEmail.split("@")[0]}
                </div>
                <div className="text-xs text-gray-500">{userEmail}</div>
              </div>
              <div className="px-4">
                <SignOutButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
