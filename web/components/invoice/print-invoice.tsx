'use client';

import { forwardRef } from 'react';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PrintInvoiceProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    issuedAt: Date | string;
    dueDate?: Date | string | null;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
  };
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  vehicle?: {
    year: number;
    make: string;
    model: string;
    vin: string;
    licensePlate?: string | null;
  } | null;
  lineItems: LineItem[];
  shop: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(
  ({ invoice, customer, vehicle, lineItems, shop }, ref) => {
    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    return (
      <div
        ref={ref}
        className="print-invoice bg-white p-8 max-w-4xl mx-auto"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-neutral-200">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{shop.name}</h1>
            {shop.address && (
              <p className="text-neutral-600 mt-1">{shop.address}</p>
            )}
            {shop.phone && (
              <p className="text-neutral-600">{shop.phone}</p>
            )}
            {shop.email && (
              <p className="text-neutral-600">{shop.email}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-neutral-900">INVOICE</h2>
            <p className="text-neutral-600 mt-2">
              <span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}
            </p>
            <p className="text-neutral-600">
              <span className="font-medium">Date:</span> {formatDate(invoice.issuedAt)}
            </p>
            {invoice.dueDate && (
              <p className="text-neutral-600">
                <span className="font-medium">Due:</span> {formatDate(invoice.dueDate)}
              </p>
            )}
            <p className="mt-2">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                  invoice.status === 'PAID'
                    ? 'bg-green-100 text-green-800'
                    : invoice.status === 'PARTIALLY_PAID'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {invoice.status.replace('_', ' ')}
              </span>
            </p>
          </div>
        </div>

        {/* Bill To / Vehicle Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <p className="font-medium text-neutral-900">{customer.name}</p>
            {customer.email && (
              <p className="text-neutral-600">{customer.email}</p>
            )}
            {customer.phone && (
              <p className="text-neutral-600">{customer.phone}</p>
            )}
            {customer.address && (
              <p className="text-neutral-600 whitespace-pre-line">{customer.address}</p>
            )}
          </div>
          {vehicle && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Vehicle
              </h3>
              <p className="font-medium text-neutral-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="text-neutral-600">VIN: {vehicle.vin}</p>
              {vehicle.licensePlate && (
                <p className="text-neutral-600">Plate: {vehicle.licensePlate}</p>
              )}
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-neutral-200">
              <th className="text-left py-3 text-sm font-medium text-neutral-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-right py-3 text-sm font-medium text-neutral-500 uppercase tracking-wider w-20">
                Qty
              </th>
              <th className="text-right py-3 text-sm font-medium text-neutral-500 uppercase tracking-wider w-28">
                Unit Price
              </th>
              <th className="text-right py-3 text-sm font-medium text-neutral-500 uppercase tracking-wider w-28">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b border-neutral-100">
                <td className="py-3 text-neutral-900">{item.description}</td>
                <td className="py-3 text-right text-neutral-600">{item.quantity}</td>
                <td className="py-3 text-right text-neutral-600">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-3 text-right text-neutral-900 font-medium">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Subtotal</span>
              <span className="text-neutral-900">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Tax</span>
              <span className="text-neutral-900">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold">
              <span className="text-neutral-900">Total</span>
              <span className="text-neutral-900">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-neutral-200 text-center text-sm text-neutral-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">
            Questions? Contact us at {shop.email || shop.phone}
          </p>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-invoice,
            .print-invoice * {
              visibility: visible;
            }
            .print-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20mm;
              font-size: 12pt;
            }
            @page {
              size: letter;
              margin: 0;
            }
          }
        `}</style>
      </div>
    );
  }
);

PrintInvoice.displayName = 'PrintInvoice';
