'use client';

import { Truck, Wrench, Shield, Gauge, Settings } from 'lucide-react';

const logos = [
  { name: 'FleetMax', icon: Truck },
  { name: 'TruckPro', icon: Gauge },
  { name: 'AutoCare', icon: Wrench },
  { name: 'RoadReady', icon: Shield },
  { name: 'MechWorks', icon: Settings },
];

export function SocialProof() {
  return (
    <section className="py-12 border-t border-neutral-100">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center gap-6">
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
            Trusted by 500+ repair shops
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo) => (
              <div key={logo.name} className="flex items-center gap-2">
                <logo.icon className="w-4 h-4 text-neutral-300" />
                <span className="text-base font-semibold text-neutral-300 tracking-tight">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
