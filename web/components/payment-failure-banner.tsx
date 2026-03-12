'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

export function PaymentFailureBanner() {
  const [status, setStatus] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'PAST_DUE' || data.status === 'CANCELLED') {
          setStatus(data.status);
        }
      })
      .catch(() => {});
  }, []);

  if (!status || dismissed) return null;

  const isCancelled = status === 'CANCELLED';

  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 text-sm ${
        isCancelled
          ? 'bg-red-600 text-white'
          : 'bg-amber-600 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-medium">
          {isCancelled
            ? 'Your subscription has been cancelled. Upgrade to restore access.'
            : 'Payment failed. Please update your billing info to avoid service interruption.'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/settings/billing"
          className={`flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-xs transition-colors ${
            isCancelled
              ? 'bg-white text-red-600 hover:bg-red-50'
              : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isCancelled ? 'Resubscribe' : 'Update payment'} <ArrowRight className="w-3 h-3" />
        </Link>
        {!isCancelled && (
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
