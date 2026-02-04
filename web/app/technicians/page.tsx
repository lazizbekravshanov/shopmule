'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, RefreshCw, Users, Wrench, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployees, useCreateEmployee } from '@/lib/queries/employees';
import { type Employee } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Mechanic', value: 'MECHANIC' },
  { label: 'Front Desk', value: 'FRONT_DESK' },
];

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  MANAGER: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  MECHANIC: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  FRONT_DESK: { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200' },
};

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium text-neutral-900">{row.original.name}</div>,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.original.role;
      const colors = roleColors[role] || roleColors.FRONT_DESK;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {role.replace('_', ' ')}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'payRate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pay Rate" />,
    cell: ({ row }) => (
      <span className="text-neutral-600">{formatCurrency(row.original.payRate)}/hr</span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const active = row.original.status === 'active';
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${
            active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-neutral-50 text-neutral-500 border-neutral-200'
          }`}
        >
          {row.original.status}
        </span>
      );
    },
  },
  {
    accessorKey: 'user.email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <span className="text-neutral-500">{row.original.user?.email || '—'}</span>
    ),
  },
];

export default function TechniciansPage() {
  const { data: employees, isLoading, refetch, isFetching } = useEmployees();
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

  // Stats
  const totalEmployees = employees?.length || 0;
  const mechanicCount = employees?.filter((e) => e.role === 'MECHANIC').length || 0;
  const activeCount = employees?.filter((e) => e.status === 'active').length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Technicians</h1>
          <p className="text-neutral-500 mt-1">
            Manage employees and their roles
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
            New Employee
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-500">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Employees</span>
            </div>
            <div className="text-2xl font-semibold text-neutral-900 mt-1">{totalEmployees}</div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-500">
              <Wrench className="h-4 w-4" />
              <span className="text-sm">Mechanics</span>
            </div>
            <div className="text-2xl font-semibold text-neutral-900 mt-1">{mechanicCount}</div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm">Active</span>
            </div>
            <div className="text-2xl font-semibold text-emerald-600 mt-1">{activeCount}</div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-neutral-200 rounded-lg">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={employees ?? []}
            searchKey="name"
            searchPlaceholder="Search employees..."
            filterableColumns={[
              {
                id: 'role',
                title: 'Role',
                options: roleOptions,
              },
            ]}
          />
        )}
      </div>

      {/* Create Employee Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">New Employee</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Add a new employee to the system
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
              {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
