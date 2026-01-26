"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RequestDemoModal } from "./request-demo-modal"
import { useSmoothScroll } from "@/hooks"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const

export function LandingNav() {
  const [demoOpen, setDemoOpen] = useState(false)
  const { handleAnchorClick } = useSmoothScroll()

  const openDemo = useCallback(() => setDemoOpen(true), [])

  return (
    <>
      <nav
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/60"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-base font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded-sm"
              aria-label="ShopMule home"
            >
              ShopMule
            </Link>

            <div className="hidden md:flex items-center gap-10" role="list">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleAnchorClick(e, href)}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-light cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded-sm"
                  role="listitem"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-light"
                >
                  Sign in
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={openDemo}
                className="text-sm bg-gray-900 text-white hover:bg-gray-800 border-0 font-medium"
              >
                Request demo
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
