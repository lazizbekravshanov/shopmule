'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';

export function FinalCTA() {
  return (
    <section id="contact" className="py-32 bg-neutral-950">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-widest mb-6">
            Ready when you are
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-tight">
            Stop leaving money
            <br />
            on the table.
          </h2>
          <p className="mt-6 text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed">
            The average ShopMule customer recovers $87,000 in unbilled
            labor within the first year. Setup takes 5 minutes.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 h-14 px-10 rounded-lg text-base font-semibold transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:support@shopmuleai.com"
              className="inline-flex items-center gap-2 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white h-14 px-10 rounded-lg text-base font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Talk to us
            </a>
          </div>

          <p className="mt-8 text-sm text-neutral-600">
            14-day free trial · No credit card · Cancel anytime
          </p>
        </motion.div>

        {/* Divider */}
        <div className="mt-24 pt-16 border-t border-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white tabular-nums">500+</div>
              <div className="text-sm text-neutral-500 mt-2">Shops running on ShopMule</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white tabular-nums">$12.4M</div>
              <div className="text-sm text-neutral-500 mt-2">Revenue tracked in 2024</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white tabular-nums">98%</div>
              <div className="text-sm text-neutral-500 mt-2">Of customers renew annually</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
