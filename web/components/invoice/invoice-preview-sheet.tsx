'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  Printer,
  ArrowRight,
  User,
  Car,
  FileText,
  Wrench,
  Package,
} from 'lucide-react';
import { useInvoice } from '@/lib/queries/invoices';
import { formatCurrency } from '@/lib/utils';
import {
  generateInvoicePDF,
  invoiceToBlob,
  downloadInvoice,
  type InvoiceData,
} from '@/lib/services/pdf-generator';

interface InvoicePreviewSheetProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildInvoiceData(invoice: any): InvoiceData {
  const wo = invoice.workOrder;
  const customer = invoice.customer;
  const vehicle = wo?.vehicle;

  return {
    invoiceNumber: `INV-${invoice.id.slice(-6).toUpperCase()}`,
    invoiceDate: new Date(invoice.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    dueDate: new Date(
      new Date(invoice.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    shopName: 'ShopMule Auto',
    shopAddress: '123 Main Street, City, ST 12345',
    shopPhone: '(555) 123-4567',
    shopEmail: 'service@shopmule.com',
    customerName: customer?.name || 'Unknown Customer',
    customerAddress: customer?.billingAddress,
    customerPhone: customer?.phone,
    customerEmail: customer?.email,
    vehicleInfo: vehicle
      ? `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim()
      : 'N/A',
    vehicleVin: vehicle?.vin,
    workOrderId: wo ? `WO-${wo.id.slice(-6).toUpperCase()}` : 'N/A',
    workOrderDescription: wo?.description || '',
    laborItems: (wo?.laborEntries || []).map((l: any) => ({
      description: l.note || `Labor - ${l.employee?.name || 'Technician'}`,
      hours: l.hours,
      rate: l.rate,
      total: l.hours * l.rate,
    })),
    partsItems: (wo?.partsUsed || []).map((p: any) => ({
      name: p.part?.name || 'Unknown Part',
      sku: p.part?.sku || '-',
      quantity: p.quantity,
      unitPrice: p.unitPrice * (1 + (p.markupPct || 0)),
      total: p.quantity * p.unitPrice * (1 + (p.markupPct || 0)),
    })),
    subtotalLabor: invoice.subtotalLabor,
    subtotalParts: invoice.subtotalParts,
    tax: invoice.tax,
    taxRate: (invoice.subtotalLabor + invoice.subtotalParts) > 0
      ? invoice.tax / (invoice.subtotalLabor + invoice.subtotalParts)
      : 0.0825,
    discount: invoice.discount,
    total: invoice.total,
    payments: (invoice.payments || []).map((p: any) => ({
      date: new Date(p.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      method: p.method,
      amount: p.amount,
    })),
    amountPaid: (invoice.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0),
    balanceDue:
      invoice.total -
      (invoice.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0),
    notes: wo?.notes,
  };
}

export function InvoicePreviewSheet({ invoiceId, open, onOpenChange }: InvoicePreviewSheetProps) {
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId || '');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const invoiceData = useMemo(() => {
    if (!invoice) return null;
    return buildInvoiceData(invoice);
  }, [invoice]);

  useEffect(() => {
    if (!invoiceData) {
      setPdfUrl(null);
      return;
    }
    try {
      const doc = generateInvoicePDF(invoiceData);
      const blob = invoiceToBlob(doc);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } catch {
      setPdfUrl(null);
    }
  }, [invoiceData]);

  const handleDownload = () => {
    if (!invoiceData) return;
    const doc = generateInvoicePDF(invoiceData);
    downloadInvoice(doc, `${invoiceData.invoiceNumber}.pdf`);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl);
    printWindow?.addEventListener('load', () => printWindow.print());
  };

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    UNPAID: 'bg-red-100 text-red-700',
    DRAFT: 'bg-neutral-100 text-neutral-700',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full overflow-y-auto p-0">
        {isLoading || !invoice ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-4">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <SheetTitle className="text-xl font-semibold text-neutral-900">
                    INV-{invoice.id.slice(-6).toUpperCase()}
                  </SheetTitle>
                  <Badge className={statusColors[invoice.status] || 'bg-neutral-100 text-neutral-700'}>
                    {invoice.status}
                  </Badge>
                </div>
                <SheetDescription className="text-neutral-500">
                  {invoice.customer?.name || 'Unknown Customer'}
                </SheetDescription>
              </SheetHeader>

              {/* Quick info */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{invoice.customer?.name}</span>
                </div>
                {invoice.workOrder?.vehicle && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      {invoice.workOrder.vehicle.year} {invoice.workOrder.vehicle.make} {invoice.workOrder.vehicle.model}
                    </span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500">Total</p>
                  <p className="text-lg font-semibold text-neutral-900">{formatCurrency(invoice.total)}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500">Paid</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(invoiceData?.amountPaid || 0)}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500">Balance</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatCurrency(invoiceData?.balanceDue || 0)}
                  </p>
                </div>
              </div>

              {/* Line item summary */}
              <div className="mt-4 space-y-2">
                {(invoice.workOrder?.laborEntries?.length ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-neutral-600">
                      <Wrench className="w-3.5 h-3.5 text-neutral-400" />
                      Labor ({invoice.workOrder!.laborEntries!.length} item{invoice.workOrder!.laborEntries!.length !== 1 ? 's' : ''})
                    </span>
                    <span className="font-medium text-neutral-900">{formatCurrency(invoice.subtotalLabor)}</span>
                  </div>
                )}
                {(invoice.workOrder?.partsUsed?.length ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-neutral-600">
                      <Package className="w-3.5 h-3.5 text-neutral-400" />
                      Parts ({invoice.workOrder!.partsUsed!.length} item{invoice.workOrder!.partsUsed!.length !== 1 ? 's' : ''})
                    </span>
                    <span className="font-medium text-neutral-900">{formatCurrency(invoice.subtotalParts)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* PDF Preview */}
            <div className="p-6 pt-4">
              <p className="text-sm font-medium text-neutral-700 mb-3">PDF Preview</p>
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-[400px] rounded-xl border border-neutral-200"
                  title="Invoice PDF Preview"
                />
              ) : (
                <div className="w-full h-[400px] rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                  <p className="text-sm text-neutral-400">Unable to generate preview</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-[#ee7a14] hover:bg-[#d96a0a] text-white rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="rounded-xl border-neutral-200"
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/invoices/${invoice.id}`);
                  onOpenChange(false);
                }}
                className="w-full rounded-xl border-neutral-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Full Details & Customize
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { buildInvoiceData };
