'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { useTemplates } from '@/lib/queries/templates';
import { useDeferredWork } from '@/lib/queries/deferred';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Truck, User, FileText, LayoutTemplate, X, Clock, AlertTriangle } from 'lucide-react';
import type { ServiceTemplate } from '@/lib/api';
import { cn } from '@/lib/utils';

// Built-in HD truck templates shown when the shop has no custom templates yet
const BUILTIN_TEMPLATES: Omit<ServiceTemplate, 'id'>[] = [
  {
    name: 'DOT Annual Inspection',
    category: 'Inspection',
    laborHours: 2.5,
    flatRatePrice: null,
    description: 'Federal DOT annual vehicle inspection per FMCSA 49 CFR Part 396',
    lines: [
      { type: 'LABOR', description: 'DOT annual inspection – service brake system', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'DOT annual inspection – lighting & electrical', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'DOT annual inspection – steering & suspension', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'DOT annual inspection – tires & wheels', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'DOT annual inspection – exhaust & frame', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'FEE',   description: 'DOT inspection certificate & sticker', quantity: 1, unitPrice: 25, laborHours: null },
    ],
  },
  {
    name: 'PM-A Service',
    category: 'Preventive Maintenance',
    laborHours: 1.5,
    flatRatePrice: null,
    description: 'Standard A-interval preventive maintenance service',
    lines: [
      { type: 'LABOR', description: 'Engine oil & filter change', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'Grease chassis & fifth wheel', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'Check & top fluids, belts, hoses', quantity: 1, unitPrice: 0, laborHours: 0.25 },
      { type: 'LABOR', description: 'Safety inspection walk-around', quantity: 1, unitPrice: 0, laborHours: 0.25 },
    ],
  },
  {
    name: 'Brake Job – Full Axle',
    category: 'Brakes',
    laborHours: 3.0,
    flatRatePrice: null,
    description: 'Full axle brake reline with drums and hardware inspection',
    lines: [
      { type: 'LABOR', description: 'Remove drums, inspect & reline brakes – full axle', quantity: 1, unitPrice: 0, laborHours: 2.5 },
      { type: 'LABOR', description: 'Adjust slack adjusters & road test', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'PART',  description: 'Brake lining set (per axle)', quantity: 1, unitPrice: 0, laborHours: null },
      { type: 'PART',  description: 'Hardware kit', quantity: 1, unitPrice: 0, laborHours: null },
    ],
  },
  {
    name: 'Tire Rotation & Inspection',
    category: 'Tires',
    laborHours: 1.0,
    flatRatePrice: null,
    description: 'Drive & trailer axle rotation with tread depth & pressure check',
    lines: [
      { type: 'LABOR', description: 'Rotate drive axle tires – cross pattern', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'Inspect tread depth, sidewalls & air pressure – all positions', quantity: 1, unitPrice: 0, laborHours: 0.5 },
    ],
  },
  {
    name: 'Engine Diagnostic',
    category: 'Engine',
    laborHours: 1.5,
    flatRatePrice: null,
    description: 'Electronic fault code scan and engine performance diagnosis',
    lines: [
      { type: 'LABOR', description: 'Connect diagnostic scan tool – retrieve & document fault codes', quantity: 1, unitPrice: 0, laborHours: 0.5 },
      { type: 'LABOR', description: 'Inspect and diagnose root cause', quantity: 1, unitPrice: 0, laborHours: 1.0 },
      { type: 'NOTE',  description: 'Separate estimate required for repairs', quantity: 1, unitPrice: 0, laborHours: null },
    ],
  },
];

function buildDescription(template: Omit<ServiceTemplate, 'id'>): string {
  const laborLines = template.lines.filter((l) => l.type === 'LABOR');
  if (laborLines.length === 0) return template.name;
  const tasks = laborLines.map((l) => `• ${l.description}`).join('\n');
  return `${template.name}\n\n${tasks}`;
}

// ─── Template picker strip ─────────────────────────────────────────────────

function TemplatePicker({
  selected,
  onSelect,
  onClear,
}: {
  selected: Omit<ServiceTemplate, 'id'> | null;
  onSelect: (t: Omit<ServiceTemplate, 'id'>) => void;
  onClear: () => void;
}) {
  const { data: dbTemplates = [] } = useTemplates();
  // Merge: DB templates first, then builtins not shadowed by DB name
  const dbNames = new Set(dbTemplates.map((t) => t.name));
  const merged: Omit<ServiceTemplate, 'id'>[] = [
    ...dbTemplates,
    ...BUILTIN_TEMPLATES.filter((t) => !dbNames.has(t.name)),
  ];

  const categoryColors: Record<string, string> = {
    Inspection: 'bg-blue-50 border-blue-200 text-blue-700',
    'Preventive Maintenance': 'bg-emerald-50 border-emerald-200 text-emerald-700',
    Brakes: 'bg-red-50 border-red-200 text-red-700',
    Tires: 'bg-amber-50 border-amber-200 text-amber-700',
    Engine: 'bg-orange-50 border-orange-200 text-orange-700',
    Electrical: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-neutral-400" />
          Start from Template
          <span className="text-xs font-normal text-neutral-400">(optional)</span>
        </Label>
        {selected && (
          <button
            onClick={onClear}
            className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-0.5"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {merged.map((t, idx) => {
          const isSelected = selected?.name === t.name;
          const colorClass = categoryColors[t.category ?? ''] ?? 'bg-neutral-50 border-neutral-200 text-neutral-600';
          return (
            <button
              key={t.name + idx}
              type="button"
              onClick={() => (isSelected ? onClear() : onSelect(t))}
              className={cn(
                'shrink-0 rounded-lg border px-3 py-2 text-left transition-all text-xs',
                'focus:outline-none focus:ring-2 focus:ring-[#ee7a14] focus:ring-offset-1',
                isSelected
                  ? 'border-[#ee7a14] bg-orange-50 ring-1 ring-[#ee7a14]'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50',
              )}
              style={{ minWidth: 130, maxWidth: 160 }}
            >
              <div className="font-medium text-neutral-800 leading-tight mb-1">{t.name}</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {t.category && (
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', colorClass)}>
                    {t.category}
                  </span>
                )}
                {t.laborHours != null && (
                  <span className="text-[10px] text-neutral-400">{t.laborHours}h</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────

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
  const [selectedTemplate, setSelectedTemplate] = useState<Omit<ServiceTemplate, 'id'> | null>(null);

  const selectedCustomer = customers?.find((c) => c.id === customerId);
  const vehicles = selectedCustomer?.vehicles || [];
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  // Fetch deferred work for selected vehicle
  const { data: deferredItems = [] } = useDeferredWork(vehicleId || undefined);
  const pendingDeferred = deferredItems.filter((i) => i.status === 'PENDING');

  useEffect(() => { setVehicleId(''); }, [customerId]);

  useEffect(() => {
    if (!open) {
      setCustomerId('');
      setVehicleId('');
      setDescription('');
      setSelectedTemplate(null);
    }
  }, [open]);

  const handleSelectTemplate = (t: Omit<ServiceTemplate, 'id'>) => {
    setSelectedTemplate(t);
    setDescription(buildDescription(t));
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a vehicle' });
      return;
    }
    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a description' });
      return;
    }

    try {
      await createWorkOrder.mutateAsync({ vehicleId, description: description.trim() });
      toast({ title: 'Work order created' });
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
      <DialogContent className="sm:max-w-[540px] border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900">New Work Order</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Pick a template or start from scratch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Template picker */}
          <TemplatePicker
            selected={selectedTemplate}
            onSelect={handleSelectTemplate}
            onClear={handleClearTemplate}
          />

          <div className="border-t border-neutral-100" />

          {/* Customer */}
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              Customer
            </Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="customer" className="border-neutral-200 focus:ring-[#ee7a14] focus:ring-offset-0 focus:border-[#ee7a14]">
                <SelectValue placeholder={customersLoading ? 'Loading...' : 'Select a customer'} />
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
                        {customer.phone && <span className="text-xs text-neutral-500">{customer.phone}</span>}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle */}
          <div className="space-y-2">
            <Label htmlFor="vehicle" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Truck className="h-4 w-4 text-neutral-400" />
              Vehicle
            </Label>
            <Select value={vehicleId} onValueChange={setVehicleId} disabled={!customerId || vehicles.length === 0}>
              <SelectTrigger id="vehicle" className="border-neutral-200 focus:ring-[#ee7a14] focus:ring-offset-0 focus:border-[#ee7a14]">
                <SelectValue
                  placeholder={
                    !customerId ? 'Select a customer first'
                    : vehicles.length === 0 ? 'No vehicles for this customer'
                    : 'Select a vehicle'
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-neutral-200">
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {vehicle.year && `${vehicle.year} `}{vehicle.make} {vehicle.model}
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

          {/* Deferred work alert */}
          {vehicleId && pendingDeferred.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {pendingDeferred.length} deferred repair{pendingDeferred.length > 1 ? 's' : ''} on this vehicle
              </div>
              <div className="space-y-1">
                {pendingDeferred.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-xs text-amber-700">
                    <Clock className="h-3 w-3 mt-0.5 shrink-0 text-amber-400" />
                    <span className="flex-1">{item.description}</span>
                    {item.estimatedCost != null && (
                      <span className="font-medium">${item.estimatedCost.toFixed(0)}</span>
                    )}
                  </div>
                ))}
                {pendingDeferred.length > 3 && (
                  <p className="text-xs text-amber-600 pl-5">+{pendingDeferred.length - 3} more</p>
                )}
              </div>
              <p className="text-xs text-amber-600">These will appear on the work order for review.</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-400" />
              Work Description
              {selectedTemplate && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 ml-1">
                  from template
                </Badge>
              )}
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the work to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="border-neutral-200 focus:ring-[#ee7a14] focus:ring-offset-0 focus:border-[#ee7a14] resize-none font-mono text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
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
              {createWorkOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Work Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
