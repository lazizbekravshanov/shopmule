import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type PayrollSummary,
  type EmployeePayrollDetail,
  type DeductionItem,
  type LoanItem,
} from '@/lib/api';

export const payrollKeys = {
  all: ['payroll'] as const,
  summary: (period: string) => [...payrollKeys.all, 'summary', period] as const,
  employee: (id: string, period: string) => [...payrollKeys.all, 'employee', id, period] as const,
  deductions: (employeeId: string) => [...payrollKeys.all, 'deductions', employeeId] as const,
  loans: (employeeId: string) => [...payrollKeys.all, 'loans', employeeId] as const,
};

export function usePayrollSummary(period: string) {
  return useQuery<PayrollSummary>({
    queryKey: payrollKeys.summary(period),
    queryFn: () => api.payroll.summary(period),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useEmployeePayroll(employeeId: string, period: string) {
  return useQuery<EmployeePayrollDetail>({
    queryKey: payrollKeys.employee(employeeId, period),
    queryFn: () => api.payroll.employee(employeeId, period),
    enabled: !!employeeId,
    staleTime: 30_000,
  });
}

export function useDeductions(employeeId: string) {
  return useQuery<DeductionItem[]>({
    queryKey: payrollKeys.deductions(employeeId),
    queryFn: () => api.employees.deductions.list(employeeId),
    enabled: !!employeeId,
  });
}

export function useCreateDeduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: Omit<DeductionItem, 'id' | 'createdAt'>;
    }) => api.employees.deductions.create(employeeId, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: payrollKeys.deductions(v.employeeId) });
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

export function useUpdateDeduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      deductionId,
      data,
    }: {
      employeeId: string;
      deductionId: string;
      data: Partial<DeductionItem>;
    }) => api.employees.deductions.update(employeeId, deductionId, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: payrollKeys.deductions(v.employeeId) });
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

export function useDeleteDeduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      deductionId,
    }: {
      employeeId: string;
      deductionId: string;
    }) => api.employees.deductions.delete(employeeId, deductionId),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: payrollKeys.deductions(v.employeeId) });
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

export function useLoans(employeeId: string) {
  return useQuery<LoanItem[]>({
    queryKey: payrollKeys.loans(employeeId),
    queryFn: () => api.employees.loans.list(employeeId),
    enabled: !!employeeId,
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: Omit<LoanItem, 'id' | 'createdAt'>;
    }) => api.employees.loans.create(employeeId, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: payrollKeys.loans(v.employeeId) });
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      loanId,
      data,
    }: {
      employeeId: string;
      loanId: string;
      data: Partial<LoanItem>;
    }) => api.employees.loans.update(employeeId, loanId, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: payrollKeys.loans(v.employeeId) });
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}
