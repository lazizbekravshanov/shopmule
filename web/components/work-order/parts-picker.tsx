'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Package,
  Search,
  Plus,
  Loader2,
  Tag,
  Truck,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Part, type PartSearchResult } from '@/lib/api';
import { workOrderKeys } from '@/lib/queries/work-orders';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const DEFAULT_MARKUP = 0.15;

// ─── Single result row ───────────────────────────────────────────────────────

function InventoryPartRow({
  part,
  workOrderId,
  onAdded,
}: {
  part: Part;
  workOrderId: string;
  onAdded: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState(part.price.toFixed(2));
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await api.workOrders.addParts(workOrderId, {
        partId: part.id,
        quantity: Math.max(1, parseInt(qty) || 1),
        unitPrice: parseFloat(price) || part.price,
        markupPct: DEFAULT_MARKUP,
      });
      qc.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
      setAdded(true);
      toast({ title: 'Part added', description: part.name });
      onAdded();
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to add part';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setAdding(false);
    }
  };

  const lowStock = part.stock <= part.reorderPoint;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-neutral-900 leading-snug">{part.name}</span>
            {lowStock && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <AlertTriangle className="h-2.5 w-2.5" />
                Low Stock
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
            <span className="font-mono">{part.sku}</span>
            {part.category && <span>· {part.category}</span>}
            <span className="text-emerald-600 font-medium">{formatCurrency(part.price)}</span>
            <span>· {part.stock} on hand</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <Button
            size="sm"
            className={cn(
              'h-7 text-[10px] px-2 gap-1',
              added ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : 'bg-[#ee7a14] hover:bg-[#d96a0a] text-white'
            )}
            disabled={adding || added}
            onClick={handleAdd}
          >
            {adding ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : added ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <Plus className="h-2.5 w-2.5" />
            )}
            {added ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-100">
          <div className="space-y-1">
            <Label className="text-[10px] text-neutral-400">Quantity</Label>
            <Input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-neutral-400">Unit Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CatalogPartRow({
  part,
  workOrderId,
  onAdded,
}: {
  part: PartSearchResult['catalog'][number];
  workOrderId: string;
  onAdded: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState(part.price.toFixed(2));
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await api.workOrders.addParts(workOrderId, {
        sku: part.sku,
        name: part.name,
        category: part.category,
        brand: part.brand,
        supplier: part.supplier,
        quantity: Math.max(1, parseInt(qty) || 1),
        unitPrice: parseFloat(price) || part.price,
        markupPct: DEFAULT_MARKUP,
      });
      qc.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
      setAdded(true);
      toast({ title: 'Part added', description: `${part.name} (from ${part.supplier})` });
      onAdded();
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to add part';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/30 px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-neutral-900 leading-snug">{part.name}</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-blue-200 text-blue-600 bg-white">
              {part.brand}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
            <span className="font-mono">{part.sku}</span>
            <span>· {part.supplier}</span>
            <span className="text-emerald-600 font-medium">{formatCurrency(part.price)}</span>
          </div>
          {part.notes && (
            <p className="text-[10px] text-neutral-400 mt-0.5">{part.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <Button
            size="sm"
            className={cn(
              'h-7 text-[10px] px-2 gap-1',
              added ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : 'bg-[#ee7a14] hover:bg-[#d96a0a] text-white'
            )}
            disabled={adding || added}
            onClick={handleAdd}
          >
            {adding ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : added ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <Plus className="h-2.5 w-2.5" />
            )}
            {added ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-100">
          <div className="space-y-1">
            <Label className="text-[10px] text-neutral-400">Quantity</Label>
            <Input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-neutral-400">Unit Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

interface PartsPickerProps {
  workOrderId: string;
  onClose: () => void;
}

export function PartsPicker({ workOrderId, onClose }: PartsPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PartSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setSearching(true);
    try {
      const data = await api.parts.search(q);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 280);
  };

  const hasInventory = (results?.inventory.length ?? 0) > 0;
  const hasCatalog   = (results?.catalog.length ?? 0) > 0;
  const hasResults   = hasInventory || hasCatalog;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <Package className="h-4 w-4 text-[#ee7a14]" />
        <span className="text-sm font-medium text-neutral-800">Add Parts</span>
        <span className="text-xs text-neutral-400">Shop inventory + HD catalog</span>
        <button
          onClick={onClose}
          className="ml-auto text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-neutral-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            ref={inputRef}
            placeholder="Search by SKU, part name, brand… (e.g. Bendix, ISX, brake drum)"
            value={query}
            onChange={handleQueryChange}
            className="pl-8 text-sm h-9"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="overflow-y-auto max-h-[460px] px-4 py-3 space-y-4">
        {!query || query.length < 2 ? (
          <div className="text-center py-8 text-sm text-neutral-400 space-y-2">
            <Package className="h-8 w-8 mx-auto text-neutral-200" />
            <p>Type to search shop inventory and the HD parts catalog</p>
            <p className="text-xs text-neutral-300">
              Includes Bendix, Cummins, Haldex, Stemco, Fleetguard, Eaton and more
            </p>
          </div>
        ) : !searching && !hasResults ? (
          <div className="text-center py-8 text-sm text-neutral-400">
            No parts found for &quot;{query}&quot;
          </div>
        ) : (
          <>
            {/* Shop Inventory */}
            {hasInventory && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-2">
                  <Tag className="h-3 w-3" />
                  Shop Inventory ({results!.inventory.length})
                </div>
                {results!.inventory.map((part) => (
                  <InventoryPartRow
                    key={part.id}
                    part={part}
                    workOrderId={workOrderId}
                    onAdded={() => {}}
                  />
                ))}
              </div>
            )}

            {/* HD Catalog */}
            {hasCatalog && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-2">
                  <Truck className="h-3 w-3 text-blue-500" />
                  <span>HD Catalog</span>
                  <span className="text-neutral-400">({results!.catalog.length})</span>
                  <span className="text-[10px] text-neutral-400 ml-auto">Adds to inventory on use</span>
                </div>
                {results!.catalog.map((part) => (
                  <CatalogPartRow
                    key={part.sku}
                    part={part}
                    workOrderId={workOrderId}
                    onAdded={() => {}}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
