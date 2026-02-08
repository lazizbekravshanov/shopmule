'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortalData } from '../layout';
import { InvoiceSummary } from '@/components/portal';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'unpaid' | 'paid';

export default function InvoicesPage() {
  const { invoices } = usePortalData();

  const [filter, setFilter] = useState<Filter>('all');

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'unpaid') return inv.status !== 'PAID';
    if (filter === 'paid') return inv.status === 'PAID';
    return true;
  });

  const unpaidCount = invoices.filter((inv) => inv.status !== 'PAID').length;
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={cn(filter === 'all' && 'bg-[#ee7a14] hover:bg-[#d96a0a]')}
        >
          All ({invoices.length})
        </Button>
        <Button
          variant={filter === 'unpaid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unpaid')}
          className={cn(filter === 'unpaid' && 'bg-[#ee7a14] hover:bg-[#d96a0a]')}
        >
          Unpaid ({unpaidCount})
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('paid')}
          className={cn(filter === 'paid' && 'bg-[#ee7a14] hover:bg-[#d96a0a]')}
        >
          Paid ({paidCount})
        </Button>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No invoices</p>
          <p className="text-sm">
            {filter === 'unpaid'
              ? 'No unpaid invoices. You\'re all caught up!'
              : filter === 'paid'
              ? 'No paid invoices yet.'
              : 'No invoices on file.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <InvoiceSummary key={inv.id} invoice={inv} />
          ))}
        </div>
      )}
    </div>
  );
}
