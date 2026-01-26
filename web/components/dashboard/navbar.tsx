"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface NavBarProps {
  userName?: string | null
  userEmail: string
}

export function NavBar({ userName, userEmail }: NavBarProps) {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
              ShopMule
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/repair-orders"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Repair Orders
              </Link>
              <Link
                href="/technicians"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Technicians
              </Link>
              <Link
                href="/time-clock"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Time Clock
              </Link>
              <Link
                href="/invoices"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Invoices
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 hidden sm:inline">
              {userName || userEmail}
            </span>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="text-sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
