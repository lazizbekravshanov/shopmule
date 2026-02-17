'use client';

import { use } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/dashboard/back-button';
import { useInvoice } from '@/lib/queries/invoices';
import { InvoiceCustomizer } from '@/components/invoice/invoice-customizer';

export default function InvoiceDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { data: invoice, isLoading } = useInvoice(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton href="/invoices" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Invoice Details
          </h1>
          <p className="text-neutral-500 mt-1">
            Customize line items, tax, and download PDF
          </p>
        </div>
      </div>
      <InvoiceCustomizer invoice={invoice} />
    </div>
  );
}
