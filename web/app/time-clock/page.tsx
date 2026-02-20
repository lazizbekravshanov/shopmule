'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Play,
  Square,
  Users,
  Calendar,
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployees } from '@/lib/queries/employees';
import { useClockIn, useClockOut, useTimesheet } from '@/lib/queries/time';
import {
  LiveStatusBoard,
  DayTimeline,
  WeeklyTimesheet,
  QuickClock,
  PunchReviewDashboard,
} from '@/components/time-clock';
import type { ActiveTech, TechTimeline, WeekData, PunchForReview } from '@/components/time-clock';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Generate sample data for demonstration
function generateSampleActiveTechs(employees: any[]): ActiveTech[] {
  return employees
    .filter((_, i) => i % 2 === 0) // Half are clocked in
    .map((emp, index) => ({
      id: emp.id,
      name: emp.name,
      clockedInAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
      status: index % 4 === 0 ? 'on_break' as const : 'working' as const,
      breakStartedAt: index % 4 === 0 ? new Date(Date.now() - 15 * 60 * 1000).toISOString() : undefined,
      currentJob: index % 4 !== 0 ? {
        id: `job-${index}`,
        vehicle: '2022 Freightliner Cascadia',
        description: 'Engine diagnostics and repair',
      } : undefined,
      totalHoursToday: Math.round((Math.random() * 5 + 2) * 10) / 10,
      isOvertime: Math.random() > 0.8,
    }));
}

function generateSampleTimelines(employees: any[]): TechTimeline[] {
  return employees.map((emp) => {
    const blocks = [];
    let currentHour = 6 + Math.floor(Math.random() * 2);

    // Generate 2-4 work blocks
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
      const duration = Math.random() * 2 + 1;
      const today = new Date();
      today.setHours(currentHour, Math.floor(Math.random() * 60), 0, 0);
      const endTime = new Date(today);
      endTime.setHours(currentHour + duration);

      blocks.push({
        id: `block-${emp.id}-${i}`,
        type: 'work' as const,
        startTime: today.toISOString(),
        endTime: i === 0 && Math.random() > 0.5 ? undefined : endTime.toISOString(),
        jobId: `job-${i}`,
        jobName: i === 0 ? 'Brake System Repair' : 'Engine Diagnostics',
      });

      currentHour += duration;

      // Add a break
      if (i < 2 && Math.random() > 0.5) {
        const breakStart = new Date(today);
        breakStart.setHours(currentHour, 0, 0, 0);
        const breakEnd = new Date(breakStart);
        breakEnd.setMinutes(breakEnd.getMinutes() + 30);

        blocks.push({
          id: `break-${emp.id}-${i}`,
          type: 'break' as const,
          startTime: breakStart.toISOString(),
          endTime: breakEnd.toISOString(),
        });

        currentHour += 0.5;
      }
    }

    // Add overtime block if applicable
    if (Math.random() > 0.7 && currentHour > 17) {
      const overtimeStart = new Date();
      overtimeStart.setHours(17, 0, 0, 0);
      blocks.push({
        id: `ot-${emp.id}`,
        type: 'overtime' as const,
        startTime: overtimeStart.toISOString(),
        endTime: undefined,
      });
    }

    return {
      id: emp.id,
      name: emp.name,
      blocks,
      totalHours: Math.round((currentHour - 6) * 10) / 10,
      efficiency: Math.floor(Math.random() * 30) + 75,
    };
  });
}

function generateSampleWeekData(employeeName: string): WeekData {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const isToday = date.toDateString() === today.toDateString();
    const isFuture = date > today;
    const isWeekend = index >= 5;

    if (isFuture) {
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName,
        status: 'future' as const,
        breakMinutes: 0,
        totalHours: 0,
        isToday: false,
      };
    }

    if (isWeekend && Math.random() > 0.3) {
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName,
        status: 'absent' as const,
        breakMinutes: 0,
        totalHours: 0,
        isToday,
      };
    }

    const clockInHour = 6 + Math.floor(Math.random() * 2);
    const workHours = 8 + Math.random() * 3;
    const breakMins = Math.floor(Math.random() * 30) + 15;
    const overtime = workHours > 8 ? workHours - 8 : 0;

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName,
      clockIn: `${clockInHour}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} AM`,
      clockOut: isToday ? undefined : `${clockInHour + Math.floor(workHours)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} PM`,
      breakMinutes: breakMins,
      totalHours: Math.round(workHours * 10) / 10,
      status: isToday ? 'incomplete' as const : 'complete' as const,
      isToday,
      overtime: overtime > 0 ? Math.round(overtime * 10) / 10 : undefined,
    };
  });

  const totalHours = days.reduce((sum, d) => sum + d.totalHours, 0);
  const totalOvertime = days.reduce((sum, d) => sum + (d.overtime || 0), 0);

  return {
    weekStart: startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weekEnd: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    days,
    totalHours: Math.round(totalHours * 10) / 10,
    totalOvertime: Math.round(totalOvertime * 10) / 10,
    avgEfficiency: Math.floor(Math.random() * 20) + 80,
  };
}

export default function TimeClockPage() {
  const { data: employees, isLoading: employeesLoading, refetch, isFetching } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const { data: timesheet } = useTimesheet(selectedEmployee);
  const queryClient = useQueryClient();

  // Fetch punches for review
  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ['punchesForReview'],
    queryFn: async () => {
      const response = await fetch('/api/attendance/review?daysBack=7');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Fetch real-time attendance status
  const { data: whoData } = useQuery({
    queryKey: ['attendance', 'whos-working'],
    queryFn: async () => {
      const res = await fetch('/api/attendance/whos-working');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Mutation for approving/rejecting punches
  const reviewMutation = useMutation({
    mutationFn: async ({ action, punchId, reason, newTimestamp, notes }: {
      action: 'approve' | 'reject' | 'edit';
      punchId: string;
      reason?: string;
      newTimestamp?: string;
      notes?: string;
    }) => {
      const response = await fetch('/api/attendance/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, punchId, reason, newTimestamp, notes }),
      });
      if (!response.ok) throw new Error('Failed to process');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punchesForReview'] });
    },
  });

  const handleApprovePunch = (punchId: string) => {
    reviewMutation.mutate({ action: 'approve', punchId });
  };

  const handleRejectPunch = (punchId: string, reason: string) => {
    reviewMutation.mutate({ action: 'reject', punchId, reason });
  };

  const handleEditPunch = (punchId: string, newTimestamp: string, notes: string) => {
    reviewMutation.mutate({ action: 'edit', punchId, newTimestamp, notes });
  };

  const punchesForReview: PunchForReview[] = reviewData?.punches || [];

  // Get the selected employee's name
  const selectedEmployeeName = employees?.find(e => e.id === selectedEmployee)?.name || 'Select Employee';

  // Build real active techs from attendance API
  const activeTechs = useMemo((): ActiveTech[] => {
    if (!whoData?.employees) return employees ? generateSampleActiveTechs(employees) : [];
    const allWorking = [
      ...(whoData.employees.clockedIn ?? []),
      ...(whoData.employees.onBreak ?? []),
    ];
    return allWorking.map((e: any) => ({
      id: e.employee.id,
      name: e.employee.name,
      clockedInAt: e.currentShift?.clockInTime ?? undefined,
      status: e.isOnBreak ? ('on_break' as const) : ('working' as const),
      currentJob: undefined,
      totalHoursToday: e.currentShift?.duration?.minutes
        ? Math.round((e.currentShift.duration.minutes / 60) * 10) / 10
        : 0,
      isOvertime: e.currentShift?.duration?.minutes > 480,
    }));
  }, [whoData, employees]);

  const timelines = useMemo(() =>
    employees ? generateSampleTimelines(employees) : [],
    [employees]
  );

  const weekData = useMemo(() =>
    generateSampleWeekData(selectedEmployeeName),
    [selectedEmployeeName]
  );

  // Current clock status — prefer real data from attendance API
  const currentStatus = useMemo((): 'clocked_in' | 'on_break' | 'clocked_out' => {
    if (!selectedEmployee) return 'clocked_out';
    if (whoData?.employees) {
      const allEmp = [
        ...(whoData.employees.clockedIn ?? []),
        ...(whoData.employees.onBreak ?? []),
        ...(whoData.employees.clockedOut ?? []),
      ];
      const found = allEmp.find((e: any) => e.employee.id === selectedEmployee);
      if (found) {
        if (found.isOnBreak) return 'on_break';
        if (found.isClockedIn) return 'clocked_in';
        return 'clocked_out';
      }
    }
    const activeTech = activeTechs.find(t => t.id === selectedEmployee);
    if (!activeTech) return 'clocked_out';
    return activeTech.status === 'on_break' ? 'on_break' : 'clocked_in';
  }, [selectedEmployee, activeTechs, whoData]);

  const clockedInAt = useMemo(() => {
    if (selectedEmployee && whoData?.employees) {
      const allEmp = [
        ...(whoData.employees.clockedIn ?? []),
        ...(whoData.employees.onBreak ?? []),
      ];
      const found = allEmp.find((e: any) => e.employee.id === selectedEmployee);
      if (found?.currentShift?.clockInTime) return found.currentShift.clockInTime;
    }
    return activeTechs.find(t => t.id === selectedEmployee)?.clockedInAt;
  }, [selectedEmployee, activeTechs, whoData]);

  const handleClockIn = () => {
    if (selectedEmployee) {
      clockIn.mutate(selectedEmployee);
    }
  };

  const handleClockOut = () => {
    // In real implementation, would get the active time entry ID
    clockOut.mutate(selectedEmployee);
  };

  const flaggedCount = reviewData?.summary?.flagged || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Time Clock</h1>
          <p className="text-neutral-500 mt-1">
            Track and manage employee work hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch();
              queryClient.invalidateQueries({ queryKey: ['punchesForReview'] });
            }}
            disabled={isFetching}
            className="border-neutral-200"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            className="border-neutral-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-neutral-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            <Clock className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="review" className="data-[state=active]:bg-white relative">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Review Punches
            {flaggedCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                {flaggedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Clock Widget */}
            <div className="lg:col-span-1">
              {employeesLoading ? (
                <Skeleton className="h-[420px] rounded-xl" />
              ) : (
                <>
                  {/* Employee Selector */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-700">Select Employee</span>
                    </div>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger className="border-neutral-200">
                        <SelectValue placeholder="Choose an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.role.replace('_', ' ')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <QuickClock
                    employeeId={selectedEmployee}
                    employeeName={selectedEmployeeName}
                    currentStatus={currentStatus}
                    clockedInAt={clockedInAt}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                    onStartBreak={() => {}}
                    onEndBreak={() => {}}
                    isLoading={clockIn.isPending || clockOut.isPending}
                  />
                </>
              )}
            </div>

            {/* Live Status Board */}
            <div className="lg:col-span-2">
              {employeesLoading ? (
                <Skeleton className="h-[500px] rounded-xl" />
              ) : (
                <LiveStatusBoard activeTechs={activeTechs} />
              )}
            </div>
          </div>

          {/* Day Timeline */}
          {employeesLoading ? (
            <Skeleton className="h-[300px] rounded-xl" />
          ) : (
            <DayTimeline technicians={timelines} />
          )}

          {/* Weekly Timesheet */}
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <WeeklyTimesheet week={weekData} employeeName={selectedEmployeeName} />
            </motion.div>
          )}

          {/* Empty State when no employee selected */}
          {!selectedEmployee && !employeesLoading && (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">View Weekly Timesheet</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                Select an employee above to view their detailed weekly timesheet with hours, breaks, and overtime tracking.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <PunchReviewDashboard
            punches={punchesForReview}
            onApprove={handleApprovePunch}
            onReject={handleRejectPunch}
            onEdit={handleEditPunch}
            isLoading={reviewLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
