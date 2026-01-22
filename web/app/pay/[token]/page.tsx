'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Truck,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  DollarSign,
  Wrench,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface InvoiceData {
  id: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  total: number;
  paidAmount: number;
  remainingBalance: number;
  issuedAt: string;
  shop: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  vehicle: {
    id: string;
    make?: string;
    model?: string;
    year?: number;
    plate?: string;
    vin?: string;
  } | null;
  laborLines: {
    id: string;
    description: string;
    hours: number;
    rate: number;
    total: number;
  }[];
  partLines: {
    id: string;
    description: string;
    qty: number;
    unitPrice: number;
    total: number;
  }[];
  laborTotal: number;
  partsTotal: number;
  payments: {
    id: string;
    amount: number;
    method: string;
    paidAt: string;
  }[];
}

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

export default function CustomerPaymentPage() {
  const params = useParams();
  const token = params.token as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/pay/${token}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to load invoice');
          return;
        }

        setInvoice(result.data);
      } catch {
        setError('Failed to load invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [token]);

  async function initiatePayment() {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/pay/${token}/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to initialize payment');
        return;
      }

      setClientSecret(result.data.clientSecret);
      setPaymentAmount(result.data.amount);
    } catch {
      setError('Failed to initialize payment. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-semibold">Unable to Load Invoice</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  if (invoice.status === 'PAID' || paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-semibold">
                {paymentSuccess ? 'Payment Successful!' : 'Invoice Paid'}
              </h1>
              <p className="text-muted-foreground">
                {paymentSuccess
                  ? `Thank you for your payment of ${formatCurrency(paymentAmount)}.`
                  : 'This invoice has been fully paid. Thank you for your business!'}
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Invoice #{invoice.id.slice(0, 8)}</p>
                <p>{invoice.shop.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">{invoice.shop.name}</h1>
              <p className="text-sm text-muted-foreground">
                Invoice #{invoice.id.slice(0, 8)}
              </p>
            </div>
            <Badge
              variant={
                invoice.status === 'PARTIALLY_PAID' ? 'warning' : 'destructive'
              }
            >
              {invoice.status === 'PARTIALLY_PAID' ? 'Partial' : 'Unpaid'}
            </Badge>
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
              {invoice.paidAmount > 0 && (
                <p className="text-sm opacity-75 mt-2">
                  {formatCurrency(invoice.paidAmount)} already paid
                </p>
              )}
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
            {invoice.customer && (
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{invoice.customer.name}</p>
              </div>
            )}
            {invoice.vehicle && (
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">
                  {[invoice.vehicle.year, invoice.vehicle.make, invoice.vehicle.model]
                    .filter(Boolean)
                    .join(' ')}
                </p>
                {invoice.vehicle.plate && (
                  <p className="text-sm text-muted-foreground">
                    Plate: {invoice.vehicle.plate}
                  </p>
                )}
              </div>
            )}
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
            {invoice.laborLines.length > 0 && (
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
            )}

            {/* Parts */}
            {invoice.partLines.length > 0 && (
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
            )}

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
              <div className="flex justify-between font-semibold">
                <span>Invoice Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>-{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Balance Due</span>
                    <span>{formatCurrency(invoice.remainingBalance)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-muted-foreground">
                        {payment.method} - {formatDate(payment.paidAt)}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!clientSecret ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Amount</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(invoice.remainingBalance)}
                    </span>
                  </div>
                </div>
                <Button onClick={initiatePayment} className="w-full" size="lg">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pay {formatCurrency(invoice.remainingBalance)}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe
                </p>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#0f172a',
                    },
                  },
                }}
              >
                <CheckoutForm
                  amount={paymentAmount}
                  onSuccess={() => setPaymentSuccess(true)}
                />
              </Elements>
            )}
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

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
}

function CheckoutForm({ amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border p-4">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(amount)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secure and encrypted
      </p>
    </form>
  );
}
