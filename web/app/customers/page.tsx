'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Truck, RefreshCw, User, Phone, Mail, MapPin, Users } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useCustomers, useCreateCustomer, useAddVehicle } from '@/lib/queries/customers';
import { type Customer } from '@/lib/api';

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-neutral-900">{row.original.name}</div>
        {row.original.contactName && (
          <div className="text-sm text-neutral-500">{row.original.contactName}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => (
      <span className="text-neutral-600">{row.original.phone || '—'}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <span className="text-neutral-600">{row.original.email || '—'}</span>
    ),
  },
  {
    id: 'vehicles',
    accessorFn: (row) => row.vehicles?.length ?? 0,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicles" />,
    cell: ({ row }) => {
      const count = row.original.vehicles?.length ?? 0;
      return (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-neutral-400" />
          <span className={count > 0 ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
            {count}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
];

function CustomerActions({ customer }: { customer: Customer }) {
  const { toast } = useToast();
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const addVehicle = useAddVehicle();

  const handleAddVehicle = () => {
    if (!vin || !make || !model) {
      toast({ variant: 'destructive', title: 'Error', description: 'VIN, make, and model are required' });
      return;
    }
    addVehicle.mutate(
      {
        customerId: customer.id,
        vin,
        make,
        model,
        year: year ? parseInt(year) : undefined,
        licensePlate: licensePlate || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Vehicle added', description: `${make} ${model} added to ${customer.name}` });
          setVehicleOpen(false);
          resetVehicleForm();
        },
        onError: (error) => {
          toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to add vehicle' });
        },
      }
    );
  };

  const resetVehicleForm = () => {
    setVin('');
    setMake('');
    setModel('');
    setYear('');
    setLicensePlate('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-neutral-200">
          <DropdownMenuLabel className="text-neutral-500 text-xs">Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setVehicleOpen(true)} className="cursor-pointer">
            <Truck className="mr-2 h-4 w-4" />
            Add Vehicle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Add Vehicle</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Add a new vehicle for {customer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vin" className="text-sm font-medium text-neutral-700">VIN *</Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="1HGBH41JXMN109186"
                className="border-neutral-200 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-sm font-medium text-neutral-700">Make *</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Volvo"
                  className="border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium text-neutral-700">Model *</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="VNL 860"
                  className="border-neutral-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium text-neutral-700">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2099"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  className="border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate" className="text-sm font-medium text-neutral-700">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="TRK-100"
                  className="border-neutral-200"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleOpen(false)} className="border-neutral-200">
              Cancel
            </Button>
            <Button
              onClick={handleAddVehicle}
              disabled={!vin || !make || !model || addVehicle.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {addVehicle.isPending ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function CustomersPage() {
  const { toast } = useToast();
  const { data: customers, isLoading, refetch, isFetching } = useCustomers();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const createCustomer = useCreateCustomer();

  const handleCreate = () => {
    if (!name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Company name is required' });
      return;
    }
    createCustomer.mutate(
      {
        name,
        contactName: contactName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        billingAddress: billingAddress || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Customer created', description: `${name} has been added` });
          setCreateOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to create customer' });
        },
      }
    );
  };

  const resetForm = () => {
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setBillingAddress('');
  };

  // Stats
  const totalCustomers = customers?.length || 0;
  const totalVehicles = customers?.reduce((sum, c) => sum + (c.vehicles?.length || 0), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Customers</h1>
          <p className="text-neutral-500 mt-1">Manage customers and their vehicles</p>
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
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <User className="h-4 w-4" />
            <span className="text-sm">Total Customers</span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">{totalCustomers}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Truck className="h-4 w-4" />
            <span className="text-sm">Total Vehicles</span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">{totalVehicles}</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-neutral-200 rounded-lg">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : customers?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">No customers yet</h3>
            <p className="text-sm text-neutral-500 max-w-xs mb-4">
              Add your first customer to get started managing vehicles and work orders.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={customers ?? []}
            searchKey="name"
            searchPlaceholder="Search customers..."
          />
        )}
      </div>

      {/* Create Customer Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Add New Customer</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Add a new customer to your system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <User className="h-4 w-4 text-neutral-400" />
                Company Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Logistics Inc."
                className="border-neutral-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-medium text-neutral-700">
                Contact Person
              </Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Smith"
                className="border-neutral-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-400" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0100"
                  className="border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@acme.com"
                  className="border-neutral-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingAddress" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400" />
                Billing Address
              </Label>
              <Textarea
                id="billingAddress"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="123 Industrial Way, Chicago, IL 60601"
                rows={2}
                className="border-neutral-200 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-neutral-200">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || createCustomer.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {createCustomer.isPending ? 'Creating...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
