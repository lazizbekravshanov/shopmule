'use client';

const stats = [
  { value: '500+', label: 'repair shops' },
  { value: '$12.4M', label: 'revenue tracked' },
  { value: '58,000+', label: 'work orders completed' },
  { value: '42 min', label: 'saved per invoice' },
  { value: '4.9 / 5', label: 'average rating' },
  { value: '98%', label: 'annual renewal rate' },
];

const shops = [
  'Big Rig Diesel · Houston TX',
  'Summit Fleet Services · Denver CO',
  'Iron Horse Repair · Atlanta GA',
  'CrossCountry Truck Care · Nashville TN',
  'Midwest Heavy Duty · Kansas City MO',
  'Pacific Coast Diesel · Portland OR',
];

export function SocialProof() {
  return (
    <section className="border-t border-b border-neutral-100 bg-neutral-50">
      {/* Stats strip */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-neutral-900 tabular-nums">{stat.value}</div>
              <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shop names */}
      <div className="border-t border-neutral-100 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <span className="text-[11px] text-neutral-400 uppercase tracking-widest font-medium whitespace-nowrap">
              Trusted by
            </span>
            {shops.map((shop) => (
              <span key={shop} className="text-xs font-medium text-neutral-400">
                {shop}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
