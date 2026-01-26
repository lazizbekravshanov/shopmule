"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const screenshots = [
  {
    title: "Repair order management",
    description: "Complete workflow from creation to invoicing in one view.",
  },
  {
    title: "Time tracking dashboard",
    description: "Real-time visibility into technician activity and performance.",
  },
  {
    title: "Performance analytics",
    description: "Track efficiency, utilization, and shop metrics at a glance.",
  },
]

export function ScreenshotsSection() {
  return (
    <section className="py-32 border-t border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-24"
      >
        <h2 className="text-5xl md:text-6xl font-medium text-gray-900 mb-5 tracking-tight leading-tight">
          Built for shop operations
        </h2>
        <p className="text-xl text-gray-600 max-w-xl mx-auto font-light">
          See how ShopMule works in practice.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {screenshots.map((screenshot, index) => (
          <motion.div
            key={screenshot.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border-gray-200 overflow-hidden bg-white">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gray-200/40 rounded-xl mx-auto mb-3 border border-gray-200"></div>
                  <p className="text-xs text-gray-400 font-light">Preview</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-2 text-lg">
                  {screenshot.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light text-[15px]">
                  {screenshot.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Video placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-20 max-w-5xl mx-auto"
      >
        <Card className="border-gray-200 overflow-hidden bg-white">
          <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100/30 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900/5 rounded-full mx-auto mb-4 flex items-center justify-center border border-gray-200">
                <svg className="w-8 h-8 text-gray-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-light">Watch demo</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  )
}
