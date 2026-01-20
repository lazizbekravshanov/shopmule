'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useInvoices, useRecordPayment } from '@/lib/queries/invoices';
import { type Invoice } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Paid', value: 'PAID' },
];

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice #" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const customer = row.original.customer;
      return customer ? (
        <div className="font-medium">{customer.name}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: 'total',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.original.total)}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === 'PAID'
              ? 'success'
              : status === 'PARTIAL'
              ? 'warning'
              : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? formatDate(date) : '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <InvoiceActions invoice={row.original} />,
  },
];

function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const recordPayment = useRecordPayment();

  const handlePayment = () => {
    if (!amount || !method) return;
    recordPayment.mutate(
      {
        invoiceId: invoice.id,
        amount: parseFloat(amount),
        method,
      },
      {
        onSuccess: () => {
          setPaymentOpen(false);
          setAmount('');
          setMethod('');
        },
      }
    );
  };

  const remaining = invoice.total - (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0);

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
          <DropdownMenuItem
            onClick={() => setPaymentOpen(true)}
            disabled={invoice.status === 'PAID'}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Total: {formatCurrency(invoice.total)} | Remaining:{' '}
              {formatCurrency(remaining)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder={remaining.toFixed(2)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={!amount || !method}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Manage invoices and track payments
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices ?? []}
          searchKey="customer"
          searchPlaceholder="Search customers..."
          filterableColumns={[
            {
              id: 'status',
              title: 'Status',
              options: statusOptions,
            },
          ]}
        />
      )}
    </div>
  );
}
