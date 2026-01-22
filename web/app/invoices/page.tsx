'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  CreditCard,
  Banknote,
  Link,
  Copy,
  Check,
  Loader2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { StripePaymentModal } from '@/components/payments/stripe-payment-modal';
import {
  useInvoices,
  useRecordPayment,
  useGeneratePaymentLink,
} from '@/lib/queries/invoices';
import { type Invoice } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'Partial', value: 'PARTIALLY_PAID' },
  { label: 'Paid', value: 'PAID' },
];

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice #" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.original.total)}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === 'PAID'
              ? 'success'
              : status === 'PARTIALLY_PAID'
                ? 'warning'
                : 'destructive'
          }
        >
          {status === 'PARTIALLY_PAID' ? 'PARTIAL' : status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
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
  const [stripePaymentOpen, setStripePaymentOpen] = useState(false);
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  const recordPayment = useRecordPayment();
  const generatePaymentLink = useGeneratePaymentLink();

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

  const handleGeneratePaymentLink = async () => {
    setPaymentLinkOpen(true);
    setPaymentLink(null);
    setCopied(false);

    try {
      const result = await generatePaymentLink.mutateAsync(invoice.id);
      setPaymentLink(result.data.paymentLink);
    } catch {
      // Error handling done via mutation state
    }
  };

  const handleCopyLink = async () => {
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remaining =
    invoice.total - (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0);

  const isPaid = invoice.status === 'PAID';

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
            onClick={handleGeneratePaymentLink}
            disabled={isPaid}
          >
            <Link className="mr-2 h-4 w-4" />
            Send Payment Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setStripePaymentOpen(true)}
            disabled={isPaid}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Card
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPaymentOpen(true)}
            disabled={isPaid}
          >
            <Banknote className="mr-2 h-4 w-4" />
            Record Manual Payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Send Payment Link Dialog */}
      <Dialog open={paymentLinkOpen} onOpenChange={setPaymentLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Link</DialogTitle>
            <DialogDescription>
              Share this link with your customer to collect payment online.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {generatePaymentLink.isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : generatePaymentLink.isError ? (
              <div className="text-center py-4 text-destructive">
                Failed to generate payment link. Please try again.
              </div>
            ) : paymentLink ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={paymentLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-2">Invoice Details:</p>
                  <p>
                    Amount Due:{' '}
                    <span className="font-semibold">
                      {formatCurrency(remaining)}
                    </span>
                  </p>
                  {invoice.customer?.name && (
                    <p>Customer: {invoice.customer.name}</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  This link expires in 30 days.
                </p>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentLinkOpen(false)}>
              Close
            </Button>
            {paymentLink && (
              <Button onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Copy & Share
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StripePaymentModal
        invoice={invoice}
        open={stripePaymentOpen}
        onOpenChange={setStripePaymentOpen}
      />

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
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
                  <SelectItem value="CARD">Credit Card</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="ACH">Bank Transfer</SelectItem>
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
