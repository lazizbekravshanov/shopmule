'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BillingStatus {
  plan: string;
  status: string;
  hasStripeCustomer: boolean;
  hasSubscription: boolean;
}

const plans = [
  {
    key: 'STARTER',
    name: 'Shop',
    price: '$149/mo',
    features: ['Up to 5 technicians', 'Unlimited work orders', 'Invoicing & payments'],
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: '$299/mo',
    features: ['Up to 15 technicians', 'Fleet accounts', 'Advanced reporting'],
    popular: true,
  },
  {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$599/mo',
    features: ['Unlimited technicians', 'Multi-location', 'API access'],
  },
];

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAST_DUE: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PAUSED: 'bg-neutral-100 text-neutral-700',
};

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((res) => res.json())
      .then(setBilling)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (plan: string) => {
    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-48" />
          <div className="h-32 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Billing</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">
                Current Plan: {billing?.plan ?? 'FREE'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    statusColors[billing?.status ?? ''] ?? 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {billing?.status ?? 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          {billing?.hasSubscription && (
            <Button
              variant="outline"
              onClick={handlePortal}
              disabled={portalLoading}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {portalLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = billing?.plan === plan.key;
          return (
            <div
              key={plan.key}
              className={`border rounded-xl p-6 ${
                plan.popular
                  ? 'border-orange-300 bg-orange-50/30'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              {plan.popular && (
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full mb-3 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6 gap-2"
                variant={isCurrent ? 'outline' : 'default'}
                disabled={isCurrent || checkoutLoading === plan.key}
                onClick={() => handleCheckout(plan.key)}
              >
                {isCurrent ? (
                  'Current Plan'
                ) : checkoutLoading === plan.key ? (
                  'Redirecting...'
                ) : (
                  <>
                    Upgrade <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
