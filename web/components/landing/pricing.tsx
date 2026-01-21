'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Starter',
    description: 'For small shops getting started',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Up to 3 technicians',
      'Unlimited work orders',
      'Basic invoicing',
      'Time tracking',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing shops that need more',
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
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For multi-location operations',
    monthlyPrice: 249,
    yearlyPrice: 199,
    features: [
      'Unlimited technicians',
      'Everything in Professional',
      'Multi-location support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary-600 mb-3 uppercase tracking-widest">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            No hidden fees. No surprises. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn('text-sm font-medium transition-colors', !isYearly ? 'text-neutral-900' : 'text-neutral-500')}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors duration-200',
                isYearly ? 'bg-primary-600' : 'bg-neutral-300'
              )}
              aria-label="Toggle billing period"
            >
              <motion.div
                initial={false}
                animate={{ x: isYearly ? 28 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
            <span className={cn('text-sm font-medium flex items-center gap-2 transition-colors', isYearly ? 'text-neutral-900' : 'text-neutral-500')}>
              Yearly
              <span className="bg-success-50 text-success-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative bg-white rounded-2xl p-8 transition-all duration-300',
                tier.popular
                  ? 'border-2 border-primary-600 shadow-glow'
                  : 'border border-neutral-200 hover:border-primary-200 hover:shadow-premium-lg'
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
                    <Zap className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{tier.name}</h3>
                <p className="text-sm text-neutral-500">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-neutral-900 tracking-tight">
                    ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-neutral-500 ml-2">/month</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Billed annually (${tier.yearlyPrice * 12}/year)
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  'w-full h-12 font-medium rounded-lg transition-all duration-200',
                  tier.popular
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                )}
              >
                <Link href="/login">{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Link */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 text-neutral-500"
        >
          Have questions?{' '}
          <a href="#faq" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Check our FAQ
          </a>{' '}
          or{' '}
          <a href="mailto:support@bodyshopper.com" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
            contact us
          </a>
        </motion.p>
      </div>
    </section>
  );
}
