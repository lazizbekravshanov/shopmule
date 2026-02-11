'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Car,
  DollarSign,
  FileText,
  ChevronRight,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock fleet account data
const fleetAccounts = [
  {
    id: '1',
    name: 'ABC Logistics',
    vehicleCount: 45,
    activeJobs: 3,
    monthlySpend: 12500,
    status: 'active',
    contactName: 'James Wilson',
    contactEmail: 'james@abclogistics.com',
    discount: 15,
  },
  {
    id: '2',
    name: 'Metro Delivery Services',
    vehicleCount: 28,
    activeJobs: 1,
    monthlySpend: 8200,
    status: 'active',
    contactName: 'Maria Garcia',
    contactEmail: 'maria@metrodelivery.com',
    discount: 12,
  },
  {
    id: '3',
    name: 'City Plumbing Co.',
    vehicleCount: 12,
    activeJobs: 0,
    monthlySpend: 3400,
    status: 'active',
    contactName: 'Robert Chen',
    contactEmail: 'robert@cityplumbing.com',
    discount: 10,
  },
  {
    id: '4',
    name: 'Express Couriers',
    vehicleCount: 67,
    activeJobs: 5,
    monthlySpend: 18900,
    status: 'active',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@expresscouriers.com',
    discount: 18,
  },
  {
    id: '5',
    name: 'Sunrise Construction',
    vehicleCount: 23,
    activeJobs: 2,
    monthlySpend: 6700,
    status: 'pending',
    contactName: 'Michael Brown',
    contactEmail: 'michael@sunriseconstruction.com',
    discount: 10,
  },
];

export default function FleetAccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAccounts = fleetAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVehicles = fleetAccounts.reduce((sum, a) => sum + a.vehicleCount, 0);
  const totalMonthlyRevenue = fleetAccounts.reduce((sum, a) => sum + a.monthlySpend, 0);
  const activeAccounts = fleetAccounts.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
            Fleet Accounts
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage B2B and commercial fleet customers
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Fleet Account
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {activeAccounts}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Accounts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {totalVehicles}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Vehicles</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                ${totalMonthlyRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Monthly Revenue</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search fleet accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-neutral-200 dark:border-neutral-700"
          />
        </div>
      </motion.div>

      {/* Accounts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      >
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {filteredAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center gap-6 p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer group"
            >
              {/* Company Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                    {account.name}
                  </h3>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    account.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  )}>
                    {account.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {account.contactName} &bull; {account.contactEmail}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {account.vehicleCount}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Vehicles</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {account.activeJobs}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Active Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    ${account.monthlySpend.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Monthly</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    {account.discount}%
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Discount</p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
