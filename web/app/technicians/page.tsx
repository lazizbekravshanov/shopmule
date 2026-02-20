'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Search,
  Filter,
  Users,
  Wrench,
  ShieldCheck,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployees, useCreateEmployee } from '@/lib/queries/employees';
import { TechnicianGrid, TeamOverview } from '@/components/technicians';
import type { TechnicianData } from '@/components/technicians';
import { cn } from '@/lib/utils';

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Mechanic', value: 'MECHANIC' },
  { label: 'Front Desk', value: 'FRONT_DESK' },
];

type WhoEntry = {
  employee: { id: string; name: string; role: string; photoUrl?: string };
  status: 'CLOCKED_IN' | 'ON_BREAK' | 'CLOCKED_OUT';
  currentShift: { clockInTime: string | null; duration: { minutes: number; formatted: string } | null } | null;
};

// Merge employees list with live attendance data
function buildTechnicianData(employees: any[], whoData: { employees: { clockedIn: WhoEntry[]; onBreak: WhoEntry[]; clockedOut: WhoEntry[] } } | undefined): TechnicianData[] {
  if (!employees) return [];

  const statusMap = new Map<string, WhoEntry>();
  if (whoData) {
    for (const e of [...whoData.employees.clockedIn, ...whoData.employees.onBreak, ...whoData.employees.clockedOut]) {
      statusMap.set(e.employee.id, e);
    }
  }

  return employees.map((emp) => {
    const live = statusMap.get(emp.id);
    const status = live
      ? live.status === 'CLOCKED_IN' ? 'clocked_in' : live.status === 'ON_BREAK' ? 'on_break' : 'clocked_out'
      : 'clocked_out';

    const shiftMinutes = live?.currentShift?.duration?.minutes ?? 0;
    const todayHours = Math.round((shiftMinutes / 60) * 10) / 10;
    const clockedInAt = live?.currentShift?.clockInTime ?? undefined;

    return {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      status,
      clockedInAt,
      currentJob: undefined,
      efficiency: 0,
      efficiencyTrend: 'stable' as const,
      todayHours,
      weekHours: 0,
      jobsCompleted: 0,
      certifications: [],
      payRate: emp.payRate,
      email: emp.user?.email,
      phone: emp.phone ?? '',
    };
  });
}

export default function TechniciansPage() {
  const { data: employees, isLoading, refetch, isFetching } = useEmployees();
  const { data: whoData } = useQuery({
    queryKey: ['whos-working'],
    queryFn: () => fetch('/api/attendance/whos-working').then((r) => r.json()),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [payRate, setPayRate] = useState('');
  const createEmployee = useCreateEmployee();

  const handleCreate = () => {
    if (!name || !email || !password || !role || !payRate) return;
    createEmployee.mutate(
      {
        name,
        email,
        password,
        role,
        payRate: parseFloat(payRate),
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setName('');
          setEmail('');
          setPassword('');
          setRole('');
          setPayRate('');
        },
      }
    );
  };

  // Transform and filter data
  const technicians = useMemo(() => buildTechnicianData(employees ?? [], whoData), [employees, whoData]);
  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || tech.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate team stats
  const teamStats = {
    total: technicians.length,
    clockedIn: technicians.filter(t => t.status === 'clocked_in').length,
    onBreak: technicians.filter(t => t.status === 'on_break').length,
    available: technicians.filter(t => t.status === 'clocked_out').length,
    avgEfficiency: Math.round(technicians.reduce((sum, t) => sum + t.efficiency, 0) / (technicians.length || 1)),
    totalHoursToday: Math.round(technicians.reduce((sum, t) => sum + t.todayHours, 0) * 10) / 10,
    jobsInProgress: technicians.filter(t => t.currentJob).length,
    jobsCompletedToday: technicians.reduce((sum, t) => sum + t.jobsCompleted, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Technicians</h1>
          <p className="text-neutral-500 mt-1">
            Manage your team and track performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-neutral-200"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Technician
          </Button>
        </div>
      </div>

      {/* Team Overview */}
      {!isLoading && technicians.length > 0 && (
        <TeamOverview stats={teamStats} />
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search technicians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-neutral-200"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px] border-neutral-200">
              <Filter className="w-4 h-4 mr-2 text-neutral-400" />
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-neutral-200 rounded-lg p-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'list' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-neutral-500 mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Team</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{teamStats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-neutral-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Clocked In</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{teamStats.clockedIn}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-neutral-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Avg Efficiency</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">{teamStats.avgEfficiency}%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-neutral-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Wrench className="h-4 w-4" />
              <span className="text-sm">Jobs In Progress</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{teamStats.jobsInProgress}</div>
          </motion.div>
        </div>
      )}

      {/* Technician Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[360px] rounded-xl" />
          ))}
        </div>
      ) : filteredTechnicians.length > 0 ? (
        <TechnicianGrid technicians={filteredTechnicians} />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No technicians found</h3>
          <p className="text-neutral-500 mb-4">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first team member to get started'}
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Technician
          </Button>
        </div>
      )}

      {/* Create Employee Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Add Technician</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Add a new team member to your shop
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-700">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="border-neutral-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@shopmule.com"
                  className="border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="border-neutral-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-neutral-700">Role *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="border-neutral-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payRate" className="text-sm font-medium text-neutral-700">Pay Rate ($/hr) *</Label>
                <Input
                  id="payRate"
                  type="number"
                  step="0.01"
                  value={payRate}
                  onChange={(e) => setPayRate(e.target.value)}
                  placeholder="25.00"
                  className="border-neutral-200"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-neutral-200">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || !email || !password || !role || !payRate}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {createEmployee.isPending ? 'Adding...' : 'Add Technician'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
