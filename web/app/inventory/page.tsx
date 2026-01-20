'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory, useCreatePart, useAdjustStock, useLowStockParts } from '@/lib/queries/inventory';
import { type Part } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const columns: ColumnDef<Part>[] = [
  {
    accessorKey: 'sku',
    header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.sku}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => row.original.category || '-',
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const stock = row.original.stock;
      const reorderPoint = row.original.reorderPoint;
      const isLow = stock <= reorderPoint;
      return (
        <div className="flex items-center gap-2">
          <span className={isLow ? 'text-destructive font-medium' : ''}>
            {stock}
          </span>
          {isLow && <AlertTriangle className="h-4 w-4 text-destructive" />}
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: 'cost',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cost" />,
    cell: ({ row }) => formatCurrency(row.original.cost),
  },
  {
    id: 'actions',
    cell: ({ row }) => <PartActions part={row.original} />,
  },
];

function PartActions({ part }: { part: Part }) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const adjustStock = useAdjustStock();

  const handleAdjust = () => {
    if (!quantity) return;
    adjustStock.mutate(
      { id: part.id, quantity: parseInt(quantity) },
      {
        onSuccess: () => {
          setAdjustOpen(false);
          setQuantity('');
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setAdjustOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Adjust Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {part.name} (Current: {part.stock})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="quantity">New Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={part.stock.toString()}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} disabled={!quantity}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InventoryPage() {
  const { data: parts, isLoading } = useInventory();
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
          setCreateOpen(false);
          setSku('');
          setName('');
          setCategory('');
          setCost('');
          setPrice('');
          setStock('');
          setReorderPoint('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage parts and supplies</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Part
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts && lowStockParts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockParts.map((part) => (
                <Badge key={part.id} variant="destructive">
                  {part.name}: {part.stock} left
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Part</DialogTitle>
            <DialogDescription>Add a new part to inventory</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="BRK-001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Brakes"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Brake Pad Set"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cost">Cost *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="25.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="45.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reorderPoint">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!sku || !name || !cost || !price}
            >
              Create Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
