'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Car,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NewAppointmentModal } from '@/components/schedule/new-appointment-modal';
import { AppointmentDetailSheet, type Appointment } from '@/components/schedule/appointment-detail-sheet';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Scheduled' },
  CONFIRMED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Confirmed' },
  IN_PROGRESS: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'In Progress' },
  COMPLETED: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-500', label: 'Completed' },
  CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
};

interface ApiAppointment {
  id: string;
  type: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  durationMinutes: number;
  notes: string | null;
  customer: { id: string; name: string; phone: string | null } | null;
  vehicle: { id: string; make: string; model: string; year: number | null; licensePlate: string | null } | null;
  technician: { id: string; name: string; role: string } | null;
}

function toDisplayAppointment(a: ApiAppointment): Appointment {
  const start = new Date(a.scheduledStart);
  const time = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const vehicleStr = a.vehicle
    ? [a.vehicle.year, a.vehicle.make, a.vehicle.model].filter(Boolean).join(' ')
    : 'Unknown vehicle';

  return {
    id: a.id,
    time,
    customer: a.customer?.name ?? 'Unknown customer',
    vehicle: vehicleStr,
    service: a.notes ?? a.type.replace('_', ' '),
    technician: a.technician?.name ?? 'Unassigned',
    status: a.status.toLowerCase().replace('_', '-') as Appointment['status'],
  };
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function SchedulePage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Fetch the whole visible month + adjacent days
  const monthStart = new Date(year, month, 1).toISOString();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data: apiAppointments = [], isLoading, isFetching, refetch } = useQuery<ApiAppointment[]>({
    queryKey: ['appointments', year, month],
    queryFn: async () => {
      const params = new URLSearchParams({ start: monthStart, end: monthEnd });
      const res = await fetch(`/api/appointments?${params}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  // Build date → appointments map
  const appointmentMap = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const a of apiAppointments) {
      const key = dateKey(new Date(a.scheduledStart));
      if (!map[key]) map[key] = [];
      map[key].push(toDisplayAppointment(a));
    }
    return map;
  }, [apiAppointments]);

  const selectedKey = dateKey(selectedDate);
  const selectedAppointments = appointmentMap[selectedKey] ?? [];

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (day: number) =>
    day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  const hasAppointments = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (appointmentMap[key]?.length ?? 0) > 0;
  };

  const onAppointmentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments', year, month] });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">Schedule</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage appointments and shop calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} className="border-neutral-200">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button onClick={() => setNewModalOpen(true)} className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{MONTHS[month]} {year}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="rounded-xl h-9 w-9 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="rounded-xl h-9 w-9 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-10" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={cn(
                    'h-10 rounded-xl text-sm font-medium transition-all relative',
                    isSelected(day)
                      ? 'bg-[#ee7a14] text-white'
                      : isToday(day)
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  )}
                >
                  {day}
                  {hasAppointments(day) && !isSelected(day) && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ee7a14]" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {isLoading ? '...' : `${selectedAppointments.length} appointment${selectedAppointments.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50">
                  <Skeleton className="w-16 h-8" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1">No appointments</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px]">
                No appointments scheduled for this day
              </p>
              <button
                onClick={() => setNewModalOpen(true)}
                className="mt-3 text-sm font-medium text-[#ee7a14] hover:underline"
              >
                Schedule one
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppointments.map((apt, index) => {
                const status = statusConfig[apt.status.toUpperCase().replace('-', '_')] ?? statusConfig.SCHEDULED;
                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { setSelectedAppointment(apt); setDetailSheetOpen(true); }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-neutral-900 dark:text-white truncate">{apt.service}</h3>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', status.bg, status.text)}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{apt.customer}</span>
                        <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />{apt.vehicle}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5" />
                        Tech: {apt.technician}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <NewAppointmentModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        defaultDate={selectedDate}
        onSuccess={onAppointmentCreated}
      />

      <AppointmentDetailSheet
        appointment={selectedAppointment}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </div>
  );
}
