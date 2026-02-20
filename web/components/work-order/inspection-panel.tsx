'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
  Loader2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
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
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { workOrderKeys, useAddLabor } from '@/lib/queries/work-orders';
import { api } from '@/lib/api';
import {
  INSPECTION_TEMPLATES,
  newInspection,
  parseChecklist,
  inspectionSummary,
  type InspectionData,
  type InspectionItem,
  type ItemStatus,
} from '@/lib/inspection-templates';
import { cn } from '@/lib/utils';

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  NonNullable<ItemStatus>,
  { label: string; icon: React.ElementType; ring: string; bg: string; text: string }
> = {
  green:  { label: 'Good',     icon: CheckCircle2,    ring: 'ring-emerald-400', bg: 'bg-emerald-500',  text: 'text-white' },
  yellow: { label: 'Monitor',  icon: AlertTriangle,   ring: 'ring-amber-400',   bg: 'bg-amber-400',    text: 'text-white' },
  red:    { label: 'Repair',   icon: XCircle,         ring: 'ring-red-400',     bg: 'bg-red-500',      text: 'text-white' },
  na:     { label: 'N/A',      icon: Minus,           ring: 'ring-neutral-300', bg: 'bg-neutral-200',  text: 'text-neutral-600' },
};

const STATUS_ORDER: NonNullable<ItemStatus>[] = ['green', 'yellow', 'red', 'na'];

// ─── Single inspection item row ────────────────────────────────────────────

function ItemRow({
  item,
  onStatus,
  onNote,
  onAddToWO,
  addingToWO,
}: {
  item: InspectionItem;
  onStatus: (id: string, s: ItemStatus) => void;
  onNote: (id: string, note: string) => void;
  onAddToWO: (item: InspectionItem) => void;
  addingToWO: boolean;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const needsAttention = item.status === 'red' || item.status === 'yellow';

  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2.5 transition-colors',
        item.status === 'red'    ? 'border-red-200    bg-red-50/40'    :
        item.status === 'yellow' ? 'border-amber-200  bg-amber-50/40'  :
        item.status === 'green'  ? 'border-emerald-100 bg-emerald-50/20' :
        'border-neutral-100 bg-white',
      )}
    >
      <div className="flex items-center gap-2">
        {/* Status toggles */}
        <div className="flex items-center gap-1 shrink-0">
          {STATUS_ORDER.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            const active = item.status === s;
            return (
              <button
                key={s}
                title={cfg.label}
                onClick={() => onStatus(item.id, active ? null : s)}
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center transition-all',
                  active
                    ? `${cfg.bg} ${cfg.text} ring-2 ${cfg.ring} ring-offset-1`
                    : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        {/* Label */}
        <span
          className={cn(
            'flex-1 text-sm leading-snug',
            item.status === 'red'    ? 'text-red-800    font-medium' :
            item.status === 'yellow' ? 'text-amber-800  font-medium' :
            item.status === null     ? 'text-neutral-500' :
            'text-neutral-700',
          )}
        >
          {item.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {needsAttention && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[10px] gap-1 px-2 border-neutral-200"
              disabled={addingToWO}
              onClick={() => onAddToWO(item)}
              title="Add this as a labor line on the work order"
            >
              <Wrench className="h-2.5 w-2.5" />
              Add to WO
            </Button>
          )}
          <button
            className="text-[10px] text-neutral-400 hover:text-neutral-600 px-1"
            onClick={() => setNoteOpen((o) => !o)}
            title="Add note"
          >
            {item.note ? '📝' : 'note'}
          </button>
        </div>
      </div>

      {/* Note input (inline expand) */}
      {noteOpen && (
        <div className="mt-2 pl-[7.5rem]">
          <Input
            className="h-7 text-xs"
            placeholder="Add a note…"
            value={item.note}
            onChange={(e) => onNote(item.id, e.target.value)}
            autoFocus
          />
        </div>
      )}

      {item.note && !noteOpen && (
        <p className="mt-1 pl-[7.5rem] text-xs text-neutral-500 italic">{item.note}</p>
      )}
    </div>
  );
}

// ─── Category group ────────────────────────────────────────────────────────

function CategoryGroup({
  category,
  items,
  onStatus,
  onNote,
  onAddToWO,
  addingId,
}: {
  category: string;
  items: InspectionItem[];
  onStatus: (id: string, s: ItemStatus) => void;
  onNote: (id: string, note: string) => void;
  onAddToWO: (item: InspectionItem) => void;
  addingId: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const reds    = items.filter((i) => i.status === 'red').length;
  const yellows = items.filter((i) => i.status === 'yellow').length;

  return (
    <div>
      <button
        className="flex items-center gap-2 w-full mb-1.5 group"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{category}</span>
        {reds > 0    && <span className="text-[10px] font-bold text-red-600    bg-red-50    border border-red-200    px-1.5 py-0.5 rounded">{reds}R</span>}
        {yellows > 0 && <span className="text-[10px] font-bold text-amber-600  bg-amber-50  border border-amber-200  px-1.5 py-0.5 rounded">{yellows}Y</span>}
        <div className="ml-auto text-neutral-300 group-hover:text-neutral-400">
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </div>
      </button>

      {!collapsed && (
        <div className="space-y-1.5">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onStatus={onStatus}
              onNote={onNote}
              onAddToWO={onAddToWO}
              addingToWO={addingId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Summary chips ─────────────────────────────────────────────────────────

function SummaryChips({ data }: { data: InspectionData }) {
  const s = inspectionSummary(data);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {s.red    > 0 && <Badge className="bg-red-500    text-white text-[10px] h-5 px-2">{s.red} Repair</Badge>}
      {s.yellow > 0 && <Badge className="bg-amber-400  text-white text-[10px] h-5 px-2">{s.yellow} Monitor</Badge>}
      {s.green  > 0 && <Badge className="bg-emerald-500 text-white text-[10px] h-5 px-2">{s.green} Good</Badge>}
      {s.pending > 0 && <Badge variant="outline" className="text-neutral-400 text-[10px] h-5 px-2">{s.pending} Pending</Badge>}
    </div>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────

interface InspectionPanelProps {
  workOrderId: string;
  checklistRaw: string | null | undefined;
  defaultLaborRate?: number;
}

export function InspectionPanel({
  workOrderId,
  checklistRaw,
  defaultLaborRate = 125,
}: InspectionPanelProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const addLabor = useAddLabor();

  const [inspection, setInspection] = useState<InspectionData | null>(() =>
    parseChecklist(checklistRaw)
  );
  const [saving, setSaving] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState(INSPECTION_TEMPLATES[0].name);
  const [collapsed, setCollapsed] = useState(!!inspection?.completedAt);

  // Group items by category
  const grouped = useMemo(() => {
    if (!inspection) return {};
    return inspection.items.reduce<Record<string, InspectionItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [inspection]);

  const handleStatus = useCallback((id: string, status: ItemStatus) => {
    setInspection((prev) =>
      prev
        ? { ...prev, items: prev.items.map((i) => (i.id === id ? { ...i, status } : i)) }
        : prev
    );
  }, []);

  const handleNote = useCallback((id: string, note: string) => {
    setInspection((prev) =>
      prev
        ? { ...prev, items: prev.items.map((i) => (i.id === id ? { ...i, note } : i)) }
        : prev
    );
  }, []);

  const handleAddToWO = useCallback(
    (item: InspectionItem) => {
      setAddingId(item.id);
      addLabor.mutate(
        {
          workOrderId,
          hours: 0,
          rate: defaultLaborRate,
          note: `[${item.category}] ${item.label}`,
        },
        {
          onSuccess: () => {
            toast({ title: 'Labor line added', description: item.label });
          },
          onError: (e: unknown) => {
            const msg = e instanceof Error ? e.message : 'Failed to add labor line';
            toast({ variant: 'destructive', title: 'Error', description: msg });
          },
          onSettled: () => setAddingId(null),
        }
      );
    },
    [workOrderId, defaultLaborRate, addLabor, toast]
  );

  const handleSave = useCallback(
    async (complete: boolean) => {
      if (!inspection) return;
      setSaving(true);
      const toSave: InspectionData = {
        ...inspection,
        completedAt: complete ? new Date().toISOString() : inspection.completedAt,
      };
      try {
        await api.workOrders.patch(workOrderId, { checklist: JSON.stringify(toSave) });
        setInspection(toSave);
        qc.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
        toast({ title: complete ? 'Inspection completed' : 'Inspection saved' });
        if (complete) setCollapsed(true);
      } catch {
        toast({ variant: 'destructive', title: 'Failed to save inspection' });
      } finally {
        setSaving(false);
      }
    },
    [inspection, workOrderId, qc, toast]
  );

  const handleStartNew = () => {
    const template = INSPECTION_TEMPLATES.find((t) => t.name === selectedTemplateName);
    if (!template) return;
    setInspection(newInspection(template));
    setTemplatePickerOpen(false);
    setCollapsed(false);
  };

  // ── No inspection state ──
  if (!inspection) {
    return (
      <>
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-neutral-500">
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Vehicle Inspection</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">No inspection started yet.</p>
            <Button
              size="sm"
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white gap-1.5"
              onClick={() => setTemplatePickerOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Start Inspection
            </Button>
          </div>
        </div>

        <TemplatePickerDialog
          open={templatePickerOpen}
          onOpenChange={setTemplatePickerOpen}
          selected={selectedTemplateName}
          onSelect={setSelectedTemplateName}
          onConfirm={handleStartNew}
        />
      </>
    );
  }

  // ── Active or completed inspection ──
  const isComplete = !!inspection.completedAt;

  return (
    <>
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-3.5 cursor-pointer hover:bg-neutral-50 transition-colors"
          onClick={() => setCollapsed((c) => !c)}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-neutral-700">
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-sm font-medium">{inspection.templateName}</span>
            </div>
            {isComplete && (
              <Badge className="bg-emerald-500 text-white text-[10px] h-5 px-2">Completed</Badge>
            )}
            <SummaryChips data={inspection} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isComplete && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={(e) => { e.stopPropagation(); setTemplatePickerOpen(true); }}
              >
                Change
              </Button>
            )}
            {collapsed ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronUp className="h-4 w-4 text-neutral-400" />}
          </div>
        </div>

        {/* Body */}
        {!collapsed && (
          <div className="border-t border-neutral-100 px-6 py-4 space-y-5">
            {Object.entries(grouped).map(([cat, items]) => (
              <CategoryGroup
                key={cat}
                category={cat}
                items={items}
                onStatus={handleStatus}
                onNote={handleNote}
                onAddToWO={handleAddToWO}
                addingId={addingId}
              />
            ))}

            {/* Save actions */}
            {!isComplete && (
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="gap-1"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete Inspection
                </Button>
                <p className="text-xs text-neutral-400 ml-auto">
                  Completing sends the VHR to the customer portal.
                </p>
              </div>
            )}

            {isComplete && (
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-400">
                  Completed {new Date(inspection.completedAt!).toLocaleDateString()}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-7 text-xs"
                  onClick={() => {
                    setInspection({ ...inspection, completedAt: null });
                    setCollapsed(false);
                  }}
                >
                  Reopen
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        selected={selectedTemplateName}
        onSelect={setSelectedTemplateName}
        onConfirm={handleStartNew}
      />
    </>
  );
}

// ─── Template picker dialog ────────────────────────────────────────────────

function TemplatePickerDialog({
  open,
  onOpenChange,
  selected,
  onSelect,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected: string;
  onSelect: (name: string) => void;
  onConfirm: () => void;
}) {
  const selectedTemplate = INSPECTION_TEMPLATES.find((t) => t.name === selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Start Inspection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Inspection Type</label>
            <Select value={selected} onValueChange={onSelect}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSPECTION_TEMPLATES.map((t) => (
                  <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="bg-neutral-50 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-neutral-500">{selectedTemplate.items.length} inspection points</p>
              <div className="flex flex-wrap gap-1">
                {[...new Set(selectedTemplate.items.map((i) => i.category))].map((cat) => (
                  <span key={cat} className="text-[10px] bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={onConfirm}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
          >
            Start Inspection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
