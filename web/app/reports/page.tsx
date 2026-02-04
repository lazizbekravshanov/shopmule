'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { TechnicianPerformance } from '@/components/charts/technician-performance';
import { useRevenueReport, usePayrollReport, useProductivityReport } from '@/lib/queries/reports';
import { useEmployees } from '@/lib/queries/employees';
import { formatCurrency } from '@/lib/utils';

// Static data for charts (in real app, would come from API)
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const technicianData = [
  { name: 'John D.', jobs: 45, hours: 168 },
  { name: 'Mike S.', jobs: 38, hours: 152 },
  { name: 'Sarah L.', jobs: 52, hours: 176 },
  { name: 'Tom R.', jobs: 29, hours: 120 },
];

export default function ReportsPage() {
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport();
  const { data: employees } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const { data: payroll, isLoading: payrollLoading } = usePayrollReport(selectedEmployee);
  const { data: productivity, isLoading: productivityLoading } = useProductivityReport(selectedEmployee);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Reports</h1>
        <p className="text-neutral-500 mt-1">
          View business analytics and performance metrics
        </p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="border-neutral-200">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
              <div className="text-sm font-medium text-neutral-500 mb-2">Total Revenue</div>
              <div className="text-sm text-neutral-400 mb-3">All time revenue</div>
              {revenueLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(revenue?.total ?? 0)}
                </div>
              )}
            </div>
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
              <div className="text-sm font-medium text-neutral-500 mb-2">Invoices</div>
              <div className="text-sm text-neutral-400 mb-3">Total invoices created</div>
              {revenueLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="text-3xl font-bold text-neutral-900">{revenue?.count ?? 0}</div>
              )}
            </div>
          </div>

          <RevenueChart data={revenueData} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <TechnicianPerformance data={technicianData} />

          <div className="bg-white border border-neutral-200 rounded-lg">
            <div className="p-5 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Individual Performance</h3>
              <p className="text-sm text-neutral-500 mt-1">
                Select an employee to view their productivity
              </p>
            </div>
            <div className="p-5 space-y-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[300px] border-neutral-200">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedEmployee && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-neutral-500 mb-2">Total Hours</div>
                    {productivityLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-semibold text-neutral-900">
                        {productivity?.totalHours?.toFixed(1) ?? 0}h
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-lg">
            <div className="p-5 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Payroll Calculator</h3>
              <p className="text-sm text-neutral-500 mt-1">
                Calculate employee payroll based on hours worked
              </p>
            </div>
            <div className="p-5 space-y-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[300px] border-neutral-200">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedEmployee && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-neutral-500 mb-2">Hours Worked</div>
                    {payrollLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-semibold text-neutral-900">
                        {payroll?.hours?.toFixed(1) ?? 0}h
                      </div>
                    )}
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-neutral-500 mb-2">Hourly Rate</div>
                    {payrollLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-semibold text-neutral-900">
                        {formatCurrency(payroll?.rate ?? 0)}
                      </div>
                    )}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-emerald-600 mb-2">Gross Pay</div>
                    {payrollLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <div className="text-2xl font-semibold text-emerald-700">
                        {formatCurrency(payroll?.grossPay ?? 0)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
