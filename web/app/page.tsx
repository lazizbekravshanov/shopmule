'use client';

import Link from 'next/link';
import { ArrowRight, Wrench, Clock, FileText, BarChart3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">BodyShopper</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-black transition-colors">
              Log in
            </Link>
            <Button asChild size="sm" className="bg-black hover:bg-gray-800">
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-600 mb-6">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Now in beta
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-black leading-[1.1] mb-6">
            Body shop management,
            <br />
            <span className="text-gray-400">simplified.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Track work orders, manage technicians, handle invoicing, and monitor inventory — all in one place. Built for truck repair shops that want to move fast.
          </p>
          <div className="flex items-center gap-4">
            <Button asChild size="lg" className="bg-black hover:bg-gray-800 h-12 px-6">
              <Link href="/login">
                Start for free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <span className="text-sm text-gray-500">No credit card required</span>
          </div>
        </div>
      </section>

      {/* Pixel Grid Decoration */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm ${
                [3, 7, 12, 18, 23, 29, 34, 41].includes(i)
                  ? 'bg-black'
                  : [5, 15, 26, 37, 44].includes(i)
                  ? 'bg-gray-300'
                  : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <FeatureCard
            icon={Wrench}
            title="Work Orders"
            description="Create, assign, and track repair orders through every stage. From diagnosis to completion."
          />
          <FeatureCard
            icon={Clock}
            title="Time Tracking"
            description="Clock in/out for technicians. Automatic hour calculation for payroll."
          />
          <FeatureCard
            icon={FileText}
            title="Invoicing"
            description="Generate invoices from work orders. Track payments and outstanding balances."
          />
          <FeatureCard
            icon={BarChart3}
            title="Reports"
            description="Revenue, productivity, and payroll reports. Know your numbers."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Why shops choose us</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StatCard number="10x" label="Faster invoicing" />
            <StatCard number="2hrs" label="Saved per day" />
            <StatCard number="99.9%" label="Uptime" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-gray-600 mb-8">One plan. Everything included.</p>
          <div className="border border-gray-200 rounded-lg p-8">
            <div className="mb-6">
              <span className="text-5xl font-bold">$49</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 text-left mb-8">
              {[
                'Unlimited work orders',
                'Unlimited technicians',
                'Invoicing & payments',
                'Inventory management',
                'Reports & analytics',
                'Email support',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full bg-black hover:bg-gray-800">
              <Link href="/login">Get started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your shop?</h2>
          <p className="text-gray-600 mb-8">Join hundreds of repair shops already using BodyShopper.</p>
          <Button asChild size="lg" className="bg-black hover:bg-gray-800 h-12 px-8">
            <Link href="/login">
              Start free trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                <Wrench className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">BodyShopper</span>
            </div>
            <p className="text-sm text-gray-500">© 2026 BodyShopper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-black transition-colors">
        <Icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-1">{number}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
