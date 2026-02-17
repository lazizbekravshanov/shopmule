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
    <section id="pricing" className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header - Apple style: centered, large */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Simple, transparent pricing.
          </h2>
          <p className="mt-6 text-xl text-neutral-500">
            No hidden fees. No surprises. Cancel anytime.
          </p>

          {/* Billing Toggle - Apple style: pill design */}
          <div className="mt-10 inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-full">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                !isYearly ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2',
                isYearly ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              )}
            >
              Yearly
              <span className="text-xs text-orange-600 font-semibold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards - Apple style: clean, floating cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'rounded-3xl p-8 flex flex-col relative',
                tier.popular
                  ? 'bg-neutral-900 text-white ring-1 ring-neutral-700'
                  : 'bg-neutral-50'
              )}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-neutral-900 text-neutral-300 text-xs font-medium px-3 py-1 rounded-full border border-neutral-700">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <h3 className={cn(
                  'text-xl font-semibold',
                  tier.popular ? 'text-white' : 'text-neutral-900'
                )}>
                  {tier.name}
                </h3>
                <p className={cn(
                  'text-sm mt-1',
                  tier.popular ? 'text-neutral-400' : 'text-neutral-500'
                )}>
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className={cn(
                  'text-5xl font-semibold tracking-tight',
                  tier.popular ? 'text-white' : 'text-neutral-900'
                )}>
                  ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                <span className={tier.popular ? 'text-neutral-400' : 'text-neutral-500'}>/mo</span>
                {isYearly && (
                  <p className={cn(
                    'text-sm mt-2',
                    tier.popular ? 'text-neutral-500' : 'text-neutral-400'
                  )}>
                    Billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={cn(
                      'w-5 h-5 flex-shrink-0',
                      tier.popular ? 'text-orange-400' : 'text-orange-500'
                    )} />
                    <span className={cn(
                      'text-sm',
                      tier.popular ? 'text-neutral-300' : 'text-neutral-600'
                    )}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                className={cn(
                  'w-full h-12 font-medium rounded-full transition-all duration-300',
                  tier.popular
                    ? 'bg-white text-neutral-900 hover:bg-neutral-100'
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
