'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Car,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Mock scheduled appointments
const mockAppointments: Record<string, Array<{
  id: string;
  time: string;
  customer: string;
  vehicle: string;
  service: string;
  technician: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}>> = {
  // Today's appointments (we'll calculate the actual date)
};

// Add some mock data for demonstration
function generateMockData() {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  mockAppointments[dateKey] = [
    { id: '1', time: '9:00 AM', customer: 'John Smith', vehicle: '2021 Toyota Camry', service: 'Oil Change', technician: 'Mike', status: 'completed' },
    { id: '2', time: '10:30 AM', customer: 'Sarah Johnson', vehicle: '2019 Honda Accord', service: 'Brake Inspection', technician: 'Dave', status: 'in-progress' },
    { id: '3', time: '1:00 PM', customer: 'Robert Chen', vehicle: '2022 Ford F-150', service: 'Tire Rotation', technician: 'Mike', status: 'scheduled' },
    { id: '4', time: '3:00 PM', customer: 'Emily Davis', vehicle: '2020 BMW X5', service: 'Full Service', technician: 'Dave', status: 'scheduled' },
  ];

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  mockAppointments[tomorrowKey] = [
    { id: '5', time: '8:30 AM', customer: 'Michael Brown', vehicle: '2018 Chevrolet Silverado', service: 'Engine Diagnostic', technician: 'Mike', status: 'scheduled' },
    { id: '6', time: '11:00 AM', customer: 'Lisa Wilson', vehicle: '2023 Tesla Model 3', service: 'Tire Service', technician: 'Dave', status: 'scheduled' },
  ];

  return mockAppointments;
}

export default function SchedulePage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const appointments = generateMockData();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedAppointments = appointments[selectedDateKey] || [];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const hasAppointments = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments[dateKey]?.length > 0;
  };

  const statusConfig = {
    scheduled: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Scheduled' },
    'in-progress': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'In Progress' },
    completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completed' },
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
            Schedule
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage appointments and shop calendar
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="rounded-xl h-9 w-9 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="rounded-xl h-9 w-9 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={cn(
                    'h-10 rounded-xl text-sm font-medium transition-all relative',
                    isSelected(day)
                      ? 'bg-orange-500 text-white'
                      : isToday(day)
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  )}
                >
                  {day}
                  {hasAppointments(day) && !isSelected(day) && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {selectedAppointments.length} appointment{selectedAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {selectedAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                No appointments
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px]">
                No appointments scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppointments.map((apt, index) => {
                const status = statusConfig[apt.status];
                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {apt.time}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                          {apt.service}
                        </h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          status.bg,
                          status.text
                        )}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {apt.customer}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5" />
                          {apt.vehicle}
                        </span>
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
    </div>
  );
}
