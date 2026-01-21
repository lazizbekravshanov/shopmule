'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  Wrench,
  FileText,
  Users,
  Clock,
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
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
  { id: 'WO-1024', vehicle: 'Freightliner Cascadia', status: 'In Progress', statusColor: 'bg-blue-500' },
  { id: 'WO-1023', vehicle: 'Peterbilt 579', status: 'Completed', statusColor: 'bg-green-500' },
  { id: 'WO-1022', vehicle: 'Kenworth T680', status: 'Pending', statusColor: 'bg-yellow-500' },
  { id: 'WO-1021', vehicle: 'Volvo VNL 760', status: 'In Progress', statusColor: 'bg-blue-500' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />

      {/* Floating Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 left-[15%] w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl opacity-20 blur-sm"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-48 right-[20%] w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-15 blur-sm"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-32 left-[25%] w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl opacity-20 blur-sm"
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-8">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Now with AI-powered diagnostics</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6"
          >
            The Modern Way to
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Run Your Shop
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Manage jobs, invoices, and customers in one place.
            <br className="hidden sm:block" />
            Built for speed. Designed for growth.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-black hover:bg-gray-800 text-white rounded-full h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full h-14 px-8 text-base font-semibold border-2 hover:bg-gray-50 transition-all"
            >
              <a href="#demo">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </a>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Browser Chrome */}
            <div className="bg-gray-900 rounded-t-xl p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-800 rounded-md px-4 py-1.5 text-xs text-gray-400 text-center">
                  app.bodyshopper.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard UI */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 overflow-hidden">
              <div className="flex" style={{ height: '420px' }}>
                {/* Sidebar */}
                <div className="w-52 bg-gray-900 p-4 flex flex-col">
                  {/* Logo */}
                  <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-gray-900" />
                    </div>
                    <span className="text-white font-semibold text-sm">BodyShopper</span>
                  </div>

                  {/* Nav Items */}
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          item.active
                            ? 'bg-white text-gray-900 font-medium'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-gray-50 p-5 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
                      <p className="text-xs text-gray-500">Welcome back, Admin</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {statsCards.map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-[10px] ${stat.positive ? 'text-green-600' : 'text-amber-600'}`}>
                          {stat.change}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Section */}
                  <div className="grid grid-cols-5 gap-4">
                    {/* Chart */}
                    <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-gray-700">Revenue Overview</p>
                        <p className="text-[10px] text-gray-400">Last 7 days</p>
                      </div>
                      {/* Mini Chart */}
                      <div className="flex items-end justify-between h-24 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div
                              className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-[8px] text-gray-400">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-xs font-medium text-gray-700 mb-3">Recent Work Orders</p>
                      <div className="space-y-2">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-[10px] font-medium text-gray-900">{order.id}</p>
                              <p className="text-[9px] text-gray-500">{order.vehicle}</p>
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

            {/* Shadow/Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-3xl -z-10 opacity-50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
