'use client';

import { useState, useMemo } from 'react';
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
  RefreshCw,
  DollarSign,
  FileText,
  AlertCircle,
  Bell,
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
  useSendReminder,
} from '@/lib/queries/invoices';
import { type Invoice } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoicePreviewSheet } from '@/components/invoice/invoice-preview-sheet';
import { ARAgingWidget } from '@/components/invoice/ar-aging-widget';
import { useToast } from '@/components/ui/use-toast';

const MS_PER_DAY = 86_400_000;

function invoiceAge(createdAt?: string): number {
  if (!createdAt) return 0;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / MS_PER_DAY);
}

function ageBucketKey(age: number): 'current' | 'overdue31' | 'overdue61' | 'overdue90' {
  if (age <= 30) return 'current';
  if (age <= 60) return 'overdue31';
  if (age <= 90) return 'overdue61';
  return 'overdue90';
}

function AgeBadge({ createdAt, status }: { createdAt?: string; status: Invoice['status'] }) {
  if (status === 'PAID') return <span className="text-neutral-300 text-xs">—</span>;
  const age = invoiceAge(createdAt);
  const cls =
    age <= 30 ? 'bg-neutral-100 text-neutral-500' :
    age <= 60 ? 'bg-amber-100 text-amber-700' :
    age <= 90 ? 'bg-orange-100 text-orange-700' :
               'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums ${cls}`}>
      {age}d
    </span>
  );
}

const statusOptions = [
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Paid', value: 'PAID' },
];

function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [stripePaymentOpen, setStripePaymentOpen] = useState(false);
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  const { toast } = useToast();
  const recordPayment = useRecordPayment();
  const generatePaymentLink = useGeneratePaymentLink();
  const sendReminder = useSendReminder();

  const handlePayment = () => {
    if (!amount || !method) return;
    recordPayment.mutate(
      { invoiceId: invoice.id, amount: parseFloat(amount), method },
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
      // handled via mutation state
    }
  };

  const handleCopyLink = async () => {
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReminder = () => {
    sendReminder.mutate(
      { invoiceId: invoice.id, channels: ['email', 'sms'] },
      {
        onSuccess: () => toast({ title: 'Reminder sent', description: `Payment reminder sent to ${invoice.customer?.name ?? 'customer'}` }),
        onError: () => toast({ variant: 'destructive', title: 'Failed to send reminder' }),
      }
    );
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
          <DropdownMenuItem onClick={handleGeneratePaymentLink} disabled={isPaid}>
            <Link className="mr-2 h-4 w-4" />
            Send Payment Link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSendReminder}
            disabled={isPaid || sendReminder.isPending}
          >
            <Bell className="mr-2 h-4 w-4" />
            Send Reminder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStripePaymentOpen(true)} disabled={isPaid}>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Card
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPaymentOpen(true)} disabled={isPaid}>
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
                  <Input value={paymentLink} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-2">Invoice Details:</p>
                  <p>Amount Due: <span className="font-semibold">{formatCurrency(remaining)}</span></p>
                  {invoice.customer?.name && <p>Customer: {invoice.customer.name}</p>}
                </div>
                <p className="text-xs text-muted-foreground">This link expires in 30 days.</p>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentLinkOpen(false)}>Close</Button>
            {paymentLink && (
              <Button onClick={handleCopyLink}>
                {copied ? <><Check className="mr-2 h-4 w-4" />Copied!</> : <><Send className="mr-2 h-4 w-4" />Copy & Share</>}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StripePaymentModal invoice={invoice} open={stripePaymentOpen} onOpenChange={setStripePaymentOpen} />

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
            <DialogDescription>
              Total: {formatCurrency(invoice.total)} | Remaining: {formatCurrency(remaining)}
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
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={!amount || !method}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InvoicesPage() {
  const { data: invoices, isLoading, refetch, isFetching } = useInvoices();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [activeBucket, setActiveBucket] = useState<string | null>(null);

  const handleRowClick = (row: Invoice) => {
    setSelectedInvoiceId(row.id);
    setPreviewSheetOpen(true);
  };

  // Filter by aging bucket when one is active
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    if (!activeBucket) return invoices;
    return invoices.filter((inv) => {
      if (inv.status === 'PAID') return false;
      return ageBucketKey(invoiceAge(inv.createdAt)) === activeBucket;
    });
  }, [invoices, activeBucket]);

  // Stats
  const totalInvoices = invoices?.length ?? 0;
  const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total, 0) ?? 0;
  const unpaidCount = invoices?.filter((inv) => inv.status === 'UNPAID').length ?? 0;
  const paidCount = invoices?.filter((inv) => inv.status === 'PAID').length ?? 0;

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice #" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-neutral-500">{row.original.id.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'customer',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => {
        const customer = row.original.customer;
        return customer ? (
          <div className="font-medium text-neutral-900">{customer.name}</div>
        ) : (
          <span className="text-neutral-400">—</span>
        );
      },
    },
    {
      accessorKey: 'total',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => (
        <div className="font-medium text-neutral-900">{formatCurrency(row.original.total)}</div>
      ),
    },
    {
      id: 'age',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
      cell: ({ row }) => (
        <AgeBadge createdAt={row.original.createdAt} status={row.original.status} />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={status === 'PAID' ? 'success' : status === 'PARTIAL' ? 'warning' : 'destructive'}
          >
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? (
          <span className="text-neutral-500">{formatDate(date)}</span>
        ) : (
          <span className="text-neutral-400">—</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <InvoiceActions invoice={row.original} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Invoices</h1>
          <p className="text-neutral-500 mt-1">Manage invoices and track payments</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-neutral-200"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* AR Aging Widget */}
      <ARAgingWidget activeBucket={activeBucket} onBucketClick={setActiveBucket} />

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-500">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Total Invoices</span>
            </div>
            <div className="text-2xl font-semibold text-neutral-900 mt-1">{totalInvoices}</div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Revenue</span>
            </div>
            <div className="text-2xl font-semibold text-neutral-900 mt-1">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">Paid</span>
            </div>
            <div className="text-2xl font-semibold text-emerald-600 mt-1">{paidCount}</div>
          </div>
          <div className={`bg-white border rounded-lg p-4 ${unpaidCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-neutral-200'}`}>
            <div className={`flex items-center gap-2 ${unpaidCount > 0 ? 'text-orange-600' : 'text-neutral-500'}`}>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Unpaid</span>
            </div>
            <div className={`text-2xl font-semibold mt-1 ${unpaidCount > 0 ? 'text-orange-600' : 'text-neutral-900'}`}>
              {unpaidCount}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-neutral-200 rounded-lg">
        {activeBucket && (
          <div className="px-4 pt-3 pb-0 flex items-center gap-2">
            <span className="text-xs text-neutral-500">
              Showing {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} in selected aging bucket
            </span>
            <button
              onClick={() => setActiveBucket(null)}
              className="text-xs text-[#ee7a14] hover:underline"
            >
              Show all
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredInvoices}
            searchKey="customer"
            searchPlaceholder="Search customers..."
            filterableColumns={[
              { id: 'status', title: 'Status', options: statusOptions },
            ]}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <InvoicePreviewSheet
        invoiceId={selectedInvoiceId}
        open={previewSheetOpen}
        onOpenChange={setPreviewSheetOpen}
      />
    </div>
  );
}
