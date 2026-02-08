import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;

  // Shop info
  shopName: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;

  // Customer info
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;

  // Vehicle info
  vehicleInfo: string;
  vehicleVin?: string;
  vehicleMileage?: number;

  // Work order info
  workOrderId: string;
  workOrderDescription: string;

  // Line items
  laborItems: Array<{
    description: string;
    hours: number;
    rate: number;
    total: number;
  }>;

  partsItems: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  // Totals
  subtotalLabor: number;
  subtotalParts: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;

  // Payments
  payments: Array<{
    date: string;
    method: string;
    amount: number;
  }>;
  amountPaid: number;
  balanceDue: number;

  // Notes
  notes?: string;
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Colors
  const primaryColor: [number, number, number] = [238, 122, 20]; // #ee7a14
  const textColor: [number, number, number] = [24, 24, 27];
  const mutedColor: [number, number, number] = [113, 113, 122];
  const lineColor: [number, number, number] = [228, 228, 231];

  // Helper functions
  const drawLine = (yPos: number) => {
    doc.setDrawColor(...lineColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Header - Shop Logo/Name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.shopName, margin, 26);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (data.shopAddress) {
    doc.text(data.shopAddress, margin, 34);
  }

  // Shop contact on right side
  const rightCol = pageWidth - margin;
  if (data.shopPhone) {
    doc.text(data.shopPhone, rightCol, 26, { align: 'right' });
  }
  if (data.shopEmail) {
    doc.text(data.shopEmail, rightCol, 34, { align: 'right' });
  }

  y = 55;

  // Invoice title and number
  doc.setTextColor(...textColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, y);

  doc.setFontSize(12);
  doc.setTextColor(...mutedColor);
  doc.text(data.invoiceNumber, margin, y + 8);

  y += 25;

  // Two column layout: Bill To and Invoice Details
  const colWidth = (pageWidth - margin * 3) / 2;

  // Bill To
  doc.setTextColor(...mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  y += 6;
  doc.text(data.customerName, margin, y);
  if (data.customerAddress) {
    y += 5;
    doc.text(data.customerAddress, margin, y);
  }
  if (data.customerPhone) {
    y += 5;
    doc.text(data.customerPhone, margin, y);
  }
  if (data.customerEmail) {
    y += 5;
    doc.text(data.customerEmail, margin, y);
  }

  // Invoice Details (right column)
  let detailY = 80;
  const detailX = margin + colWidth + margin;

  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DETAILS', detailX, detailY);

  detailY += 6;
  doc.setFont('helvetica', 'normal');

  const addDetail = (label: string, value: string) => {
    doc.setTextColor(...mutedColor);
    doc.text(label, detailX, detailY);
    doc.setTextColor(...textColor);
    doc.text(value, detailX + 50, detailY);
    detailY += 5;
  };

  addDetail('Date:', data.invoiceDate);
  addDetail('Due Date:', data.dueDate);
  addDetail('Work Order:', data.workOrderId);

  y = Math.max(y, detailY) + 10;

  // Vehicle Info
  doc.setFillColor(248, 248, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, 'F');

  y += 7;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text('VEHICLE', margin + 5, y);

  y += 5;
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.vehicleInfo, margin + 5, y);

  if (data.vehicleVin) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedColor);
    doc.text(`VIN: ${data.vehicleVin}`, margin + 100, y);
  }
  if (data.vehicleMileage) {
    doc.text(`Mileage: ${data.vehicleMileage.toLocaleString()}`, pageWidth - margin - 5 - 50, y);
  }

  y += 15;

  // Work Description
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text('DESCRIPTION', margin, y);
  y += 5;
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Word wrap description
  const descLines = doc.splitTextToSize(data.workOrderDescription, pageWidth - margin * 2);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 10;

  drawLine(y);
  y += 10;

  // Labor Items Table
  if (data.laborItems.length > 0) {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('LABOR', margin, y);
    y += 8;

    // Table header
    doc.setFillColor(248, 248, 249);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');

    doc.setTextColor(...mutedColor);
    doc.setFontSize(8);
    doc.text('Description', margin + 2, y);
    doc.text('Hours', margin + 100, y);
    doc.text('Rate', margin + 125, y);
    doc.text('Total', pageWidth - margin - 2, y, { align: 'right' });

    y += 8;

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    for (const item of data.laborItems) {
      doc.text(item.description, margin + 2, y);
      doc.text(item.hours.toFixed(1), margin + 100, y);
      doc.text(formatCurrency(item.rate), margin + 125, y);
      doc.text(formatCurrency(item.total), pageWidth - margin - 2, y, { align: 'right' });
      y += 6;
    }

    y += 5;
  }

  // Parts Items Table
  if (data.partsItems.length > 0) {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTS', margin, y);
    y += 8;

    // Table header
    doc.setFillColor(248, 248, 249);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');

    doc.setTextColor(...mutedColor);
    doc.setFontSize(8);
    doc.text('Part', margin + 2, y);
    doc.text('SKU', margin + 80, y);
    doc.text('Qty', margin + 110, y);
    doc.text('Price', margin + 130, y);
    doc.text('Total', pageWidth - margin - 2, y, { align: 'right' });

    y += 8;

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    for (const item of data.partsItems) {
      const partName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      doc.text(partName, margin + 2, y);
      doc.text(item.sku, margin + 80, y);
      doc.text(String(item.quantity), margin + 110, y);
      doc.text(formatCurrency(item.unitPrice), margin + 130, y);
      doc.text(formatCurrency(item.total), pageWidth - margin - 2, y, { align: 'right' });
      y += 6;
    }

    y += 5;
  }

  drawLine(y);
  y += 10;

  // Totals section (right aligned)
  const totalsX = pageWidth - margin - 80;
  const totalsValueX = pageWidth - margin;

  const addTotalRow = (label: string, value: string, bold = false) => {
    if (bold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.setTextColor(...mutedColor);
    doc.text(label, totalsX, y);
    doc.setTextColor(...textColor);
    doc.text(value, totalsValueX, y, { align: 'right' });
    y += 6;
  };

  doc.setFontSize(10);
  addTotalRow('Subtotal (Labor):', formatCurrency(data.subtotalLabor));
  addTotalRow('Subtotal (Parts):', formatCurrency(data.subtotalParts));
  addTotalRow(`Tax (${(data.taxRate * 100).toFixed(1)}%):`, formatCurrency(data.tax));

  if (data.discount > 0) {
    doc.setTextColor(34, 197, 94); // green
    addTotalRow('Discount:', `-${formatCurrency(data.discount)}`);
  }

  y += 2;
  drawLine(y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('Total:', totalsX, y);
  doc.text(formatCurrency(data.total), totalsValueX, y, { align: 'right' });

  y += 10;

  // Payments and Balance
  if (data.payments.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const payment of data.payments) {
      doc.setTextColor(34, 197, 94);
      addTotalRow(`Paid (${payment.date}):`, `-${formatCurrency(payment.amount)}`);
    }

    y += 4;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    if (data.balanceDue > 0) {
      doc.setTextColor(...primaryColor);
      doc.text('Balance Due:', totalsX, y);
      doc.text(formatCurrency(data.balanceDue), totalsValueX, y, { align: 'right' });
    } else {
      doc.setTextColor(34, 197, 94);
      doc.text('PAID IN FULL', totalsX, y);
    }
  }

  y += 15;

  // Notes
  if (data.notes) {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 5;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Thank you for your business! Payment is due within 30 days.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );

  return doc;
}

export function invoiceToBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}

export function invoiceToBase64(doc: jsPDF): string {
  return doc.output('datauristring');
}

export function downloadInvoice(doc: jsPDF, filename: string) {
  doc.save(filename);
}
