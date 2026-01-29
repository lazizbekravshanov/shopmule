'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventory, useCreatePart, useAdjustStock, useLowStockParts } from '@/lib/queries/inventory';
import { type Part } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const columns: ColumnDef<Part>[] = [
  {
    accessorKey: 'sku',
    header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-neutral-500">{row.original.sku}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium text-neutral-900">{row.original.name}</div>,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <span className="text-neutral-600">{row.original.category || '—'}</span>
    ),
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const stock = row.original.stock;
      const reorderPoint = row.original.reorderPoint;
      const isLow = reorderPoint > 0 && stock <= reorderPoint;
      return (
        <div className="flex items-center gap-2">
          <span className={isLow ? 'text-red-600 font-semibold' : 'text-neutral-900'}>
            {stock}
          </span>
          {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
        </div>
      );
    },
  },
  {
    accessorKey: 'cost',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cost" />,
    cell: ({ row }) => (
      <span className="text-neutral-500">{formatCurrency(row.original.cost)}</span>
    ),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => (
      <span className="font-medium text-neutral-900">{formatCurrency(row.original.price)}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <PartActions part={row.original} />,
  },
];

function PartActions({ part }: { part: Part }) {
  const { toast } = useToast();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const adjustStock = useAdjustStock();

  const handleAdjust = () => {
    if (!quantity) return;
    adjustStock.mutate(
      { id: part.id, quantity: parseInt(quantity) },
      {
        onSuccess: () => {
          toast({ title: 'Stock updated', description: `${part.name} stock set to ${quantity}` });
          setAdjustOpen(false);
          setQuantity('');
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update stock' });
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-neutral-200">
          <DropdownMenuLabel className="text-neutral-500 text-xs">Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setAdjustOpen(true)} className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            Adjust Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="sm:max-w-[400px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Adjust Stock</DialogTitle>
            <DialogDescription className="text-neutral-500">
              {part.name} — Current stock: {part.stock}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="quantity" className="text-sm font-medium text-neutral-700">New Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={part.stock.toString()}
              className="mt-2 border-neutral-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)} className="border-neutral-200">
              Cancel
            </Button>
            <Button
              onClick={handleAdjust}
              disabled={!quantity || adjustStock.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {adjustStock.isPending ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InventoryPage() {
  const { toast } = useToast();
  const { data: parts, isLoading, refetch, isFetching } = useInventory();
  const { data: lowStockParts } = useLowStockParts();
  const [createOpen, setCreateOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');
  const createPart = useCreatePart();

  const handleCreate = () => {
    if (!sku || !name || !cost || !price) return;
    createPart.mutate(
      {
        sku,
        name,
        category: category || undefined,
        cost: parseFloat(cost),
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        reorderPoint: reorderPoint ? parseInt(reorderPoint) : 0,
      },
      {
        onSuccess: () => {
          toast({ title: 'Part created', description: `${name} has been added to inventory` });
          setCreateOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create part'
          });
        },
      }
    );
  };

  const resetForm = () => {
    setSku('');
    setName('');
    setCategory('');
    setCost('');
    setPrice('');
    setStock('');
    setReorderPoint('');
  };

  // Calculate stats
  const totalItems = parts?.length || 0;
  const totalValue = parts?.reduce((sum, p) => sum + (p.stock * p.cost), 0) || 0;
  const lowStockCount = lowStockParts?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Inventory</h1>
          <p className="text-neutral-500 mt-1">Manage parts and supplies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-neutral-200"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
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
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="text-sm text-neutral-500">Total Items</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">{totalItems}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="text-sm text-neutral-500">Inventory Value</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">{formatCurrency(totalValue)}</div>
        </div>
        <div className={`bg-white border rounded-lg p-4 ${lowStockCount > 0 ? 'border-red-200 bg-red-50' : 'border-neutral-200'}`}>
          <div className={`text-sm ${lowStockCount > 0 ? 'text-red-600' : 'text-neutral-500'}`}>Low Stock Items</div>
          <div className={`text-2xl font-semibold mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
            {lowStockCount}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts && lowStockParts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alert
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockParts.map((part) => (
              <span
                key={part.id}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full"
              >
                {part.name}: {part.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-neutral-200 rounded-lg">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={parts ?? []}
            searchKey="name"
            searchPlaceholder="Search parts..."
          />
        )}
      </div>

      {/* Create Part Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Add New Part</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Add a new part or accessory to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium text-neutral-700">SKU *</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="ACC-001"
                  className="border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-neutral-700">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Accessories"
                  className="border-neutral-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-700">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Phone Mount - Universal"
                className="border-neutral-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-sm font-medium text-neutral-700">Cost *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="15.00"
                  className="border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-neutral-700">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="29.99"
                  className="border-neutral-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium text-neutral-700">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderPoint" className="text-sm font-medium text-neutral-700">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  min="0"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(e.target.value)}
                  placeholder="5"
                  className="border-neutral-200"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-neutral-200">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!sku || !name || !cost || !price || createPart.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {createPart.isPending ? 'Creating...' : 'Add Part'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
