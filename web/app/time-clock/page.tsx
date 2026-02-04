'use client';

import { useState } from 'react';
import { Clock, Play, Square, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployees } from '@/lib/queries/employees';
import { useClockIn, useClockOut, useTimesheet } from '@/lib/queries/time';
import { formatDateTime } from '@/lib/utils';

export default function TimeClockPage() {
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const [clockInOpen, setClockInOpen] = useState(false);
  const [clockOutOpen, setClockOutOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const { data: timesheet, isLoading: timesheetLoading } = useTimesheet(selectedEmployee);

  const handleClockIn = () => {
    if (!selectedEmployee) return;
    clockIn.mutate(selectedEmployee, {
      onSuccess: () => {
        setClockInOpen(false);
      },
    });
  };

  const handleClockOut = () => {
    if (!selectedEntryId) return;
    clockOut.mutate(selectedEntryId, {
      onSuccess: () => {
        setClockOutOpen(false);
        setSelectedEntryId('');
      },
    });
  };

  // Get currently clocked in entries
  const activeTimes = timesheet?.filter((t) => !t.clockOut) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Time Clock</h1>
          <p className="text-neutral-500 mt-1">
            Track employee work hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setClockInOpen(true)}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
          >
            <Play className="mr-2 h-4 w-4" />
            Clock In
          </Button>
          <Button
            variant="outline"
            onClick={() => setClockOutOpen(true)}
            disabled={activeTimes.length === 0}
            className="border-neutral-200"
          >
            <Square className="mr-2 h-4 w-4" />
            Clock Out
          </Button>
        </div>
      </div>

      {/* Employee Selection */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-neutral-400" />
          <h3 className="font-semibold text-neutral-900">Select Employee</h3>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Choose an employee to view their timesheet
        </p>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-[300px] border-neutral-200">
            <SelectValue placeholder="Select an employee" />
          </SelectTrigger>
          <SelectContent>
            {employees?.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Clock-ins */}
      {selectedEmployee && activeTimes.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-emerald-600 animate-pulse" />
            <h3 className="font-semibold text-emerald-800">Currently Clocked In</h3>
          </div>
          <div className="space-y-2">
            {activeTimes.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-3"
              >
                <div>
                  <div className="font-medium text-neutral-900">
                    Started: {formatDateTime(entry.clockIn)}
                  </div>
                  {entry.jobId && (
                    <div className="text-sm text-neutral-500">
                      Job: {entry.jobId.slice(0, 8)}
                    </div>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timesheet */}
      {selectedEmployee && (
        <div className="bg-white border border-neutral-200 rounded-lg">
          <div className="p-5 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-900">Timesheet</h3>
            <p className="text-sm text-neutral-500 mt-1">Recent time entries</p>
          </div>
          <div className="p-5">
            {timesheetLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : timesheet && timesheet.length > 0 ? (
              <div className="space-y-2">
                {timesheet.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-neutral-900">
                        In: {formatDateTime(entry.clockIn)}
                      </div>
                      {entry.clockOut && (
                        <div className="text-sm text-neutral-500">
                          Out: {formatDateTime(entry.clockOut)}
                        </div>
                      )}
                    </div>
                    {entry.clockOut ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-neutral-50 text-neutral-500 border-neutral-200">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-400 py-8">
                No time entries found
              </p>
            )}
          </div>
        </div>
      )}

      {/* Clock In Dialog */}
      <Dialog open={clockInOpen} onOpenChange={setClockInOpen}>
        <DialogContent className="sm:max-w-[400px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Clock In</DialogTitle>
            <DialogDescription className="text-neutral-500">Select an employee to clock in</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="clockInEmployee" className="text-sm font-medium text-neutral-700">Employee</Label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="mt-2 border-neutral-200">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClockInOpen(false)} className="border-neutral-200">
              Cancel
            </Button>
            <Button
              onClick={handleClockIn}
              disabled={!selectedEmployee}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              Clock In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog open={clockOutOpen} onOpenChange={setClockOutOpen}>
        <DialogContent className="sm:max-w-[400px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Clock Out</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Select an active time entry to clock out
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium text-neutral-700">Active Entries</Label>
            <div className="mt-2 space-y-2">
              {activeTimes.map((entry) => (
                <div
                  key={entry.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedEntryId === entry.id
                      ? 'border-[#ee7a14] bg-orange-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <div className="font-medium text-neutral-900">
                    Started: {formatDateTime(entry.clockIn)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClockOutOpen(false)} className="border-neutral-200">
              Cancel
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={!selectedEntryId}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              Clock Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
