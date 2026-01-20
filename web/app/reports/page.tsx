'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View business analytics and performance metrics
        </p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>All time revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <div className="text-3xl font-bold">
                    {formatCurrency(revenue?.total ?? 0)}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Total invoices created</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{revenue?.count ?? 0}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <RevenueChart data={revenueData} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <TechnicianPerformance data={technicianData} />

          <Card>
            <CardHeader>
              <CardTitle>Individual Performance</CardTitle>
              <CardDescription>
                Select an employee to view their productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[300px]">
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
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {productivityLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <div className="text-2xl font-bold">
                          {productivity?.totalHours?.toFixed(1) ?? 0}h
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Calculator</CardTitle>
              <CardDescription>
                Calculate employee payroll based on hours worked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[300px]">
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
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Hours Worked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {payrollLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <div className="text-2xl font-bold">
                          {payroll?.hours?.toFixed(1) ?? 0}h
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Hourly Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {payrollLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <div className="text-2xl font-bold">
                          {formatCurrency(payroll?.rate ?? 0)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Gross Pay</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {payrollLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(payroll?.grossPay ?? 0)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
