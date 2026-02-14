'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-neutral-900 text-white relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="text-neutral-300">
            <span className="font-semibold text-white">New:</span>{' '}
            Multi-tenant fleet accounts, appointment scheduling, and enhanced inventory are live.
          </span>
          <Link
            href="#features"
            className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium shrink-0 transition-colors"
          >
            See what&apos;s new
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="absolute right-4 p-1 text-neutral-500 hover:text-white transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
