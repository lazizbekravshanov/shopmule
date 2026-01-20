'use client';

import { useState } from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Clock</h1>
          <p className="text-muted-foreground">
            Track employee work hours
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setClockInOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Clock In
          </Button>
          <Button
            variant="outline"
            onClick={() => setClockOutOpen(true)}
            disabled={activeTimes.length === 0}
          >
            <Square className="mr-2 h-4 w-4" />
            Clock Out
          </Button>
        </div>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Employee</CardTitle>
          <CardDescription>
            Choose an employee to view their timesheet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[300px]">
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
        </CardContent>
      </Card>

      {/* Active Clock-ins */}
      {selectedEmployee && activeTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500 animate-pulse" />
              Currently Clocked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeTimes.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">
                      Started: {formatDateTime(entry.clockIn)}
                    </div>
                    {entry.jobId && (
                      <div className="text-sm text-muted-foreground">
                        Job: {entry.jobId.slice(0, 8)}
                      </div>
                    )}
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timesheet */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Timesheet</CardTitle>
            <CardDescription>Recent time entries</CardDescription>
          </CardHeader>
          <CardContent>
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
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        In: {formatDateTime(entry.clockIn)}
                      </div>
                      {entry.clockOut && (
                        <div className="text-sm text-muted-foreground">
                          Out: {formatDateTime(entry.clockOut)}
                        </div>
                      )}
                    </div>
                    {entry.clockOut ? (
                      <Badge variant="secondary">Completed</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No time entries found
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clock In Dialog */}
      <Dialog open={clockInOpen} onOpenChange={setClockInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock In</DialogTitle>
            <DialogDescription>Select an employee to clock in</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="clockInEmployee">Employee</Label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="mt-2">
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
            <Button variant="outline" onClick={() => setClockInOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClockIn} disabled={!selectedEmployee}>
              Clock In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog open={clockOutOpen} onOpenChange={setClockOutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock Out</DialogTitle>
            <DialogDescription>
              Select an active time entry to clock out
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Active Entries</Label>
            <div className="mt-2 space-y-2">
              {activeTimes.map((entry) => (
                <div
                  key={entry.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedEntryId === entry.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <div className="font-medium">
                    Started: {formatDateTime(entry.clockIn)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClockOutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClockOut} disabled={!selectedEntryId}>
              Clock Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
