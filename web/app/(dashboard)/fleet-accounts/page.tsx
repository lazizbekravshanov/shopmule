'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Search,
  Car,
  TrendingUp,
  ChevronRight,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface FleetAccount {
  id: string;
  companyName: string;
  accountNumber: string;
  status: string;
  paymentTerms: string;
  discountRatePercent: number;
  creditLimit: number;
  currentBalance: number;
  customerCount: number;
  vehicleCount: number;
  activeJobCount: number;
}

const statusLabels: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  ON_HOLD:   { label: 'On Hold',   cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  SUSPENDED: { label: 'Suspended', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  CLOSED:    { label: 'Closed',    cls: 'bg-neutral-100 text-neutral-500' },
};

const PAYMENT_TERMS = [
  { value: 'NET_30',  label: 'Net 30' },
  { value: 'NET_60',  label: 'Net 60' },
  { value: 'NET_90',  label: 'Net 90' },
  { value: 'PREPAID', label: 'Prepaid' },
  { value: 'COD',     label: 'COD' },
];

function AddFleetAccountModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [companyName, setCompanyName]               = useState('');
  const [paymentTerms, setPaymentTerms]             = useState('NET_30');
  const [discountRatePercent, setDiscountRatePercent] = useState('');
  const [creditLimit, setCreditLimit]               = useState('');
  const [notes, setNotes]                           = useState('');

  const reset = () => {
    setCompanyName(''); setPaymentTerms('NET_30');
    setDiscountRatePercent(''); setCreditLimit(''); setNotes('');
  };

  const mutation = useMutation({
    mutationFn: async (data: object) => {
      const res = await fetch('/api/fleet-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed'); }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fleet-accounts'] });
      toast({ title: 'Fleet account created', description: `${data.account.companyName} — ${data.account.accountNumber}` });
      onOpenChange(false);
      reset();
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    mutation.mutate({ companyName, paymentTerms, discountRatePercent, creditLimit, notes });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[480px] border-neutral-200 dark:border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Fleet Account</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Create a commercial fleet account for a business customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input
              placeholder="Acme Trucking Co."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border-neutral-200 dark:border-neutral-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger className="border-neutral-200 dark:border-neutral-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discount Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="0"
                value={discountRatePercent}
                onChange={(e) => setDiscountRatePercent(e.target.value)}
                className="border-neutral-200 dark:border-neutral-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Credit Limit ($)</Label>
            <Input
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="border-neutral-200 dark:border-neutral-600"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any notes about this account..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="border-neutral-200 dark:border-neutral-600 resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="border-neutral-200 dark:border-neutral-600">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!companyName.trim() || mutation.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FleetAccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: accounts, isLoading, isError, refetch, isFetching } = useQuery<FleetAccount[]>({
    queryKey: ['fleet-accounts'],
    queryFn: async () => {
      const res = await fetch('/api/fleet-accounts');
      if (!res.ok) throw new Error('Failed to fetch fleet accounts');
      return res.json();
    },
    staleTime: 60_000,
  });

  const filtered = (accounts ?? []).filter((a) =>
    a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVehicles = (accounts ?? []).reduce((s, a) => s + a.vehicleCount, 0);
  const totalBalance  = (accounts ?? []).reduce((s, a) => s + a.currentBalance, 0);
  const activeCount   = (accounts ?? []).filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-8 pb-8">
      <AddFleetAccountModal open={createOpen} onOpenChange={setCreateOpen} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">Fleet Accounts</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage B2B and commercial fleet customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} className="border-neutral-200">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Fleet Account
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{activeCount}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Accounts</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{totalVehicles}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Vehicles</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(totalBalance)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Outstanding Balance</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Search fleet accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-neutral-200 dark:border-neutral-700"
        />
      </div>

      {/* Accounts List */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 p-6">
                <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="hidden md:flex gap-8">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Failed to load fleet accounts</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {searchQuery ? 'No matching accounts' : 'No fleet accounts yet'}
            </h3>
            <p className="text-sm text-neutral-500 max-w-xs mb-4">
              {searchQuery ? 'Try a different search term.' : 'Add your first commercial fleet customer to get started.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateOpen(true)} className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Fleet Account
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {filtered.map((account) => {
              const s = statusLabels[account.status] ?? { label: account.status, cls: 'bg-neutral-100 text-neutral-500' };
              return (
                <div
                  key={account.id}
                  className="flex items-center gap-6 p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{account.companyName}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.cls)}>{s.label}</span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {account.accountNumber} &bull; {account.paymentTerms.replace('_', ' ')}
                      {account.discountRatePercent > 0 && ` · ${account.discountRatePercent}% discount`}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{account.vehicleCount}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Vehicles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{account.activeJobCount}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Active Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{formatCurrency(account.currentBalance)}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Balance</p>
                    </div>
                    {account.discountRatePercent > 0 && (
                      <div className="text-center">
                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{account.discountRatePercent}%</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Discount</p>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
