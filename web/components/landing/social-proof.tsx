'use client';

const marketStats = [
  { value: '303,000+', label: 'repair shops in the US', source: 'IBISWorld 2025' },
  { value: '$89.6B', label: 'industry revenue', source: 'IBISWorld 2026' },
  { value: '71%', label: 'independently owned', source: 'IBISWorld' },
  { value: '~9%', label: 'software market CAGR', source: 'Projected to 2033' },
];

export function SocialProof() {
  return (
    <section className="border-t border-b border-neutral-100 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium text-center mb-8">
          A massive, underserved market
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {marketStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-neutral-900 tabular-nums">{stat.value}</div>
              <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-neutral-400 text-center mt-6">
          Sources: IBISWorld US Auto Mechanics Industry Report (2025–2026), IoT Analytics (2025)
        </p>
      </div>
    </section>
  );
}
