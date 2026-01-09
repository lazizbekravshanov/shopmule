"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Grid3x3, Package, Receipt, Tv } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Repair orders",
    description: "Streamlined workflow from draft to completion with detailed notes and history tracking.",
  },
  {
    icon: Clock,
    title: "Time clock",
    description: "Accurate shift tracking and per-job time entries for technicians.",
  },
  {
    icon: Grid3x3,
    title: "Bay scheduling",
    description: "Assign repair orders to bays and technicians with real-time visibility.",
  },
  {
    icon: Package,
    title: "Parts & inventory",
    description: "Track inventory levels, manage parts, and link them to repair orders automatically.",
  },
  {
    icon: Receipt,
    title: "Invoices",
    description: "Generate invoices from repair orders and track payments seamlessly.",
  },
  {
    icon: Tv,
    title: "Performance TV",
    description: "Shop floor leaderboard showing real-time technician performance and metrics.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Everything your shop needs
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Built specifically for trucking service centers.
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
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-gray-200 h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center mb-4 bg-gray-50">
                    <Icon className="w-5 h-5 text-gray-900" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
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
