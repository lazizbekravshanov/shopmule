'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const founders = [
  {
    name: 'Lazizbek Ravshanov',
    role: 'CEO & Co-Founder',
    initials: 'LR',
    quote: 'We saw repair shops drowning in paper, losing revenue to missed charges, and spending more time on admin than on actual repairs. We built ShopMule to fix that.',
  },
  {
    name: 'Sherzod Norkobilov',
    role: 'CTO & Co-Founder',
    initials: 'SN',
    quote: 'Legacy shop software was built 20 years ago and it shows. We\'re building a modern, AI-powered platform from the ground up — fast, intuitive, and mobile-first.',
  },
  {
    name: 'Sadrijakhon',
    role: 'VP of Product',
    initials: 'SA',
    quote: 'Every feature we build starts with a real problem we\'ve heard from shop owners. No bloat, no complexity — just tools that make running a shop easier.',
  },
];

export function FounderStory() {
  return (
    <section className="py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Why we&apos;re building this.
          </h2>
          <p className="mt-4 text-xl text-neutral-500 max-w-2xl">
            Three founders, one mission: give every repair shop the software it deserves.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-gradient-to-br from-neutral-600 to-neutral-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{founder.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">{founder.name}</p>
                  <p className="text-xs text-neutral-500">{founder.role}</p>
                </div>
              </div>
              <p className="text-neutral-700 leading-relaxed text-[15px]">
                &ldquo;{founder.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white h-12 px-8 rounded-lg text-base font-medium transition-colors"
          >
            Join the Early Access
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Keep backward-compatible export
export { FounderStory as Testimonials };
