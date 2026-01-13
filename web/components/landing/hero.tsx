"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RequestDemoModal } from "./request-demo-modal"

export function LandingHero() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-gray-900 mb-8 leading-[1.05] tracking-[-0.04em]">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              onClick={() => setDemoOpen(true)}
              className="text-base px-10 h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 hover:from-amber-500 hover:to-orange-600 border-0 font-medium"
            >
              Request demo
            </Button>
            <Button 
              size="lg" 
              variant="ghost" 
              asChild
              className="text-base px-10 h-14 font-medium"
            >
              <Link href="#features">See features</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
