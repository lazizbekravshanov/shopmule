'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/lib/queries/templates';
import type { ServiceTemplate, ServiceTemplateLine } from '@/lib/api';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Preventive Maintenance', 'Inspection', 'Brakes', 'Engine', 'Tires', 'Electrical', 'Other'];

const LINE_TYPE_LABELS: Record<string, string> = {
  LABOR: 'Labor',
  PART: 'Part',
  SUBLET: 'Sublet',
  FEE: 'Fee',
  NOTE: 'Note',
};

const LINE_TYPE_COLORS: Record<string, string> = {
  LABOR: 'bg-blue-50 text-blue-700 border-blue-200',
  PART: 'bg-purple-50 text-purple-700 border-purple-200',
  SUBLET: 'bg-amber-50 text-amber-700 border-amber-200',
  FEE: 'bg-orange-50 text-orange-700 border-orange-200',
  NOTE: 'bg-neutral-50 text-neutral-600 border-neutral-200',
};

// ─── Empty form state ──────────────────────────────────────────────────────

function emptyForm(): Omit<ServiceTemplate, 'id'> {
  return {
    name: '',
    description: '',
    category: '',
    flatRatePrice: null,
    laborHours: null,
    lines: [],
  };
}

function emptyLine(): ServiceTemplateLine {
  return { type: 'LABOR', description: '', quantity: 1, unitPrice: 0, laborHours: null };
}

// ─── Template form (create / edit) ────────────────────────────────────────

function TemplateForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Omit<ServiceTemplate, 'id'>;
  onSave: (data: Omit<ServiceTemplate, 'id'>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }));

  const updateLine = (idx: number, patch: Partial<ServiceTemplateLine>) =>
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));

  const removeLine = (idx: number) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  const valid = form.name.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Name + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-neutral-600">Template Name *</Label>
          <Input
            placeholder="e.g. DOT Annual Inspection"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-neutral-600">Category</Label>
          <Select value={form.category ?? ''} onValueChange={(v) => setField('category', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pick category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Labor hours + Flat rate */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-neutral-600">Standard Labor Hours</Label>
          <Input
            type="number"
            step="0.5"
            min="0"
            placeholder="0.0"
            value={form.laborHours ?? ''}
            onChange={(e) =>
              setField('laborHours', e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-neutral-600">Flat Rate Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.flatRatePrice ?? ''}
            onChange={(e) =>
              setField('flatRatePrice', e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>
      </div>

      {/* Lines */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-neutral-600">Job Lines</Label>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addLine}>
            <Plus className="h-3 w-3" /> Add Line
          </Button>
        </div>

        {form.lines.length === 0 ? (
          <p className="text-xs text-neutral-400 py-2">No lines added yet.</p>
        ) : (
          <div className="space-y-2">
            {form.lines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                <GripVertical className="h-4 w-4 text-neutral-300 mt-2 shrink-0" />
                <div className="flex-1 grid grid-cols-12 gap-2">
                  {/* Type */}
                  <div className="col-span-3">
                    <Select
                      value={line.type}
                      onValueChange={(v) => updateLine(idx, { type: v as ServiceTemplateLine['type'] })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LINE_TYPE_LABELS).map(([v, label]) => (
                          <SelectItem key={v} value={v} className="text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Description */}
                  <div className="col-span-5">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Description"
                      value={line.description}
                      onChange={(e) => updateLine(idx, { description: e.target.value })}
                    />
                  </div>
                  {/* Labor hours (only for LABOR type) */}
                  {line.type === 'LABOR' ? (
                    <div className="col-span-2">
                      <Input
                        className="h-8 text-xs"
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Hrs"
                        value={line.laborHours ?? ''}
                        onChange={(e) =>
                          updateLine(idx, { laborHours: e.target.value ? parseFloat(e.target.value) : null })
                        }
                      />
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <Input
                        className="h-8 text-xs"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={line.unitPrice || ''}
                        onChange={(e) =>
                          updateLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  )}
                  {/* Qty */}
                  <div className="col-span-2">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, { quantity: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-neutral-400 hover:text-red-500 mt-0.5 shrink-0"
                  onClick={() => removeLine(idx)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button
          onClick={() => valid && onSave(form)}
          disabled={!valid || saving}
          className="flex-1 bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Save Template
        </Button>
      </div>
    </div>
  );
}

// ─── Single template row ───────────────────────────────────────────────────

function TemplateRow({
  template,
  onEdit,
  onDelete,
}: {
  template: ServiceTemplate;
  onEdit: (t: ServiceTemplate) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const deleteTemplate = useDeleteTemplate();

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5 bg-white">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-neutral-900">{template.name}</span>
            {template.category && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {template.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-400">
            {template.laborHours != null && <span>{template.laborHours}h standard</span>}
            {template.flatRatePrice != null && <span>${template.flatRatePrice.toFixed(0)} flat rate</span>}
            {template.lines.length > 0 && <span>{template.lines.length} line{template.lines.length > 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(template)}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-neutral-400 hover:text-red-500"
            disabled={deleteTemplate.isPending}
            onClick={() => onDelete(template.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && template.lines.length > 0 && (
        <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-2 space-y-1">
          {template.lines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className={cn('px-1.5 py-0.5 rounded border text-[10px] font-medium', LINE_TYPE_COLORS[line.type])}>
                {LINE_TYPE_LABELS[line.type]}
              </span>
              <span className="text-neutral-700 flex-1">{line.description}</span>
              {line.type === 'LABOR' && line.laborHours != null && (
                <span className="text-neutral-400">{line.laborHours}h</span>
              )}
              {line.type !== 'LABOR' && line.unitPrice > 0 && (
                <span className="text-neutral-400">${line.unitPrice}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main sheet ────────────────────────────────────────────────────────────

interface ManageTemplatesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTemplatesSheet({ open, onOpenChange }: ManageTemplatesSheetProps) {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editTarget, setEditTarget] = useState<ServiceTemplate | null>(null);

  const handleCreate = (data: Omit<ServiceTemplate, 'id'>) => {
    createTemplate.mutate(data, {
      onSuccess: () => {
        toast({ title: 'Template created' });
        setMode('list');
      },
      onError: () => toast({ variant: 'destructive', title: 'Failed to create template' }),
    });
  };

  const handleUpdate = (data: Omit<ServiceTemplate, 'id'>) => {
    if (!editTarget) return;
    updateTemplate.mutate(
      { id: editTarget.id, ...data },
      {
        onSuccess: () => {
          toast({ title: 'Template updated' });
          setMode('list');
          setEditTarget(null);
        },
        onError: () => toast({ variant: 'destructive', title: 'Failed to update template' }),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteTemplate.mutate(id, {
      onSuccess: () => toast({ title: 'Template deleted' }),
      onError: () => toast({ variant: 'destructive', title: 'Failed to delete template' }),
    });
  };

  const startEdit = (t: ServiceTemplate) => {
    setEditTarget(t);
    setMode('edit');
  };

  const grouped = templates.reduce<Record<string, ServiceTemplate[]>>((acc, t) => {
    const cat = t.category ?? 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[560px] flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              {mode === 'create' ? 'New Template' : mode === 'edit' ? 'Edit Template' : 'WO Templates'}
            </SheetTitle>
            {mode === 'list' && (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
                onClick={() => setMode('create')}
              >
                <Plus className="h-3.5 w-3.5" /> New Template
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          {mode === 'create' && (
            <TemplateForm
              initial={emptyForm()}
              onSave={handleCreate}
              onCancel={() => setMode('list')}
              saving={createTemplate.isPending}
            />
          )}

          {mode === 'edit' && editTarget && (
            <TemplateForm
              initial={{
                name: editTarget.name,
                description: editTarget.description,
                category: editTarget.category,
                flatRatePrice: editTarget.flatRatePrice,
                laborHours: editTarget.laborHours,
                lines: editTarget.lines,
              }}
              onSave={handleUpdate}
              onCancel={() => { setMode('list'); setEditTarget(null); }}
              saving={updateTemplate.isPending}
            />
          )}

          {mode === 'list' && (
            <div className="space-y-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  <p>No templates yet.</p>
                  <p className="text-xs mt-1">Create one to speed up work order creation.</p>
                </div>
              ) : (
                Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat} className="space-y-2">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{cat}</p>
                    {items.map((t) => (
                      <TemplateRow
                        key={t.id}
                        template={t}
                        onEdit={startEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
