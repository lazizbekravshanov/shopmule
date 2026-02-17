'use client';

import { Truck, Wrench, Shield, Gauge, Settings, Cog } from 'lucide-react';

const shops = [
  { name: 'Big Rig Diesel', icon: Truck, location: 'Houston, TX' },
  { name: 'Summit Fleet Services', icon: Gauge, location: 'Denver, CO' },
  { name: 'Iron Horse Repair', icon: Wrench, location: 'Atlanta, GA' },
  { name: 'CrossCountry Truck Care', icon: Shield, location: 'Nashville, TN' },
  { name: 'Midwest Heavy Duty', icon: Cog, location: 'Kansas City, MO' },
  { name: 'Pacific Coast Diesel', icon: Settings, location: 'Portland, OR' },
];

const stats = [
  { value: '58,000+', label: 'work orders completed' },
  { value: '$12.4M', label: 'revenue tracked' },
  { value: '42 min', label: 'saved per invoice' },
];

export function SocialProof() {
  return (
    <section className="py-16 border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-2xl font-semibold text-neutral-900">{stat.value}</span>
              <span className="text-sm text-neutral-400 ml-1.5">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Shop logos */}
        <div className="flex flex-col items-center gap-5">
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
            Trusted by shops across the country
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {shops.map((shop) => (
              <div key={shop.name} className="flex items-center gap-2">
                <shop.icon className="w-4 h-4 text-neutral-300" />
                <span className="text-sm font-semibold text-neutral-300 tracking-tight">
                  {shop.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
