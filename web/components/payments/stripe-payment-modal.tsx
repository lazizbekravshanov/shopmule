'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StripeProvider } from './stripe-provider';
import { useCreatePaymentIntent, invoiceKeys } from '@/lib/queries/invoices';
import { type Invoice } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface StripePaymentModalProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StripePaymentModal({
  invoice,
  open,
  onOpenChange,
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const createPaymentIntent = useCreatePaymentIntent();

  const paidAmount = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const remaining = invoice.total - paidAmount;

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen && !clientSecret) {
      try {
        const result = await createPaymentIntent.mutateAsync({
          invoiceId: invoice.id,
        });
        setClientSecret(result.data.clientSecret);
        setAmount(result.data.amount);
      } catch (error) {
        console.error('Failed to create payment intent:', error);
      }
    }
    if (!isOpen) {
      setClientSecret(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Card</DialogTitle>
          <DialogDescription>
            Total: {formatCurrency(invoice.total)} | Remaining:{' '}
            {formatCurrency(remaining)}
          </DialogDescription>
        </DialogHeader>

        {createPaymentIntent.isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {createPaymentIntent.isError && (
          <div className="flex flex-col items-center gap-2 py-8 text-destructive">
            <XCircle className="h-8 w-8" />
            <p>Failed to initialize payment. Please try again.</p>
          </div>
        )}

        {clientSecret && (
          <StripeProvider clientSecret={clientSecret}>
            <PaymentForm
              amount={amount}
              invoiceId={invoice.id}
              onSuccess={() => onOpenChange(false)}
            />
          </StripeProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PaymentFormProps {
  amount: number;
  invoiceId: string;
  onSuccess: () => void;
}

function PaymentForm({ amount, invoiceId, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
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
        return_url: `${window.location.origin}/invoices`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setPaymentStatus('error');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setPaymentStatus('success');
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-lg font-medium">Payment Successful!</p>
        <p className="text-muted-foreground">
          {formatCurrency(amount)} has been paid.
        </p>
      </div>
    );
  }

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

      <DialogFooter>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
