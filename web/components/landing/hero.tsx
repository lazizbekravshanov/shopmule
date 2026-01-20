"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RequestDemoModal } from "./request-demo-modal"
import { useSmoothScroll } from "@/hooks"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function LandingHero() {
  const [demoOpen, setDemoOpen] = useState(false)
  const { handleAnchorClick } = useSmoothScroll()

  const openDemo = useCallback(() => setDemoOpen(true), [])

  return (
    <>
      <section
        className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              id="hero-heading"
              className="text-6xl md:text-7xl lg:text-8xl font-light text-gray-900 mb-8 leading-[1.05] tracking-[-0.04em]"
            >
              Run your shop{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent font-normal">
                like software
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Modern SaaS for trucking service centers. Streamline repair orders, track time accurately, and run your operations with precision.
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
            role="group"
            aria-label="Call to action buttons"
          >
            <Button
              size="lg"
              onClick={openDemo}
              className="text-base px-10 h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 hover:from-amber-500 hover:to-orange-600 border-0 font-medium focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Request demo
            </Button>
            <a
              href="#features"
              onClick={(e) => handleAnchorClick(e, "#features")}
              className="inline-flex items-center justify-center text-base px-10 h-14 font-medium text-gray-900 hover:bg-gray-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              See features
            </a>
          </motion.div>
        </div>
      </section>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
