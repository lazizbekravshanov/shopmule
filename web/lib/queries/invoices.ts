import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Invoice, type CreatePaymentIntentResponse } from '@/lib/api';

export const agingKeys = {
  all: ['invoices', 'aging'] as const,
};

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: string) => [...invoiceKeys.lists(), { filters }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: () => api.invoices.list(),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => api.invoices.get(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workOrderId: string) => api.invoices.create(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      method,
      amount,
    }: {
      invoiceId: string;
      method: string;
      amount: number;
    }) => api.invoices.pay(invoiceId, { method, amount }),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: ({
      invoiceId,
      amount,
    }: {
      invoiceId: string;
      amount?: number;
    }) => api.invoices.createPaymentIntent(invoiceId, amount),
  });
}

export function useGeneratePaymentLink() {
  return useMutation({
    mutationFn: (invoiceId: string) => api.invoices.generatePaymentLink(invoiceId),
  });
}

export function useInvoiceAging() {
  return useQuery({
    queryKey: agingKeys.all,
    queryFn: () => api.invoices.aging(),
    staleTime: 60_000,
  });
}

export function useSendReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, channels }: { invoiceId: string; channels?: ('email' | 'sms')[] }) =>
      api.invoices.sendReminder(invoiceId, channels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
