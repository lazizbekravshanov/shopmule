'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  useEmployeePayroll,
  useDeductions,
  useCreateDeduction,
  useUpdateDeduction,
  useDeleteDeduction,
  useLoans,
  useCreateLoan,
  useUpdateLoan,
} from '@/lib/queries/payroll';
import { formatCurrency } from '@/lib/utils';

type Period = 'week' | 'month' | 'quarter' | 'year';

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EmployeePayrollDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('month');
  const { data, isLoading } = useEmployeePayroll(employeeId, period);
  const { data: deductions } = useDeductions(employeeId);
  const { data: loans } = useLoans(employeeId);

  const createDeduction = useCreateDeduction();
  const updateDeduction = useUpdateDeduction();
  const deleteDeduction = useDeleteDeduction();
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();

  // Deduction dialog state
  const [dedOpen, setDedOpen] = useState(false);
  const [editDedId, setEditDedId] = useState<string | null>(null);
  const [dedForm, setDedForm] = useState({
    type: 'TAX_FEDERAL',
    description: '',
    amount: '',
    percentage: '',
    isRecurring: true,
    isActive: true,
  });

  // Loan dialog state
  const [loanOpen, setLoanOpen] = useState(false);
  const [loanForm, setLoanForm] = useState({
    description: '',
    originalAmount: '',
    remainingBalance: '',
    monthlyPayment: '',
    issuedDate: '',
    notes: '',
  });

  const resetDedForm = () => {
    setDedForm({ type: 'TAX_FEDERAL', description: '', amount: '', percentage: '', isRecurring: true, isActive: true });
    setEditDedId(null);
  };

  const handleAddDeduction = () => {
    resetDedForm();
    setDedOpen(true);
  };

  const handleEditDeduction = (d: any) => {
    setEditDedId(d.id);
    setDedForm({
      type: d.type,
      description: d.description,
      amount: String(d.amount),
      percentage: d.percentage ? String(d.percentage) : '',
      isRecurring: d.isRecurring,
      isActive: d.isActive,
    });
    setDedOpen(true);
  };

  const handleSaveDeduction = () => {
    const payload = {
      type: dedForm.type,
      description: dedForm.description,
      amount: parseFloat(dedForm.amount) || 0,
      percentage: dedForm.percentage ? parseFloat(dedForm.percentage) : null,
      isRecurring: dedForm.isRecurring,
      isActive: dedForm.isActive,
    };

    if (editDedId) {
      updateDeduction.mutate(
        { employeeId, deductionId: editDedId, data: payload as any },
        { onSuccess: () => { setDedOpen(false); resetDedForm(); } }
      );
    } else {
      createDeduction.mutate(
        { employeeId, data: payload as any },
        { onSuccess: () => { setDedOpen(false); resetDedForm(); } }
      );
    }
  };

  const handleDeleteDeduction = (dedId: string) => {
    deleteDeduction.mutate({ employeeId, deductionId: dedId });
  };

  const handleAddLoan = () => {
    setLoanForm({ description: '', originalAmount: '', remainingBalance: '', monthlyPayment: '', issuedDate: '', notes: '' });
    setLoanOpen(true);
  };

  const handleSaveLoan = () => {
    const amt = parseFloat(loanForm.originalAmount) || 0;
    createLoan.mutate(
      {
        employeeId,
        data: {
          description: loanForm.description,
          originalAmount: amt,
          remainingBalance: parseFloat(loanForm.remainingBalance) || amt,
          monthlyPayment: parseFloat(loanForm.monthlyPayment) || 0,
          issuedDate: loanForm.issuedDate || new Date().toISOString(),
          isActive: true,
          notes: loanForm.notes || null,
        } as any,
      },
      { onSuccess: () => setLoanOpen(false) }
    );
  };

  const handleRecordPayment = (loan: any) => {
    const newBalance = Math.max(0, loan.remainingBalance - loan.monthlyPayment);
    updateLoan.mutate({
      employeeId,
      loanId: loan.id,
      data: {
        remainingBalance: newBalance,
        isActive: newBalance > 0,
      } as any,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900">Employee not found</h3>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/payroll')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payroll
        </Button>
      </div>
    );
  }

  const emp = data.employee;
  const pay = data.pay;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/payroll')}
          className="text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payroll
        </Button>
      </div>

      {/* Employee Info */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{emp.name}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {formatRole(emp.role)} &middot; {emp.payType.replace('_', ' ')} &middot; ${emp.payRate}/{emp.payType === 'SALARY' ? 'yr' : emp.payType === 'HOURLY' ? 'hr' : 'period'}
          {emp.overtimeRate && <span className="text-neutral-400"> &middot; OT: ${emp.overtimeRate}/hr</span>}
        </p>

        {/* Period selector */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1 w-fit mt-4">
          {(['week', 'month', 'quarter', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <TabsTrigger value="summary">Pay Summary</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="loans">Loans &amp; Advances</TabsTrigger>
        </TabsList>

        {/* Pay Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Gross Pay</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(pay.grossPay)}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Regular: {formatCurrency(pay.regularPay)} + OT: {formatCurrency(pay.overtimePay)}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Deductions</span>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(pay.totalDeductions + pay.loanRepayments)}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Tax/Ins: {formatCurrency(pay.totalDeductions)} + Loans: {formatCurrency(pay.loanRepayments)}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Net Pay</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(pay.netPay)}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {data.regularHours.toFixed(1)}h regular + {data.overtimeHours.toFixed(1)}h OT
              </p>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Daily Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="text-left px-4 py-3 font-medium text-neutral-500">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-500">Clock In</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-500">Clock Out</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-500">Regular Hrs</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-500">OT Hrs</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-500">Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
                  {data.dailyBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                        No clock events for this period
                      </td>
                    </tr>
                  ) : (
                    data.dailyBreakdown.map((day) => (
                      <tr key={day.date} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                        <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">
                          {new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                          {day.clockIn ? new Date(day.clockIn).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                          {day.clockOut ? new Date(day.clockOut).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-neutral-700 dark:text-neutral-300">
                          {day.regularHours.toFixed(1)}h
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {day.overtimeHours > 0 ? (
                            <span className="text-amber-600">{day.overtimeHours.toFixed(1)}h</span>
                          ) : (
                            <span className="text-neutral-400">0.0h</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(day.pay)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deduction Breakdown */}
          {data.deductionBreakdown.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Pay Deduction Breakdown</h3>
              <div className="space-y-2">
                {data.deductionBreakdown.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
                    <div>
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">{d.description}</span>
                      <span className="ml-2 text-xs text-neutral-400">{d.type.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      -{formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Deductions Tab */}
        <TabsContent value="deductions" className="space-y-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Deductions</h3>
              <Button onClick={handleAddDeduction} className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Deduction
              </Button>
            </div>

            {(deductions ?? []).length === 0 ? (
              <p className="text-neutral-400 text-sm text-center py-8">No deductions configured</p>
            ) : (
              <div className="space-y-3">
                {(deductions ?? []).map((d) => (
                  <div
                    key={d.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      d.isActive ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-100 dark:border-neutral-800 opacity-60'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{d.description}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                        <span>{d.type.replace(/_/g, ' ')}</span>
                        {d.percentage ? (
                          <span>&middot; {d.percentage}% of gross</span>
                        ) : (
                          <span>&middot; {formatCurrency(d.amount)} flat</span>
                        )}
                        {d.isRecurring && <span>&middot; Recurring</span>}
                        {!d.isActive && <span className="text-red-400">&middot; Inactive</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditDeduction(d)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeduction(d.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Loans &amp; Advances</h3>
              <Button onClick={handleAddLoan} className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Loan
              </Button>
            </div>

            {(loans ?? []).length === 0 ? (
              <p className="text-neutral-400 text-sm text-center py-8">No active loans or advances</p>
            ) : (
              <div className="space-y-3">
                {(loans ?? []).map((loan) => (
                  <div
                    key={loan.id}
                    className={`p-4 border rounded-lg ${
                      loan.isActive ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-100 dark:border-neutral-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{loan.description}</p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span>Original: {formatCurrency(loan.originalAmount)}</span>
                          <span>Monthly: {formatCurrency(loan.monthlyPayment)}</span>
                          <span>Issued: {new Date(loan.issuedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(loan.remainingBalance)}
                        </p>
                        <p className="text-xs text-neutral-400">remaining</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 w-full h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ee7a14] rounded-full transition-all"
                        style={{
                          width: `${Math.round(((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
                      <span>{Math.round(((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100)}% paid off</span>
                      {loan.isActive && loan.remainingBalance > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleRecordPayment(loan)}
                          disabled={updateLoan.isPending}
                        >
                          Record Payment ({formatCurrency(Math.min(loan.monthlyPayment, loan.remainingBalance))})
                        </Button>
                      )}
                    </div>
                    {loan.notes && (
                      <p className="text-xs text-neutral-400 mt-2">{loan.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Deduction Dialog */}
      <Dialog open={dedOpen} onOpenChange={setDedOpen}>
        <DialogContent className="sm:max-w-[450px] border-neutral-200">
          <DialogHeader>
            <DialogTitle>{editDedId ? 'Edit Deduction' : 'Add Deduction'}</DialogTitle>
            <DialogDescription>Configure a payroll deduction for this employee</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={dedForm.type} onValueChange={(v) => setDedForm({ ...dedForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TAX_FEDERAL">Federal Tax</SelectItem>
                  <SelectItem value="TAX_STATE">State Tax</SelectItem>
                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                  <SelectItem value="RETIREMENT">Retirement</SelectItem>
                  <SelectItem value="LOAN_REPAYMENT">Loan Repayment</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={dedForm.description}
                onChange={(e) => setDedForm({ ...dedForm, description: e.target.value })}
                placeholder="e.g. Federal income tax"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={dedForm.amount}
                  onChange={(e) => setDedForm({ ...dedForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Percentage (%)</Label>
                <Input
                  type="number"
                  value={dedForm.percentage}
                  onChange={(e) => setDedForm({ ...dedForm, percentage: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDedOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveDeduction}
              disabled={!dedForm.description || createDeduction.isPending || updateDeduction.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {(createDeduction.isPending || updateDeduction.isPending) ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Loan Dialog */}
      <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
        <DialogContent className="sm:max-w-[450px] border-neutral-200">
          <DialogHeader>
            <DialogTitle>Add Loan / Advance</DialogTitle>
            <DialogDescription>Record a new loan or payroll advance</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={loanForm.description}
                onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
                placeholder="e.g. Tool advance"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Amount ($)</Label>
                <Input
                  type="number"
                  value={loanForm.originalAmount}
                  onChange={(e) => setLoanForm({ ...loanForm, originalAmount: e.target.value, remainingBalance: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Payment ($)</Label>
                <Input
                  type="number"
                  value={loanForm.monthlyPayment}
                  onChange={(e) => setLoanForm({ ...loanForm, monthlyPayment: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={loanForm.issuedDate}
                onChange={(e) => setLoanForm({ ...loanForm, issuedDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={loanForm.notes}
                onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveLoan}
              disabled={!loanForm.description || !loanForm.originalAmount || createLoan.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {createLoan.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
