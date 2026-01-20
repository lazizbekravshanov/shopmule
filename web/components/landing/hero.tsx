'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />

      {/* Floating Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 left-[15%] w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl opacity-20 blur-sm"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-48 right-[20%] w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-15 blur-sm"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-32 left-[25%] w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl opacity-20 blur-sm"
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-8">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Now with AI-powered diagnostics</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6"
          >
            The Modern Way to
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Run Your Shop
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Manage jobs, invoices, and customers in one place.
            <br className="hidden sm:block" />
            Built for speed. Designed for growth.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-black hover:bg-gray-800 text-white rounded-full h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
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
              className="rounded-full h-14 px-8 text-base font-semibold border-2 hover:bg-gray-50 transition-all"
            >
              <a href="#demo">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </a>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Browser Chrome */}
            <div className="bg-gray-900 rounded-t-xl p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-800 rounded-md px-4 py-1.5 text-xs text-gray-400 text-center">
                  app.bodyshopper.com/dashboard
                </div>
              </div>
            </div>

            {/* Screenshot Placeholder */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-b-xl aspect-[16/9] flex items-center justify-center border border-gray-200 overflow-hidden">
              <div className="w-full h-full bg-white p-4">
                {/* Mock Dashboard UI */}
                <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-48 bg-gray-50 rounded-lg p-3 mr-4">
                    <div className="h-8 bg-gray-200 rounded-lg mb-4" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-8 rounded-lg ${i === 1 ? 'bg-black' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {/* Main Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 h-24 bg-gray-50 rounded-xl p-4">
                          <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
                          <div className="h-6 w-20 bg-gray-300 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
                        <div className="h-32 bg-gradient-to-t from-blue-100 to-transparent rounded-lg" />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-6 bg-gray-200 rounded" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shadow/Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-3xl -z-10 opacity-50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
