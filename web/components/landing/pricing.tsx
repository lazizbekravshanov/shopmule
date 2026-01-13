"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useState } from "react"
import { RequestDemoModal } from "./request-demo-modal"

const tiers = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "Perfect for small shops getting started.",
    features: [
      "Up to 5 technicians",
      "Unlimited repair orders",
      "Time tracking",
      "Basic reporting",
      "Email support",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$249",
    period: "/month",
    description: "For growing shops that need more.",
    features: [
      "Up to 20 technicians",
      "Everything in Starter",
      "Advanced reporting",
      "Performance TV mode",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Get started",
    popular: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For large operations with specific needs.",
    features: [
      "Unlimited technicians",
      "Everything in Pro",
      "Dedicated support",
      "Custom features",
      "SLA guarantee",
      "Training & onboarding",
    ],
    cta: "Contact sales",
    popular: false,
  },
]

export function PricingSection() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <section id="pricing" className="py-32 border-t border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-5 tracking-tight">
            Pricing
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="border-gray-200 h-full bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">{tier.name}</CardTitle>
                  <CardDescription className="mt-2 font-light text-sm">{tier.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-light text-gray-900 tracking-tight">{tier.price}</span>
                    {tier.period && (
                      <span className="text-gray-600 ml-1 text-base font-light">{tier.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed font-light text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 font-medium ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 hover:from-amber-500 hover:to-orange-600 border-0' 
                        : 'border-gray-300'
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      if (tier.name === "Scale") {
                        setDemoOpen(true)
                      }
                    }}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
