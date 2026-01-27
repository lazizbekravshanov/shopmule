'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MuleIcon } from '@/components/ui/mule-logo';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Accent gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-50 to-transparent opacity-60" />

      <div className="relative max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
              <MuleIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
              Shop Management Software
            </span>
          </motion.div>

          {/* Headline - Swiss style: bold, direct */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.05]"
          >
            Run your shop
            <br />
            <span className="text-primary-500">with precision.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-neutral-600 leading-relaxed max-w-xl"
          >
            Work orders. Time tracking. Invoicing.
            Everything a heavy-duty repair shop needs, nothing it doesn&apos;t.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg h-12 px-6 text-base font-medium shadow-glow"
            >
              <Link href="/login">
                Start free trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-lg h-12 px-6 text-base border-neutral-300 hover:bg-neutral-50"
            >
              <a href="#features">See how it works</a>
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>

        {/* Stats row - Swiss grid alignment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 pt-12 border-t border-neutral-200"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Repair shops' },
              { value: '1M+', label: 'Work orders' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9/5', label: 'Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-neutral-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
