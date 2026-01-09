"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Grid3x3, Package, Receipt, Tv } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Repair orders",
    description: "Complete workflow from draft to completion with full history.",
  },
  {
    icon: Clock,
    title: "Time clock",
    description: "Accurate shift and per-job time tracking for all technicians.",
  },
  {
    icon: Grid3x3,
    title: "Bay scheduling",
    description: "Assign work to bays and technicians with real-time visibility.",
  },
  {
    icon: Package,
    title: "Parts & inventory",
    description: "Track inventory levels and link parts to repair orders automatically.",
  },
  {
    icon: Receipt,
    title: "Invoices",
    description: "Generate invoices from repair orders and track all payments.",
  },
  {
    icon: Tv,
    title: "Performance TV",
    description: "Real-time shop floor leaderboard showing technician metrics.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
          Everything your shop needs
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
          Purpose-built for trucking service centers.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
            >
              <Card className="border-gray-200 h-full hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center mb-4 bg-gray-50/50">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed font-light">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
