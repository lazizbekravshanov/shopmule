"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { RequestDemoModal } from "./request-demo-modal"

export function FinalCTA() {
  const [demoOpen, setDemoOpen] = useState(false)

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const offset = 80
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
      <section className="py-32 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Train your shop to win, every time
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed font-light">
              Practice where it's safe. Perform when it counts. Your shop's next breakthrough starts here.
            </p>
            <Button 
              size="lg" 
              onClick={() => setDemoOpen(true)}
              className="text-base px-10 h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 hover:from-amber-500 hover:to-orange-600 border-0 font-medium"
            >
              Request demo
            </Button>
          </motion.div>
        </div>
      </section>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
