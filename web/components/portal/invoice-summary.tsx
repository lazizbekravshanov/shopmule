'use client';

import Link from 'next/link';
import { FileText, Calendar, Car, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';

type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

interface InvoiceSummaryProps {
  invoice: {
    id: string;
    status: PaymentStatus;
    total: number;
    paidAmount: number;
    remainingBalance: number;
    createdAt: string;
    hasPaymentLink: boolean;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year?: number | null;
      licensePlate?: string | null;
    } | null;
  };
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  UNPAID: { label: 'Unpaid', variant: 'destructive' },
  PARTIAL: { label: 'Partial', variant: 'secondary' },
  PAID: { label: 'Paid', variant: 'outline' },
};

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const config = statusConfig[invoice.status];
  const vehicleName = invoice.vehicle
    ? [invoice.vehicle.year, invoice.vehicle.make, invoice.vehicle.model]
        .filter(Boolean)
        .join(' ')
    : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Invoice #{invoice.id.slice(0, 8)}</span>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              {vehicleName && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  {vehicleName}
                </p>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {formatDate(invoice.createdAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(invoice.total)}</p>
            {invoice.status !== 'PAID' && invoice.paidAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(invoice.remainingBalance)} due
              </p>
            )}
            {invoice.status !== 'PAID' && invoice.hasPaymentLink && (
              <Link href={`/pay/${invoice.id}`} target="_blank">
                <Button variant="outline" size="sm" className="mt-2">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Pay Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
