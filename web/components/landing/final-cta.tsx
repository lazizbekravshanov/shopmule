'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-24 bg-neutral-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Ready to run your shop
            <br />
            <span className="text-primary-400">with precision?</span>
          </h2>

          <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">
            Start your 14-day free trial. No credit card required.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg h-12 px-8 font-medium"
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
              className="rounded-lg h-12 px-8 font-medium border-neutral-700 bg-transparent text-white hover:bg-neutral-800"
            >
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
