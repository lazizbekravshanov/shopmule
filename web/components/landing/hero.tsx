'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Play,
  Check,
  Zap,
  LayoutDashboard,
  Wrench,
  FileText,
  Users,
  Clock,
  Package,
  Bot,
  Truck,
  Settings,
  Gauge,
  ClipboardList,
  Cog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Subtle floating background icons for visual interest
const floatingIcons = [
  { Icon: Wrench, className: 'top-24 left-[5%] w-16 h-16 -rotate-12' },
  { Icon: Truck, className: 'top-40 right-[8%] w-20 h-20 rotate-6' },
  { Icon: Cog, className: 'top-[60%] left-[10%] w-14 h-14 rotate-12' },
  { Icon: Gauge, className: 'top-32 right-[25%] w-12 h-12 -rotate-6' },
  { Icon: Settings, className: 'top-[70%] right-[5%] w-16 h-16 rotate-45' },
  { Icon: ClipboardList, className: 'top-[50%] left-[3%] w-12 h-12 -rotate-12' },
  { Icon: Wrench, className: 'top-[80%] right-[15%] w-10 h-10 rotate-12' },
  { Icon: Truck, className: 'top-20 left-[20%] w-10 h-10 -rotate-6' },
];

// Mock data for the dashboard preview
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
  { id: 'WO-1024', vehicle: 'Freightliner Cascadia', status: 'In Progress', statusColor: 'bg-primary-500' },
  { id: 'WO-1023', vehicle: 'Peterbilt 579', status: 'Completed', statusColor: 'bg-success-500' },
  { id: 'WO-1022', vehicle: 'Kenworth T680', status: 'Pending', statusColor: 'bg-warning-500' },
  { id: 'WO-1021', vehicle: 'Volvo VNL 760', status: 'In Progress', statusColor: 'bg-primary-500' },
];

const heroVariants = [
  {
    headline: ["Your Shop's New", "Hardest Worker"],
    subheadline: "Load it up. Let it run. Watch profits climb.",
    description: "ShopMule is the tireless AI that manages your jobs, invoices, and customers while you focus on what matters—growing your business.",
  },
  {
    headline: ["Stop Chasing Paper.", "Start Making Money."],
    subheadline: "Automate the busywork. Dominate the competition.",
    description: "ShopMule handles the invoices, scheduling, and follow-ups so you can focus on turning wrenches and growing revenue.",
  },
  {
    headline: ["Run Your Shop.", "Not Your Inbox."],
    subheadline: "AI that works nights, weekends, and holidays.",
    description: "From work orders to customer updates, ShopMule automates the tasks that steal your time—so you can reclaim your day.",
  },
  {
    headline: ["Built for Shops", "That Never Stop."],
    subheadline: "The workhorse your business deserves.",
    description: "ShopMule keeps your operation running smooth—managing jobs, tracking parts, and getting invoices paid while you sleep.",
  },
  {
    headline: ["More Repairs.", "Less Paperwork."],
    subheadline: "Finally, software that pulls its weight.",
    description: "Let ShopMule handle the admin grind. You focus on what you do best—repairs and building your business.",
  },
];

export function Hero() {
  const [variant, setVariant] = useState(heroVariants[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroVariants.length);
    setVariant(heroVariants[randomIndex]);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Clean Background - Apple style */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/40 via-white to-white" />

      {/* Subtle Floating Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className={`absolute hidden lg:block ${item.className}`}
          >
            <item.Icon className="w-full h-full text-orange-500/[0.05] stroke-[1]" />
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Minimal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 mb-10">
            <span className="text-sm font-medium text-neutral-600">AI-Powered Shop Management</span>
          </div>

          {/* Large Apple-style Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-neutral-900 leading-[1.05] mb-8">
            {variant.headline[0]}
            <br />
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
              {variant.headline[1]}
            </span>
          </h1>

          {/* Subheadline - Apple style: clean and impactful */}
          <p className="text-xl md:text-2xl lg:text-3xl text-neutral-500 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            {variant.subheadline}
          </p>

          {/* CTAs - Apple style: prominent primary, subtle secondary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 px-10 text-lg font-medium shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300"
            >
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="rounded-full h-14 px-10 text-lg font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-300"
            >
              <a href="#demo">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </a>
            </Button>
          </div>

          {/* Trust Indicators - More subtle */}
          <div className="flex flex-wrap items-center justify-center gap-10 text-sm text-neutral-400">
            <span>5-minute setup</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span>14-day free trial</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span>No credit card required</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="relative mx-auto max-w-5xl">
            {/* Browser Chrome */}
            <div className="bg-neutral-900 rounded-t-xl p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-neutral-800 rounded-md px-4 py-1.5 text-xs text-neutral-400 text-center max-w-xs mx-auto">
                  app.shopmule.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard UI */}
            <div className="bg-white rounded-b-xl border border-t-0 border-neutral-200 overflow-hidden">
              <div className="flex" style={{ height: '420px' }}>
                {/* Sidebar */}
                <div className="w-52 bg-neutral-900 p-4 flex flex-col hidden md:flex">
                  {/* Logo */}
                  <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SM</span>
                    </div>
                    <span className="text-white font-semibold text-sm">ShopMule</span>
                  </div>

                  {/* Nav Items */}
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          item.active
                            ? 'bg-orange-500 text-white font-medium'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
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
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">Dashboard</h2>
                      <p className="text-xs text-neutral-500">Welcome back, Admin</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        AI Active
                      </div>
                      <div className="w-8 h-8 bg-neutral-200 rounded-full" />
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {statsCards.map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-3 border border-neutral-100 shadow-sm">
                        <p className="text-[10px] text-neutral-500 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
                        <p className={`text-[10px] ${stat.positive ? 'text-green-600' : 'text-neutral-500'}`}>
                          {stat.change}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Section */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Chart */}
                    <div className="md:col-span-3 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-neutral-700">Revenue Overview</p>
                        <p className="text-[10px] text-neutral-400">Last 7 days</p>
                      </div>
                      {/* Mini Chart */}
                      <div className="flex items-end justify-between h-24 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div
                              className="w-6 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-[8px] text-neutral-400">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="md:col-span-2 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                      <p className="text-xs font-medium text-neutral-700 mb-3">Recent Work Orders</p>
                      <div className="space-y-2">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                            <div>
                              <p className="text-[10px] font-medium text-neutral-900">{order.id}</p>
                              <p className="text-[9px] text-neutral-500">{order.vehicle}</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[8px] text-white font-medium ${order.statusColor}`}>
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

            {/* Subtle Shadow Effect */}
            <div className="absolute -inset-4 bg-neutral-200/50 rounded-2xl blur-3xl -z-10 opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
}
