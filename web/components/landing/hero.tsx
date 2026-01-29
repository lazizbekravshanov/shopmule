'use client';

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-white" />

      {/* Refined Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 mb-8"
          >
            <Bot className="w-4 h-4 text-amber-700" />
            <span className="text-sm font-medium text-amber-800">AI-Powered Shop Management</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1] mb-6"
          >
            Your Shop's New
            <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Hardest Worker
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            Load it up. Let it run. Watch profits climb.
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-neutral-500 max-w-xl mx-auto mb-10"
          >
            ShopMule is the tireless AI that manages your jobs, invoices, and customers while you focus on what matters—growing your business.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl h-14 px-8 text-base font-semibold shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:shadow-neutral-900/30 transition-all duration-300"
            >
              <Link href="/login">
                Start Free — No Card Needed
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl h-14 px-8 text-base font-medium border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
            >
              <a href="#demo">
                <Play className="mr-2 w-5 h-5" />
                See It Work
              </a>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Set up in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 relative"
        >
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
                <div className="w-52 bg-neutral-900 p-4 flex flex-col">
                  {/* Logo */}
                  <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
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
                            ? 'bg-amber-500 text-white font-medium'
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
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {statsCards.map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-3 border border-neutral-100 shadow-sm">
                        <p className="text-[10px] text-neutral-500 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
                        <p className={`text-[10px] ${stat.positive ? 'text-green-600' : 'text-amber-600'}`}>
                          {stat.change}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Section */}
                  <div className="grid grid-cols-5 gap-4">
                    {/* Chart */}
                    <div className="col-span-3 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-neutral-700">Revenue Overview</p>
                        <p className="text-[10px] text-neutral-400">Last 7 days</p>
                      </div>
                      {/* Mini Chart */}
                      <div className="flex items-end justify-between h-24 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div
                              className="w-6 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t"
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
                    <div className="col-span-2 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
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

            {/* Subtle Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-orange-400/10 to-amber-500/10 rounded-2xl blur-3xl -z-10 opacity-60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
