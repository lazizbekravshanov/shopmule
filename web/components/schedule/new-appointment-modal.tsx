'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { DatePicker } from '@/components/ui/date-picker';
import { useCustomers } from '@/lib/queries/customers';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Car, Clock, Wrench, Calendar } from 'lucide-react';

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  onSuccess?: () => void;
}

export function NewAppointmentModal({ open, onOpenChange, defaultDate, onSuccess }: NewAppointmentModalProps) {
  const { toast } = useToast();
  const { data: customers, isLoading: customersLoading } = useCustomers();

  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [time, setTime] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedCustomer = customers?.find((c) => c.id === customerId);
  const vehicles = selectedCustomer?.vehicles || [];

  // Reset vehicle when customer changes
  useEffect(() => {
    setVehicleId('');
  }, [customerId]);

  // Update date when defaultDate changes
  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCustomerId('');
      setVehicleId('');
      setDate(defaultDate);
      setTime('');
      setService('');
      setNotes('');
    }
  }, [open, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a customer' });
      return;
    }
    if (!date) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a date' });
      return;
    }
    if (!time) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a time' });
      return;
    }
    if (!service.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a service description' });
      return;
    }

    setSubmitting(true);
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledStart = new Date(date);
      scheduledStart.setHours(hours, minutes, 0, 0);
      const scheduledEnd = new Date(scheduledStart.getTime() + 60 * 60 * 1000); // 1 hour default

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          vehicleId: vehicleId || null,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
          durationMinutes: 60,
          notes: service.trim() + (notes.trim() ? `\n${notes.trim()}` : ''),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to create appointment');
      }

      toast({
        title: 'Appointment scheduled',
        description: `Scheduled for ${date.toLocaleDateString()} at ${time}`,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create appointment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-neutral-200 dark:border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900 dark:text-white">
            New Appointment
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            Schedule a new service appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Customer */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              Customer
            </Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="border-neutral-200 dark:border-neutral-600 focus:ring-[#ee7a14] focus:border-[#ee7a14]">
                <SelectValue placeholder={customersLoading ? 'Loading...' : 'Select a customer'} />
              </SelectTrigger>
              <SelectContent className="border-neutral-200 dark:border-neutral-600">
                {customers?.length === 0 ? (
                  <div className="py-6 text-center text-sm text-neutral-500">No customers found.</div>
                ) : (
                  customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id} className="cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        {customer.phone && (
                          <span className="text-xs text-neutral-500">{customer.phone}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <Car className="h-4 w-4 text-neutral-400" />
              Vehicle
            </Label>
            <Select value={vehicleId} onValueChange={setVehicleId} disabled={!customerId || vehicles.length === 0}>
              <SelectTrigger className="border-neutral-200 dark:border-neutral-600 focus:ring-[#ee7a14] focus:border-[#ee7a14]">
                <SelectValue
                  placeholder={
                    !customerId
                      ? 'Select a customer first'
                      : vehicles.length === 0
                        ? 'No vehicles found'
                        : 'Select a vehicle'
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-neutral-200 dark:border-neutral-600">
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="cursor-pointer">
                    <span className="font-medium">
                      {vehicle.year && `${vehicle.year} `}
                      {vehicle.make} {vehicle.model}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                Date
              </Label>
              <DatePicker date={date} onDateChange={setDate} placeholder="Pick a date" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-400" />
                Time
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-neutral-200 dark:border-neutral-600 focus:ring-[#ee7a14] focus:border-[#ee7a14]"
              />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-neutral-400" />
              Service
            </Label>
            <Textarea
              placeholder="Describe the service needed..."
              value={service}
              onChange={(e) => setService(e.target.value)}
              rows={3}
              className="border-neutral-200 dark:border-neutral-600 focus:ring-[#ee7a14] focus:border-[#ee7a14] resize-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Notes (optional)
            </Label>
            <Input
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-neutral-200 dark:border-neutral-600 focus:ring-[#ee7a14] focus:border-[#ee7a14]"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !customerId || !date || !time || !service.trim()}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
