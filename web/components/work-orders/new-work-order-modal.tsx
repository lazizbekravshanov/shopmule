'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { useCustomers } from '@/lib/queries/customers';
import { useCreateWorkOrder } from '@/lib/queries/work-orders';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Truck, User, FileText } from 'lucide-react';

interface NewWorkOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewWorkOrderModal({ open, onOpenChange }: NewWorkOrderModalProps) {
  const { toast } = useToast();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const createWorkOrder = useCreateWorkOrder();

  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');

  // Get selected customer's vehicles
  const selectedCustomer = customers?.find((c) => c.id === customerId);
  const vehicles = selectedCustomer?.vehicles || [];

  // Reset vehicle when customer changes
  useEffect(() => {
    setVehicleId('');
  }, [customerId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCustomerId('');
      setVehicleId('');
      setDescription('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a vehicle',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a description',
      });
      return;
    }

    try {
      await createWorkOrder.mutateAsync({
        vehicleId,
        description: description.trim(),
      });

      toast({
        title: 'Success',
        description: 'Work order created successfully',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create work order',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900">New Work Order</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Create a new work order for a customer vehicle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              Customer
            </Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="customer" className="border-neutral-200 focus:ring-[#ee7a14] focus:ring-offset-0 focus:border-[#ee7a14]">
                <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select a customer"} />
              </SelectTrigger>
              <SelectContent className="border-neutral-200">
                {customers?.length === 0 ? (
                  <div className="py-6 text-center text-sm text-neutral-500">
                    No customers found. Add a customer first.
                  </div>
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

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Truck className="h-4 w-4 text-neutral-400" />
              Vehicle
            </Label>
            <Select
              value={vehicleId}
              onValueChange={setVehicleId}
              disabled={!customerId || vehicles.length === 0}
            >
              <SelectTrigger id="vehicle" className="border-neutral-200 focus:ring-[#ee7a14] focus:ring-offset-0 focus:border-[#ee7a14]">
                <SelectValue
                  placeholder={
                    !customerId
                      ? "Select a customer first"
                      : vehicles.length === 0
                        ? "No vehicles found for this customer"
                        : "Select a vehicle"
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-neutral-200">
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {vehicle.year && `${vehicle.year} `}
                        {vehicle.make} {vehicle.model}
                      </span>
                      {vehicle.vin && (
                        <span className="text-xs text-neutral-500 font-mono">
                          VIN: ...{vehicle.vin.slice(-6)}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-400" />
              Work Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the work to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="border-neutral-200 focus:ring-[#ee7a14] focus:ring-offset-0 focus:border-[#ee7a14] resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWorkOrder.isPending || !customerId || !vehicleId || !description.trim()}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
            >
              {createWorkOrder.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Work Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
