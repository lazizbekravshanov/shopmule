'use client';

import Link from 'next/link';
import { ArrowRight, LayoutDashboard, Wrench, FileText, Users, Clock, Package } from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Wrench, label: 'Work Orders', active: false },
  { icon: FileText, label: 'Invoices', active: false },
  { icon: Users, label: 'Customers', active: false },
  { icon: Clock, label: 'Time Clock', active: false },
  { icon: Package, label: 'Inventory', active: false },
];

const statsCards = [
  { label: 'Revenue (MTD)', value: '$47,250', change: '+12%', positive: true },
  { label: 'Active Jobs', value: '8', change: '3 urgent', positive: false },
  { label: 'Pending Invoices', value: '$12,450', change: '5 unpaid', positive: false },
  { label: 'Technicians', value: '5/5', change: 'All active', positive: true },
];

const recentOrders = [
  { id: 'WO-1024', vehicle: 'Freightliner Cascadia', status: 'In Progress', color: 'bg-blue-500' },
  { id: 'WO-1023', vehicle: 'Peterbilt 579', status: 'Completed', color: 'bg-emerald-500' },
  { id: 'WO-1022', vehicle: 'Kenworth T680', status: 'Pending', color: 'bg-amber-500' },
  { id: 'WO-1021', vehicle: 'Volvo VNL 760', status: 'In Progress', color: 'bg-blue-500' },
];

export function Hero() {
  return (
    <section className="bg-white pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="max-w-7xl mx-auto px-6">

        {/* Traction bar */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-6 text-sm text-neutral-500 border border-neutral-200 rounded-full px-6 py-2.5">
            <span><span className="font-semibold text-neutral-900">500+</span> shops</span>
            <span className="w-px h-3.5 bg-neutral-200" />
            <span><span className="font-semibold text-neutral-900">$12.4M</span> revenue tracked</span>
            <span className="w-px h-3.5 bg-neutral-200" />
            <span><span className="font-semibold text-neutral-900">4.9★</span> avg rating</span>
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-neutral-900 leading-[1.05]">
            Your Shop&apos;s New
            <br />
            <span className="relative inline-block">
              Hardest Worker
              <span className="absolute -bottom-2 left-0 right-0 h-[5px] bg-[#ee7a14] rounded-full" />
            </span>
          </h1>

          <p className="mt-10 text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            ShopMule manages your work orders, invoices, and customers
            so you can focus on repairs and growing revenue.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white h-12 px-8 rounded-lg text-base font-medium transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 h-12 px-8 rounded-lg text-base font-medium transition-colors"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-6 text-sm text-neutral-400">
            5-minute setup · 14-day free trial · No credit card required
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          {/* Browser Chrome */}
          <div className="bg-neutral-900 rounded-t-xl p-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-neutral-800 rounded px-4 py-1.5 text-xs text-neutral-500 text-center max-w-xs mx-auto font-mono">
                app.shopmule.com/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard UI */}
          <div className="bg-white border border-t-0 border-neutral-200 rounded-b-xl overflow-hidden shadow-2xl shadow-neutral-900/10">
            <div className="flex" style={{ height: '400px' }}>
              {/* Sidebar */}
              <div className="w-48 bg-neutral-900 p-4 hidden md:flex flex-col">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-7 h-7 bg-[#ee7a14] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">SM</span>
                  </div>
                  <span className="text-white font-semibold text-sm">ShopMule</span>
                </div>
                <nav className="space-y-0.5">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                        item.active ? 'bg-white/10 text-white font-medium' : 'text-neutral-500'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-neutral-50 p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900">Dashboard</h2>
                    <p className="text-xs text-neutral-400">Welcome back, Admin</p>
                  </div>
                  <div className="w-7 h-7 bg-neutral-200 rounded-full" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {statsCards.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-lg p-3 border border-neutral-100">
                      <p className="text-[10px] text-neutral-500 mb-0.5">{stat.label}</p>
                      <p className="text-lg font-semibold text-neutral-900">{stat.value}</p>
                      <p className={`text-[10px] ${stat.positive ? 'text-emerald-600' : 'text-neutral-400'}`}>
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-3 bg-white rounded-lg p-4 border border-neutral-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-neutral-600">Revenue</p>
                      <p className="text-[10px] text-neutral-400">Last 7 days</p>
                    </div>
                    <div className="flex items-end justify-between h-20 px-1">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-5 bg-neutral-900 rounded-sm" style={{ height: `${height}%` }} />
                          <span className="text-[8px] text-neutral-400">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white rounded-lg p-4 border border-neutral-100">
                    <p className="text-xs font-medium text-neutral-600 mb-3">Recent Work Orders</p>
                    <div className="space-y-2">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-1 border-b border-neutral-50 last:border-0">
                          <div>
                            <p className="text-[10px] font-medium text-neutral-900">{order.id}</p>
                            <p className="text-[9px] text-neutral-400">{order.vehicle}</p>
                          </div>
                          <div className={`px-1.5 py-0.5 rounded text-[8px] text-white font-medium ${order.color}`}>
                            {order.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
