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
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle gradient blob background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/5 to-cyan-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-violet-500/5 to-indigo-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 mb-6 leading-[1.1] tracking-[-0.02em]">
              Run your shop{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent font-medium">
                like software
              </span>
              .
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Modern SaaS for trucking service centers. Streamline repair orders, track time accurately, and run your operations with precision.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Button 
              size="lg" 
              onClick={() => setDemoOpen(true)}
              className="text-base px-8 h-12 bg-gray-900 hover:bg-gray-800 text-white border-0 font-medium"
            >
              Request demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="text-base px-8 h-12 border-gray-300 hover:bg-gray-50 font-medium"
            >
              <Link href="#features">See how it works</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-sm text-gray-500"
          >
            Built for modern service centers
          </motion.p>
        </div>
      </section>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
