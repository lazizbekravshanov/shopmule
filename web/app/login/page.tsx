'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Users,
  Clock,
  Package,
  ArrowRight,
} from 'lucide-react';
import { MuleIcon } from '@/components/ui/mule-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: trimmedEmail,
        password: trimmedPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white bg-dot-grid flex">
      {/* Left Panel — brand showcase (desktop only) */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16"
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-20">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <MuleIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-900">ShopMule</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Run your shop
            <br />
            with{' '}
            <span className="relative inline-block">
              precision.
              <span className="absolute -bottom-2 left-0 right-0 h-[5px] bg-[#ee7a14] rounded-full" />
            </span>
          </h1>

          <p className="mt-6 text-lg text-neutral-500 max-w-md leading-relaxed">
            Work orders, invoices, and technicians — managed in one place so you can focus on repairs.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-12">
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

          <div className="bg-white border border-t-0 border-neutral-200 rounded-b-xl overflow-hidden shadow-2xl shadow-neutral-900/10">
            <div className="flex" style={{ height: '320px' }}>
              {/* Sidebar */}
              <div className="w-44 bg-neutral-900 p-3 flex-col hidden xl:flex">
                <div className="flex items-center gap-2 mb-5 px-2">
                  <div className="w-6 h-6 bg-[#ee7a14] rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-[9px]">SM</span>
                  </div>
                  <span className="text-white font-semibold text-xs">ShopMule</span>
                </div>
                <nav className="space-y-0.5">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                        item.active ? 'bg-white/10 text-white font-medium' : 'text-neutral-500'
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-neutral-50 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-900">Dashboard</h2>
                    <p className="text-[10px] text-neutral-400">Welcome back, Admin</p>
                  </div>
                  <div className="w-6 h-6 bg-neutral-200 rounded-full" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {statsCards.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-lg p-2.5 border border-neutral-100">
                      <p className="text-[9px] text-neutral-500 mb-0.5">{stat.label}</p>
                      <p className="text-base font-semibold text-neutral-900">{stat.value}</p>
                      <p className={`text-[9px] ${stat.positive ? 'text-emerald-600' : 'text-neutral-400'}`}>
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom */}
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-3 bg-white rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-medium text-neutral-600">Revenue</p>
                      <p className="text-[9px] text-neutral-400">Last 7 days</p>
                    </div>
                    <div className="flex items-end justify-between h-16 px-1">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-4 bg-neutral-900 rounded-sm" style={{ height: `${height}%` }} />
                          <span className="text-[7px] text-neutral-400">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 bg-white rounded-lg p-3 border border-neutral-100">
                    <p className="text-[10px] font-medium text-neutral-600 mb-2">Recent Work Orders</p>
                    <div className="space-y-1.5">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-0.5 border-b border-neutral-50 last:border-0">
                          <div>
                            <p className="text-[9px] font-medium text-neutral-900">{order.id}</p>
                            <p className="text-[8px] text-neutral-400">{order.vehicle}</p>
                          </div>
                          <div className={`px-1.5 py-0.5 rounded text-[7px] text-white font-medium ${order.color}`}>
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

          {/* Trust line */}
          <p className="mt-6 text-sm text-neutral-400 text-center">
            14-day free trial · No credit card required
          </p>
        </div>
      </motion.div>

      {/* Right Panel — login form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12"
      >
        <div className="w-full max-w-sm">
          {/* Logo (visible on all viewports, centered on mobile) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-2.5 mb-12 lg:mb-16 justify-center lg:justify-start"
          >
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <MuleIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-900 lg:hidden">ShopMule</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-8 text-center lg:text-left"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-neutral-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white border-neutral-200 focus:ring-2 focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-neutral-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white border-neutral-200 focus:ring-2 focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-8 text-center lg:text-left text-sm text-neutral-500"
          >
            Don&apos;t have an account?{' '}
            <Link
              href="/"
              className="font-medium text-[#ee7a14] hover:text-[#d56c10] transition-colors"
            >
              Start free trial
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
