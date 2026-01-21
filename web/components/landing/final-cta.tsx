'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-24 bg-neutral-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-500/15 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-white/90">Join 500+ repair shops</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Ready to modernize
            <br />
            your shop?
          </h2>

          <p className="text-xl text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Start your 14-day free trial today. No credit card required.
            <br />
            See the difference BodyShopper can make.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-neutral-100 text-neutral-900 rounded-lg h-14 px-8 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-lg h-14 px-8 text-base font-medium border-white/30 bg-transparent text-white hover:bg-white/10 transition-all duration-200"
            >
              <a href="mailto:sales@bodyshopper.com">Talk to Sales</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
