'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Starter',
    description: 'For small shops',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Up to 3 technicians',
      'Unlimited work orders',
      'Basic invoicing',
      'Time tracking',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing shops',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Up to 10 technicians',
      'Everything in Starter',
      'Digital inspections',
      'Inventory management',
      'Advanced reporting',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For multi-location',
    monthlyPrice: 249,
    yearlyPrice: 199,
    features: [
      'Unlimited technicians',
      'Everything in Professional',
      'Multi-location support',
      'Custom integrations',
      'Dedicated account manager',
    ],
    popular: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
            Pricing
          </span>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Simple pricing.
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            No hidden fees. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center gap-4">
            <span className={cn(
              'text-sm font-medium transition-colors',
              !isYearly ? 'text-neutral-900' : 'text-neutral-400'
            )}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                isYearly ? 'bg-orange-500' : 'bg-neutral-300'
              )}
              aria-label="Toggle billing period"
            >
              <motion.div
                initial={false}
                animate={{ x: isYearly ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
            <span className={cn(
              'text-sm font-medium transition-colors',
              isYearly ? 'text-neutral-900' : 'text-neutral-400'
            )}>
              Yearly
              <span className="ml-2 text-xs text-orange-600 font-semibold">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-neutral-200 rounded-xl overflow-hidden">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                'bg-white p-8 flex flex-col',
                tier.popular && 'bg-neutral-50'
              )}
            >
              {/* Header */}
              <div className="mb-6">
                {tier.popular && (
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-neutral-900 mt-1">
                  {tier.name}
                </h3>
                <p className="text-sm text-neutral-500">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900 tracking-tight">
                  ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                <span className="text-neutral-500 ml-1">/mo</span>
                {isYearly && (
                  <p className="text-sm text-neutral-400 mt-1">
                    Billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                className={cn(
                  'w-full h-11 font-medium rounded-lg',
                  tier.popular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                )}
              >
                <Link href="/login">
                  Start free trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
