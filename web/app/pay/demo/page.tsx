'use client';

import { useState } from 'react';
import {
  Truck,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  DollarSign,
  Wrench,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Demo data to showcase the payment page design
const demoInvoice = {
  id: 'inv_demo12345678',
  status: 'UNPAID' as const,
  total: 1245.5,
  paidAmount: 0,
  remainingBalance: 1245.5,
  issuedAt: new Date().toISOString(),
  shop: {
    id: 'shop_1',
    name: 'Big Rig Truck Repair',
  },
  customer: {
    id: 'cust_1',
    name: 'ABC Trucking LLC',
    email: 'contact@abctrucking.com',
    phone: '(555) 123-4567',
  },
  vehicle: {
    id: 'veh_1',
    make: 'Kenworth',
    model: 'T680',
    year: 2021,
    plate: 'TRK-1234',
    vin: '1XKYD49X1MJ123456',
  },
  laborLines: [
    {
      id: 'labor_1',
      description: 'Brake System Inspection & Repair',
      hours: 4,
      rate: 125,
      total: 500,
    },
    {
      id: 'labor_2',
      description: 'Air System Check',
      hours: 1.5,
      rate: 125,
      total: 187.5,
    },
  ],
  partLines: [
    {
      id: 'part_1',
      description: 'Brake Pads - Front Axle (Set)',
      qty: 1,
      unitPrice: 320,
      total: 320,
    },
    {
      id: 'part_2',
      description: 'Brake Drums - Rear (Pair)',
      qty: 1,
      unitPrice: 238,
      total: 238,
    },
  ],
  laborTotal: 687.5,
  partsTotal: 558,
  payments: [],
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export default function DemoPaymentPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const invoice = demoInvoice;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-semibold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Thank you for your payment of {formatCurrency(invoice.total)}.
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Invoice #{invoice.id.slice(0, 8)}</p>
                <p>{invoice.shop.name}</p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowSuccess(false)}
              >
                Back to Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
        This is a demo preview. In production, customers access this via a secure payment link.
      </div>

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">{invoice.shop.name}</h1>
              <p className="text-sm text-muted-foreground">
                Invoice #{invoice.id.slice(4, 12)}
              </p>
            </div>
            <Badge variant="destructive">Unpaid</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Amount Due Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm opacity-90">Amount Due</p>
              <p className="text-4xl font-bold mt-1">
                {formatCurrency(invoice.remainingBalance)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Vehicle Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{invoice.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model}
              </p>
              <p className="text-sm text-muted-foreground">
                Plate: {invoice.vehicle.plate}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(invoice.issuedAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Service Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Labor */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Labor</span>
              </div>
              <div className="space-y-2 pl-6">
                {invoice.laborLines.map((line) => (
                  <div key={line.id} className="flex justify-between text-sm">
                    <div>
                      <p>{line.description}</p>
                      <p className="text-muted-foreground">
                        {line.hours} hrs @ {formatCurrency(line.rate)}/hr
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(line.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Parts */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Parts</span>
              </div>
              <div className="space-y-2 pl-6">
                {invoice.partLines.map((line) => (
                  <div key={line.id} className="flex justify-between text-sm">
                    <div>
                      <p>{line.description}</p>
                      <p className="text-muted-foreground">
                        {line.qty} x {formatCurrency(line.unitPrice)}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(line.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Labor Total</span>
                <span>{formatCurrency(invoice.laborTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Parts Total</span>
                <span>{formatCurrency(invoice.partsTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Due</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Amount</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(invoice.remainingBalance)}
                  </span>
                </div>
              </div>

              {/* Demo payment form placeholder */}
              <div className="border rounded-md p-4 space-y-3">
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-100 rounded flex-1 animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded w-20 animate-pulse" />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Stripe payment form loads here in production
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowSuccess(true)}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Pay {formatCurrency(invoice.remainingBalance)} (Demo)
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by Stripe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>Questions about this invoice?</p>
          <p>Contact {invoice.shop.name}</p>
        </div>
      </main>
    </div>
  );
}
