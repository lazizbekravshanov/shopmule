'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2 } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Work Order</DialogTitle>
          <DialogDescription>
            Create a new work order for a customer vehicle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="customer">
                <SelectValue placeholder={customersLoading ? "Loading..." : "Select customer"} />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                    {customer.phone && ` - ${customer.phone}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle *</Label>
            <Select
              value={vehicleId}
              onValueChange={setVehicleId}
              disabled={!customerId || vehicles.length === 0}
            >
              <SelectTrigger id="vehicle">
                <SelectValue
                  placeholder={
                    !customerId
                      ? "Select customer first"
                      : vehicles.length === 0
                        ? "No vehicles found"
                        : "Select vehicle"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.year && `${vehicle.year} `}
                    {vehicle.make} {vehicle.model}
                    {vehicle.vin && ` (${vehicle.vin.slice(-6)})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Describe the work to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkOrder.isPending}>
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
