"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const screenshots = [
  {
    title: "Repair order management",
    description: "Complete workflow from creation to invoicing.",
  },
  {
    title: "Time tracking dashboard",
    description: "Real-time visibility into technician activity.",
  },
  {
    title: "Performance analytics",
    description: "Track efficiency and shop metrics.",
  },
]

export function ScreenshotsSection() {
  return (
    <section className="py-32 border-t border-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Built for shop operations
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See how BodyShopper works in practice.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {screenshots.map((screenshot, index) => (
          <motion.div
            key={screenshot.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Screenshot</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {screenshot.title}
                </h3>
                <p className="text-sm text-gray-600">
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
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 max-w-4xl mx-auto"
      >
        <Card className="border-gray-200 overflow-hidden">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Demo video</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  )
}
