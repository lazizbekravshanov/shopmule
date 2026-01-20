'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomers, useCreateCustomer, useAddVehicle } from '@/lib/queries/customers';
import { type Customer } from '@/lib/api';

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: 'contactName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
    cell: ({ row }) => row.original.contactName || '-',
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => row.original.email || '-',
  },
  {
    accessorKey: 'vehicles',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicles" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Car className="h-4 w-4 text-muted-foreground" />
        {row.original.vehicles?.length ?? 0}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
];

function CustomerActions({ customer }: { customer: Customer }) {
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const addVehicle = useAddVehicle();

  const handleAddVehicle = () => {
    if (!vin) return;
    addVehicle.mutate(
      {
        customerId: customer.id,
        vin,
        make: make || undefined,
        model: model || undefined,
        year: year ? parseInt(year) : undefined,
      },
      {
        onSuccess: () => {
          setVehicleOpen(false);
          setVin('');
          setMake('');
          setModel('');
          setYear('');
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setVehicleOpen(true)}>
            <Car className="mr-2 h-4 w-4" />
            Add Vehicle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle for {customer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vin">VIN *</Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="Enter VIN"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Ford"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="F-150"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle} disabled={!vin}>
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const createCustomer = useCreateCustomer();

  const handleCreate = () => {
    if (!name) return;
    createCustomer.mutate(
      {
        name,
        contactName: contactName || undefined,
        phone: phone || undefined,
        email: email || undefined,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setName('');
          setContactName('');
          setPhone('');
          setEmail('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customers and their vehicles
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Customer
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
          data={customers ?? []}
          searchKey="name"
          searchPlaceholder="Search customers..."
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
            <DialogDescription>Add a new customer to the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company/Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Trucking"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-1234"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@acme.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name}>
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
