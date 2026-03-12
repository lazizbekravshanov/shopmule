'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, X } from 'lucide-react';

export function TrialBanner() {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.plan === 'FREE' && data.trialDaysLeft != null && !data.trialExpired) {
          setTrialDaysLeft(data.trialDaysLeft);
        }
      })
      .catch(() => {});
  }, []);

  if (trialDaysLeft === null || dismissed) return null;

  const isUrgent = trialDaysLeft <= 3;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 text-sm ${
        isUrgent
          ? 'bg-red-600 text-white'
          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span className="font-medium">
          {trialDaysLeft === 0
            ? 'Your trial expires today.'
            : trialDaysLeft === 1
              ? '1 day left in your trial.'
              : `${trialDaysLeft} days left in your free trial.`}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/settings/billing"
          className={`flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-xs transition-colors ${
            isUrgent
              ? 'bg-white text-red-600 hover:bg-red-50'
              : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          Upgrade now <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
