"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RequestDemoModal } from "./request-demo-modal"

export function LandingNav() {
  const [demoOpen, setDemoOpen] = useState(false)

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const offset = 80 // Account for sticky navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-base font-medium text-gray-900">
              BodyShopper
            </Link>
            
            <div className="hidden md:flex items-center gap-10">
              <a 
                href="#features" 
                onClick={(e) => handleAnchorClick(e, '#features')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-light cursor-pointer"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleAnchorClick(e, '#pricing')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-light cursor-pointer"
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                onClick={(e) => handleAnchorClick(e, '#faq')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-light cursor-pointer"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-light">Sign in</Button>
              </Link>
              <Button 
                size="sm" 
                onClick={() => setDemoOpen(true)}
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
