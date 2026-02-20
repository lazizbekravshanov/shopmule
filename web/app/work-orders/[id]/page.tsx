'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, User, FileText, DollarSign, Wrench, Package, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { LaborTimerSection } from '@/components/work-order/labor-timer-section';
import { InspectionPanel } from '@/components/work-order/inspection-panel';
import { DeferredWorkPanel } from '@/components/work-order/deferred-work-panel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useWorkOrder, useUpdateWorkOrderStatus, useSetPartsStatus } from '@/lib/queries/work-orders';
import type { PartsStatus } from '@/lib/api';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Parts Status Toggle ────────────────────────────────────────────────────

const PARTS_OPTIONS: { value: PartsStatus | null; label: string; cls: string }[] = [
  { value: null,       label: 'No Issue',    cls: 'border-neutral-200 text-neutral-500 bg-white hover:bg-neutral-50' },
  { value: 'WAITING',  label: 'Waiting',     cls: 'border-amber-300  text-amber-700  bg-amber-50  hover:bg-amber-100' },
  { value: 'ORDERED',  label: 'Ordered',     cls: 'border-blue-300   text-blue-700   bg-blue-50   hover:bg-blue-100' },
  { value: 'IN_STOCK', label: 'In Stock',    cls: 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' },
];

function PartsStatusToggle({ workOrderId, current }: { workOrderId: string; current: PartsStatus | null | undefined }) {
  const setPartsStatus = useSetPartsStatus();
  const { toast } = useToast();

  const handleClick = (value: PartsStatus | null) => {
    if (value === (current ?? null)) return;
    setPartsStatus.mutate(
      { workOrderId, partsStatus: value },
      {
        onSuccess: () => toast({ title: 'Parts status updated' }),
        onError: () => toast({ variant: 'destructive', title: 'Failed to update parts status' }),
      }
    );
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PARTS_OPTIONS.map((opt) => {
        const isActive = (current ?? null) === opt.value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => handleClick(opt.value)}
            disabled={setPartsStatus.isPending}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${opt.cls} ${
              isActive ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70 hover:opacity-100'
            }`}
          >
            {setPartsStatus.isPending && isActive
              ? <Loader2 className="inline h-2.5 w-2.5 animate-spin mr-1" />
              : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  DIAGNOSED: { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200' },
  APPROVED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  IN_PROGRESS: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const statusOptions = [
  { label: 'Diagnosed', value: 'DIAGNOSED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const paymentMethods = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Check', value: 'CHECK' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Other', value: 'OTHER' },
];

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { data: workOrder, isLoading, refetch } = useWorkOrder(id);
  const updateStatus = useUpdateWorkOrderStatus();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);

  const handleStatusChange = (status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast({ title: 'Status updated', description: `Work order status changed to ${status}` });
          refetch();
        },
        onError: (error) => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' });
        },
      }
    );
  };

  const handleCreateInvoice = async () => {
    setIsCreatingInvoice(true);
    try {
      const newInvoice = await api.invoices.create(id);
      setInvoice(newInvoice);
      toast({ title: 'Invoice created', description: 'Invoice has been created successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to create invoice' });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!invoice || !paymentAmount) return;

    setIsRecordingPayment(true);
    try {
      await api.invoices.pay(invoice.id, {
        method: paymentMethod,
        amount: parseFloat(paymentAmount),
      });
      toast({ title: 'Payment recorded', description: 'Payment has been recorded successfully' });
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      // Refresh invoice data
      const updatedInvoice = await fetch(`/api/invoices/${invoice.id}`).then(r => r.json());
      setInvoice(updatedInvoice);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to record payment' });
    } finally {
      setIsRecordingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Work order not found</p>
        <Link href="/work-orders">
          <Button variant="outline" className="mt-4">Back to Work Orders</Button>
        </Link>
      </div>
    );
  }

  const colors = statusColors[workOrder.status] || statusColors.DIAGNOSED;

  // Calculate totals
  const laborTotal = workOrder.laborEntries?.reduce((sum, l) => sum + (l.hours * l.rate), 0) || 0;
  const partsTotal = workOrder.partsUsed?.reduce((sum, p) => sum + (p.quantity * p.unitPrice * (1 + (p.markupPct || 0.15))), 0) || 0;
  const subtotal = laborTotal + partsTotal;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/work-orders">
            <Button variant="ghost" size="icon" className="hover:bg-neutral-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Work Order
            </h1>
            <p className="text-neutral-500 font-mono text-sm">{workOrder.id.slice(0, 12)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={workOrder.status} onValueChange={handleStatusChange}>
            <SelectTrigger className={`w-40 ${colors.bg} ${colors.text} ${colors.border}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Vehicle & Customer Info */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm font-medium">Vehicle</span>
                </div>
                {workOrder.vehicle ? (
                  <div>
                    <div className="text-lg font-medium text-neutral-900">
                      {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                    </div>
                    {workOrder.vehicle.vin && (
                      <div className="text-sm text-neutral-500 font-mono">VIN: {workOrder.vehicle.vin}</div>
                    )}
                    {workOrder.vehicle.licensePlate && (
                      <div className="text-sm text-neutral-500">Plate: {workOrder.vehicle.licensePlate}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400">No vehicle</span>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Customer</span>
                </div>
                {workOrder.vehicle?.customer ? (
                  <div>
                    <div className="text-lg font-medium text-neutral-900">
                      {workOrder.vehicle.customer.name}
                    </div>
                    {workOrder.vehicle.customer.phone && (
                      <div className="text-sm text-neutral-500">{workOrder.vehicle.customer.phone}</div>
                    )}
                    {workOrder.vehicle.customer.email && (
                      <div className="text-sm text-neutral-500">{workOrder.vehicle.customer.email}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400">No customer</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center gap-2 text-neutral-500 mb-4">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Description</span>
            </div>
            <p className="text-neutral-700">{workOrder.description}</p>
            {workOrder.notes && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="text-sm font-medium text-neutral-500 mb-2">Notes</div>
                <p className="text-neutral-600 text-sm">{workOrder.notes}</p>
              </div>
            )}
          </div>

          {/* Deferred repairs from previous visits */}
          <DeferredWorkPanel
            vehicleId={workOrder.vehicleId}
            workOrderId={id}
            defaultLaborRate={workOrder.laborRate ?? 125}
          />

          {/* Vehicle Inspection / VHR */}
          <InspectionPanel
            workOrderId={id}
            checklistRaw={workOrder.checklist}
            defaultLaborRate={workOrder.laborRate ?? 125}
          />

          {/* Labor Entries */}
          <LaborTimerSection
            workOrderId={id}
            laborEntries={workOrder.laborEntries ?? []}
            defaultRate={workOrder.laborRate ?? 125}
          />

          {/* Parts */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-neutral-500">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Parts</span>
              </div>
              <PartsStatusToggle workOrderId={id} current={workOrder.partsStatus} />
            </div>
            {workOrder.partsUsed && workOrder.partsUsed.length > 0 ? (
              <div className="space-y-3">
                {workOrder.partsUsed.map((part, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <div>
                      <div className="font-medium text-neutral-900">{part.part?.name || 'Unknown Part'}</div>
                      <div className="text-sm text-neutral-500">SKU: {part.part?.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${(part.quantity * part.unitPrice * (1 + (part.markupPct || 0.15))).toFixed(2)}</div>
                      <div className="text-sm text-neutral-500">Qty: {part.quantity} @ ${part.unitPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 text-sm">No parts added yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center gap-2 text-neutral-500 mb-4">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Summary</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Labor</span>
                <span className="font-medium">${laborTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Parts</span>
                <span className="font-medium">${partsTotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-neutral-900">Subtotal</span>
                  <span className="font-semibold text-lg">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice & Payment Card */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center gap-2 text-neutral-500 mb-4">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Invoice & Payment</span>
            </div>

            {!invoice ? (
              <div className="space-y-4">
                <p className="text-sm text-neutral-500">No invoice created yet.</p>
                <Button
                  onClick={handleCreateInvoice}
                  disabled={isCreatingInvoice || subtotal === 0}
                  className="w-full bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
                >
                  {isCreatingInvoice ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-neutral-50 rounded-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Invoice Total</span>
                    <span className="font-medium">${invoice.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Paid</span>
                    <span className="font-medium text-emerald-600">
                      ${(invoice.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-neutral-200">
                    <span className="font-medium">Balance</span>
                    <span className="font-semibold">
                      ${(invoice.total - (invoice.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {invoice.status !== 'PAID' ? (
                  <Button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Record Payment
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 py-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Paid in Full</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Created</span>
                <span className="text-neutral-700">{workOrder.createdAt ? formatDate(workOrder.createdAt) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Updated</span>
                <span className="text-neutral-700">{workOrder.updatedAt ? formatDate(workOrder.updatedAt) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[400px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Record Payment</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Enter payment details for this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="border-neutral-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="border-neutral-200"
              />
              {invoice && (
                <p className="text-xs text-neutral-500">
                  Balance due: ${(invoice.total - (invoice.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0)).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={isRecordingPayment || !paymentAmount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isRecordingPayment ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
