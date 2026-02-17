'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Printer,
  Plus,
  Trash2,
  Wrench,
  Package,
  ReceiptText,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  generateInvoicePDF,
  invoiceToBlob,
  downloadInvoice,
  type InvoiceData,
} from '@/lib/services/pdf-generator';
import { buildInvoiceData } from '@/components/invoice/invoice-preview-sheet';

interface LaborItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
}

interface PartItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface MiscItem {
  id: string;
  description: string;
  amount: number;
}

interface InvoiceCustomizerProps {
  invoice: any;
}

let idCounter = 0;
const nextId = () => `custom-${++idCounter}`;

export function InvoiceCustomizer({ invoice }: InvoiceCustomizerProps) {
  // Initialize editable state from invoice data
  const baseData = useMemo(() => buildInvoiceData(invoice), [invoice]);

  const [laborItems, setLaborItems] = useState<LaborItem[]>(() =>
    baseData.laborItems.map((l, i) => ({
      id: `labor-${i}`,
      description: l.description,
      hours: l.hours,
      rate: l.rate,
      total: l.total,
    }))
  );

  const [partsItems, setPartsItems] = useState<PartItem[]>(() =>
    baseData.partsItems.map((p, i) => ({
      id: `part-${i}`,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.total,
    }))
  );

  const [miscItems, setMiscItems] = useState<MiscItem[]>(() =>
    (baseData.miscItems || []).map((m, i) => ({
      id: `misc-${i}`,
      description: m.description,
      amount: m.amount,
    }))
  );

  const [taxRate, setTaxRate] = useState(() => baseData.taxRate * 100);
  const [discount, setDiscount] = useState(() => baseData.discount);
  const [notes, setNotes] = useState(() => baseData.notes || '');
  const [paymentTerms, setPaymentTerms] = useState(() => baseData.paymentTerms || 'Net 30');
  const [footerText, setFooterText] = useState(() => baseData.footerText || '');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Computed totals
  const subtotalLabor = laborItems.reduce((sum, l) => sum + l.hours * l.rate, 0);
  const subtotalParts = partsItems.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const subtotalMisc = miscItems.reduce((sum, m) => sum + m.amount, 0);
  const subtotal = subtotalLabor + subtotalParts + subtotalMisc;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax - discount;
  const amountPaid = baseData.amountPaid;
  const balanceDue = total - amountPaid;

  // Build current invoice data for PDF
  const currentInvoiceData = useMemo<InvoiceData>(() => ({
    ...baseData,
    laborItems: laborItems.map((l) => ({
      description: l.description,
      hours: l.hours,
      rate: l.rate,
      total: l.hours * l.rate,
    })),
    partsItems: partsItems.map((p) => ({
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.quantity * p.unitPrice,
    })),
    miscItems: miscItems.map((m) => ({
      description: m.description,
      amount: m.amount,
    })),
    subtotalLabor,
    subtotalParts,
    subtotalMisc,
    tax,
    taxRate: taxRate / 100,
    discount,
    total,
    balanceDue,
    notes: notes || undefined,
    paymentTerms,
    footerText: footerText || undefined,
  }), [baseData, laborItems, partsItems, miscItems, subtotalLabor, subtotalParts, subtotalMisc, tax, taxRate, discount, total, balanceDue, notes, paymentTerms, footerText]);

  // Generate PDF preview with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const doc = generateInvoicePDF(currentInvoiceData);
        const blob = invoiceToBlob(doc);
        const url = URL.createObjectURL(blob);
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {
        setPdfUrl(null);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentInvoiceData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);

  const handleDownload = useCallback(() => {
    const doc = generateInvoicePDF(currentInvoiceData);
    downloadInvoice(doc, `${currentInvoiceData.invoiceNumber}.pdf`);
  }, [currentInvoiceData]);

  const handlePrint = useCallback(() => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl);
    printWindow?.addEventListener('load', () => printWindow.print());
  }, [pdfUrl]);

  // Labor handlers
  const addLabor = () => {
    setLaborItems((prev) => [...prev, { id: nextId(), description: '', hours: 1, rate: 100, total: 100 }]);
  };
  const updateLabor = (id: string, field: keyof LaborItem, value: string | number) => {
    setLaborItems((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };
  const removeLabor = (id: string) => {
    setLaborItems((prev) => prev.filter((l) => l.id !== id));
  };

  // Parts handlers
  const addPart = () => {
    setPartsItems((prev) => [...prev, { id: nextId(), name: '', sku: '-', quantity: 1, unitPrice: 0, total: 0 }]);
  };
  const updatePart = (id: string, field: keyof PartItem, value: string | number) => {
    setPartsItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };
  const removePart = (id: string) => {
    setPartsItems((prev) => prev.filter((p) => p.id !== id));
  };

  // Misc handlers
  const addMisc = () => {
    setMiscItems((prev) => [...prev, { id: nextId(), description: '', amount: 0 }]);
  };
  const updateMisc = (id: string, field: keyof MiscItem, value: string | number) => {
    setMiscItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };
  const removeMisc = (id: string) => {
    setMiscItems((prev) => prev.filter((m) => m.id !== id));
  };

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    UNPAID: 'bg-red-100 text-red-700',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column — Editor */}
      <div className="space-y-6">
        {/* Invoice header info */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            INV-{invoice.id.slice(-6).toUpperCase()}
          </h2>
          <Badge className={statusColors[invoice.status] || 'bg-neutral-100 text-neutral-700'}>
            {invoice.status}
          </Badge>
        </div>

        {/* Labor Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-neutral-400" />
              Labor
            </h3>
            <Button variant="ghost" size="sm" onClick={addLabor} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
          {laborItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs w-20">Hours</TableHead>
                  <TableHead className="text-xs w-24">Rate</TableHead>
                  <TableHead className="text-xs w-24 text-right">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {laborItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-1">
                      <Input
                        value={item.description}
                        onChange={(e) => updateLabor(item.id, 'description', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="number"
                        step="0.5"
                        value={item.hours}
                        onChange={(e) => updateLabor(item.id, 'hours', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm w-20"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="number"
                        step="1"
                        value={item.rate}
                        onChange={(e) => updateLabor(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm w-24"
                      />
                    </TableCell>
                    <TableCell className="p-1 text-right text-sm font-medium">
                      {formatCurrency(item.hours * item.rate)}
                    </TableCell>
                    <TableCell className="p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-red-500"
                        onClick={() => removeLabor(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-3">No labor items</p>
          )}
          <div className="flex justify-end mt-2 text-sm font-medium text-neutral-700">
            Subtotal: {formatCurrency(subtotalLabor)}
          </div>
        </div>

        {/* Parts Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-400" />
              Parts
            </h3>
            <Button variant="ghost" size="sm" onClick={addPart} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
          {partsItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Part Name</TableHead>
                  <TableHead className="text-xs w-16">Qty</TableHead>
                  <TableHead className="text-xs w-24">Price</TableHead>
                  <TableHead className="text-xs w-24 text-right">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {partsItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-1">
                      <Input
                        value={item.name}
                        onChange={(e) => updatePart(item.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="number"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updatePart(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="h-8 text-sm w-16"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updatePart(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm w-24"
                      />
                    </TableCell>
                    <TableCell className="p-1 text-right text-sm font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                    <TableCell className="p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-red-500"
                        onClick={() => removePart(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-3">No parts</p>
          )}
          <div className="flex justify-end mt-2 text-sm font-medium text-neutral-700">
            Subtotal: {formatCurrency(subtotalParts)}
          </div>
        </div>

        {/* Miscellaneous Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-neutral-400" />
              Other Charges
            </h3>
            <Button variant="ghost" size="sm" onClick={addMisc} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
          {miscItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs w-28">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {miscItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-1">
                      <Input
                        value={item.description}
                        onChange={(e) => updateMisc(item.id, 'description', e.target.value)}
                        placeholder="e.g. Shop supplies, towing, disposal"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => updateMisc(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm w-28"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-red-500"
                        onClick={() => removeMisc(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-3">
              No additional charges — add towing, disposal fees, shop supplies, etc.
            </p>
          )}
          {miscItems.length > 0 && (
            <div className="flex justify-end mt-2 text-sm font-medium text-neutral-700">
              Subtotal: {formatCurrency(subtotalMisc)}
            </div>
          )}
        </div>

        {/* Financials */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-neutral-400" />
            Financials
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-neutral-500">Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Discount ($)</Label>
              <Input
                type="number"
                step="1"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Totals summary */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal (Labor)</span>
              <span>{formatCurrency(subtotalLabor)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal (Parts)</span>
              <span>{formatCurrency(subtotalParts)}</span>
            </div>
            {subtotalMisc > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal (Other)</span>
                <span>{formatCurrency(subtotalMisc)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>Tax ({taxRate.toFixed(1)}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-neutral-900 text-base">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {amountPaid > 0 && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>Paid</span>
                  <span>-{formatCurrency(amountPaid)}</span>
                </div>
                <div className="flex justify-between font-semibold text-orange-600">
                  <span>Balance Due</span>
                  <span>{formatCurrency(balanceDue)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes & Footer */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4">
          <div>
            <Label className="text-xs text-neutral-500">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes or customer-facing message"
              className="mt-1 min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-xs text-neutral-500">Footer Text</Label>
            <Input
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Thank you for your business!"
              className="h-9 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Right column — Live PDF Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700">Live Preview</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-lg border-neutral-200"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="rounded-lg bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="sticky top-4">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[calc(100vh-180px)] min-h-[600px] rounded-xl border border-neutral-200 bg-white"
              title="Invoice PDF Live Preview"
            />
          ) : (
            <div className="w-full h-[600px] rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
              <p className="text-sm text-neutral-400">Generating preview...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
