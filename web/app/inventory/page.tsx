'use client';

import { useState, useReducer, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Search,
  X,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  LayoutGrid,
  List,
  Minus,
  RefreshCw,
  Loader2,
} from 'lucide-react';
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
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useInventory,
  useCreatePart,
  useAdjustStock,
  useLowStockParts,
} from '@/lib/queries/inventory';
import { type Part } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type StockFilter = 'all' | 'in-stock' | 'low' | 'out';
type ViewMode = 'grid' | 'list';

type FormState = {
  sku: string;
  name: string;
  category: string;
  cost: string;
  price: string;
  stock: string;
  reorderPoint: string;
};

type FormAction = { field: keyof FormState; value: string } | { type: 'reset' };

const INITIAL_FORM: FormState = {
  sku: '',
  name: '',
  category: '',
  cost: '',
  price: '',
  stock: '',
  reorderPoint: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
  if ('type' in action) return INITIAL_FORM;
  return { ...state, [action.field]: action.value };
}

// ─── Stock Bar ────────────────────────────────────────────────────────────────

function StockBar({ stock, reorderPoint }: { stock: number; reorderPoint: number }) {
  if (reorderPoint === 0) return null;
  const max = Math.max(reorderPoint * 3, stock, 1);
  const pct = Math.min((stock / max) * 100, 100);
  const isOut = stock === 0;
  const isLow = stock > 0 && stock <= reorderPoint;
  const barColor = isOut
    ? 'bg-red-500'
    : isLow
    ? 'bg-amber-400'
    : 'bg-emerald-500';

  return (
    <div className="space-y-1">
      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-neutral-400">
        <span>{stock} in stock</span>
        <span>reorder at {reorderPoint}</span>
      </div>
    </div>
  );
}

// ─── Part Card ────────────────────────────────────────────────────────────────

function PartCard({
  part,
  onAdjust,
  adjustingId,
}: {
  part: Part;
  onAdjust: (part: Part, delta: number) => void;
  adjustingId: string | null;
}) {
  const isPending = adjustingId === part.id;
  const margin =
    part.price > 0 && part.cost >= 0
      ? (((part.price - part.cost) / part.price) * 100).toFixed(1)
      : null;
  const isLow = part.reorderPoint > 0 && part.stock > 0 && part.stock <= part.reorderPoint;
  const isOut = part.stock === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-500 whitespace-nowrap">
              {part.sku}
            </span>
            {part.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium whitespace-nowrap">
                {part.category}
              </span>
            )}
          </div>
          {isOut ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium whitespace-nowrap flex-shrink-0">
              Out of stock
            </span>
          ) : isLow ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap flex-shrink-0">
              Low stock
            </span>
          ) : null}
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm leading-snug line-clamp-2">
          {part.name}
        </h3>
        {part.vendor?.name && (
          <p className="text-[11px] text-neutral-400 truncate">{part.vendor.name}</p>
        )}
      </div>

      {/* Stock bar */}
      <StockBar stock={part.stock} reorderPoint={part.reorderPoint} />

      {/* Pricing grid */}
      <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-neutral-100 dark:border-neutral-700">
        <div>
          <div className="text-[10px] text-neutral-400 mb-0.5">Cost</div>
          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {formatCurrency(part.cost)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-neutral-400 mb-0.5">Price</div>
          <div className="text-xs font-semibold text-neutral-900 dark:text-white">
            {formatCurrency(part.price)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-neutral-400 mb-0.5">Margin</div>
          <div
            className={cn(
              'text-xs font-semibold',
              margin && parseFloat(margin) > 30
                ? 'text-emerald-600'
                : margin && parseFloat(margin) > 0
                ? 'text-amber-600'
                : 'text-neutral-400'
            )}
          >
            {margin ? `${margin}%` : '—'}
          </div>
        </div>
      </div>

      {/* Inline stock adjust */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">Adjust stock</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg border-neutral-200 dark:border-neutral-600"
            disabled={isPending || part.stock === 0}
            onClick={() => onAdjust(part, -1)}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
          </Button>
          <span className="w-8 text-center text-sm font-bold text-neutral-900 dark:text-white tabular-nums">
            {part.stock}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg border-neutral-200 dark:border-neutral-600"
            disabled={isPending}
            onClick={() => onAdjust(part, 1)}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-800 border rounded-2xl p-5',
        accent
          ? 'border-red-200 dark:border-red-800'
          : 'border-neutral-200 dark:border-neutral-700'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          {label}
        </span>
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            accent
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-neutral-100 dark:bg-neutral-700'
          )}
        >
          <Icon
            className={cn('w-4 h-4', accent ? 'text-red-500' : 'text-neutral-500')}
          />
        </div>
      </div>
      <div
        className={cn(
          'text-2xl font-bold tabular-nums',
          accent
            ? 'text-red-600 dark:text-red-400'
            : 'text-neutral-900 dark:text-white'
        )}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-neutral-400 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Add Part Modal ───────────────────────────────────────────────────────────

function AddPartModal({
  open,
  onOpenChange,
  categories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: string[];
}) {
  const { toast } = useToast();
  const [form, dispatch] = useReducer(formReducer, INITIAL_FORM);
  const createPart = useCreatePart();

  const margin = useMemo(() => {
    const c = parseFloat(form.cost);
    const p = parseFloat(form.price);
    if (!isNaN(c) && !isNaN(p) && p > 0) return (((p - c) / p) * 100).toFixed(1);
    return null;
  }, [form.cost, form.price]);

  const set =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({
        field,
        value: field === 'sku' ? e.target.value.toUpperCase() : e.target.value,
      });

  const handleCreate = () => {
    if (!form.sku || !form.name || !form.cost || !form.price) return;
    createPart.mutate(
      {
        sku: form.sku,
        name: form.name,
        category: form.category || undefined,
        cost: parseFloat(form.cost),
        price: parseFloat(form.price),
        stock: form.stock ? parseInt(form.stock) : 0,
        reorderPoint: form.reorderPoint ? parseInt(form.reorderPoint) : 0,
      },
      {
        onSuccess: () => {
          toast({ title: 'Part added', description: `${form.name} is now in inventory` });
          dispatch({ type: 'reset' });
          onOpenChange(false);
        },
        onError: (err) =>
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              err instanceof Error ? err.message : 'Failed to create part',
          }),
      }
    );
  };

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) dispatch({ type: 'reset' });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-neutral-200 dark:border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Part</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Fill in the details to add a part to your inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">SKU *</Label>
              <Input
                value={form.sku}
                onChange={set('sku')}
                placeholder="OIL-5W30"
                className="border-neutral-200 font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Category</Label>
              <Input
                value={form.category}
                onChange={set('category')}
                placeholder="Filters, Brakes…"
                className="border-neutral-200 text-sm"
                list="cat-suggestions"
              />
              <datalist id="cat-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-600">Part Name *</Label>
            <Input
              value={form.name}
              onChange={set('name')}
              placeholder="Oil Filter — Toyota Camry 2018+"
              className="border-neutral-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Cost *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={set('cost')}
                placeholder="12.00"
                className="border-neutral-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Sell Price *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={set('price')}
                placeholder="24.99"
                className="border-neutral-200"
              />
            </div>
          </div>

          {/* Live margin preview */}
          <AnimatePresence>
            {margin !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                    parseFloat(margin) > 30
                      ? 'bg-emerald-50 text-emerald-700'
                      : parseFloat(margin) > 0
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                  )}
                >
                  <TrendingUp className="h-4 w-4 flex-shrink-0" />
                  {parseFloat(margin) > 0
                    ? `${margin}% margin — ${parseFloat(margin) > 30 ? 'Great markup' : 'Low margin, consider raising price'}`
                    : 'Selling below cost'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Initial Stock</Label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={set('stock')}
                placeholder="0"
                className="border-neutral-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">Reorder Point</Label>
              <Input
                type="number"
                min="0"
                value={form.reorderPoint}
                onChange={set('reorderPoint')}
                placeholder="5"
                className="border-neutral-200"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-neutral-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!form.sku || !form.name || !form.cost || !form.price || createPart.isPending}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
          >
            {createPart.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Part
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { toast } = useToast();
  const { data: parts, isLoading, refetch, isFetching } = useInventory();
  const { data: lowStockParts } = useLowStockParts();
  const adjustStock = useAdjustStock();

  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          (parts ?? []).map((p) => p.category).filter(Boolean) as string[]
        ),
      ].sort(),
    [parts]
  );

  const stats = useMemo(() => {
    const all = parts ?? [];
    const inventoryValue = all.reduce((sum, p) => sum + p.stock * p.cost, 0);
    const avgMargin =
      all.length > 0
        ? all.reduce(
            (sum, p) =>
              sum + (p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0),
            0
          ) / all.length
        : 0;
    return {
      totalSkus: all.length,
      inventoryValue,
      avgMargin,
      lowStockCount: (lowStockParts ?? []).length,
    };
  }, [parts, lowStockParts]);

  const filtered = useMemo(() => {
    return (parts ?? []).filter((p) => {
      const q = search.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q))
        return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (stockFilter === 'out') return p.stock === 0;
      if (stockFilter === 'low')
        return p.reorderPoint > 0 && p.stock > 0 && p.stock <= p.reorderPoint;
      if (stockFilter === 'in-stock') return p.stock > 0;
      return true;
    });
  }, [parts, search, categoryFilter, stockFilter]);

  const handleStockAdjust = useCallback(
    (part: Part, delta: number) => {
      const newQty = Math.max(0, part.stock + delta);
      setAdjustingId(part.id);
      adjustStock.mutate(
        { id: part.id, quantity: newQty },
        {
          onSuccess: () =>
            toast({
              title: 'Stock updated',
              description: `${part.name}: ${part.stock} → ${newQty}`,
            }),
          onError: () =>
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to update stock',
            }),
          onSettled: () => setAdjustingId(null),
        }
      );
    },
    [adjustStock, toast]
  );

  const columns: ColumnDef<Part>[] = useMemo(
    () => [
      {
        accessorKey: 'sku',
        header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-neutral-500">{row.original.sku}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <div className="font-medium text-neutral-900 dark:text-white">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) =>
          row.original.category ? (
            <span className="text-xs px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
              {row.original.category}
            </span>
          ) : (
            <span className="text-neutral-400">—</span>
          ),
      },
      {
        accessorKey: 'stock',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Stock" />
        ),
        cell: ({ row }) => {
          const { stock, reorderPoint, id } = row.original;
          const isLow = reorderPoint > 0 && stock <= reorderPoint;
          const isPending = adjustingId === id;
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded border border-neutral-200 dark:border-neutral-600"
                disabled={isPending || stock === 0}
                onClick={() => handleStockAdjust(row.original, -1)}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
              </Button>
              <span
                className={cn(
                  'text-sm font-bold tabular-nums w-8 text-center',
                  isLow
                    ? 'text-amber-600'
                    : stock === 0
                    ? 'text-red-600'
                    : 'text-neutral-900 dark:text-white'
                )}
              >
                {stock}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded border border-neutral-200 dark:border-neutral-600"
                disabled={isPending}
                onClick={() => handleStockAdjust(row.original, 1)}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </Button>
              {isLow && stock > 0 && (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
              {stock === 0 && (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'cost',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cost" />
        ),
        cell: ({ row }) => (
          <span className="text-neutral-500 text-sm">
            {formatCurrency(row.original.cost)}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-neutral-900 dark:text-white text-sm">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        id: 'margin',
        header: 'Margin',
        accessorFn: (row) =>
          row.price > 0 ? ((row.price - row.cost) / row.price) * 100 : 0,
        cell: ({ row }) => {
          const m =
            row.original.price > 0
              ? (
                  ((row.original.price - row.original.cost) /
                    row.original.price) *
                  100
                ).toFixed(1)
              : null;
          return m ? (
            <span
              className={cn(
                'text-sm font-medium',
                parseFloat(m) > 30 ? 'text-emerald-600' : 'text-amber-600'
              )}
            >
              {m}%
            </span>
          ) : (
            <span className="text-neutral-400">—</span>
          );
        },
      },
    ],
    [adjustingId, handleStockAdjust]
  );

  const showBanner = !bannerDismissed && (lowStockParts?.length ?? 0) > 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Inventory
          </h1>
          <p className="text-neutral-500 mt-0.5 text-sm">Manage parts and supplies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-neutral-200 dark:border-neutral-700"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={Package}
            label="Total SKUs"
            value={String(stats.totalSkus)}
            sub={filtered.length !== stats.totalSkus ? `${filtered.length} shown` : 'all parts'}
          />
          <StatCard
            icon={DollarSign}
            label="Inventory Value"
            value={formatCurrency(stats.inventoryValue)}
            sub="at cost"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Margin"
            value={`${stats.avgMargin.toFixed(1)}%`}
            sub="across all parts"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock"
            value={String(stats.lowStockCount)}
            sub={stats.lowStockCount > 0 ? 'needs restocking' : 'all good'}
            accent={stats.lowStockCount > 0}
          />
        </motion.div>
      )}

      {/* Low Stock Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                      {stats.lowStockCount} item
                      {stats.lowStockCount !== 1 ? 's' : ''} need restocking
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lowStockParts?.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSearch(p.name);
                            setStockFilter('all');
                          }}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                        >
                          {p.name}: {p.stock} left
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-amber-600 hover:text-amber-800 hover:bg-amber-100 flex-shrink-0"
                  onClick={() => setBannerDismissed(true)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="pl-9 border-neutral-200 dark:border-neutral-700"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px] border-neutral-200 dark:border-neutral-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Stock filter pills */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {(
            [
              ['all', 'All'],
              ['in-stock', 'In Stock'],
              ['low', 'Low'],
              ['out', 'Out'],
            ] as [StockFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStockFilter(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                stockFilter === value
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {(
            [
              ['grid', LayoutGrid],
              ['list', List],
            ] as [ViewMode, React.ElementType][]
          ).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'p-1.5 rounded-md transition-all',
                view === v
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[260px] rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          </div>
          <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {parts?.length ? 'No parts match your filters' : 'No parts yet'}
          </p>
          <p className="text-sm text-neutral-400 mb-6">
            {parts?.length
              ? 'Try adjusting the search or filter'
              : 'Add your first part to start tracking inventory'}
          </p>
          {!parts?.length && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Part
            </Button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((part) => (
              <PartCard
                key={part.id}
                part={part}
                onAdjust={handleStockAdjust}
                adjustingId={adjustingId}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
          <DataTable columns={columns} data={filtered} />
        </div>
      )}

      <AddPartModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
      />
    </div>
  );
}
