'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
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

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.role.replace('_', ' ')}</Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'payRate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pay Rate" />,
    cell: ({ row }) => (
      <div>{formatCurrency(row.original.payRate)}/hr</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'active' ? 'success' : 'secondary'}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'user.email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => row.original.user?.email || '-',
  },
];

export default function TechniciansPage() {
  const { data: employees, isLoading } = useEmployees();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
          <p className="text-muted-foreground">
            Manage employees and their roles
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Employee
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@bodyshopper.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
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
              <div className="grid gap-2">
                <Label htmlFor="payRate">Pay Rate ($/hr) *</Label>
                <Input
                  id="payRate"
                  type="number"
                  step="0.01"
                  value={payRate}
                  onChange={(e) => setPayRate(e.target.value)}
                  placeholder="25.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || !email || !password || !role || !payRate}
            >
              Create Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
