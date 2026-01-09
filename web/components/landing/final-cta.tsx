"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { RequestDemoModal } from "./request-demo-modal"
import Link from "next/link"

export function FinalCTA() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <section className="py-24 relative overflow-hidden bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
              Ready to transform your shop?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed font-light">
              Join modern service centers running on BodyShopper.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setDemoOpen(true)}
                className="text-base px-8 h-12 bg-white text-gray-900 hover:bg-gray-100 border-0 font-medium"
              >
                Request demo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="text-base px-8 h-12 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 font-medium"
              >
                <Link href="#pricing">See pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
