import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInvoicePDF, invoiceToBlob } from '@/lib/services/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch invoice with all related data
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        Customer: true,
        WorkOrder: {
          include: {
            Vehicle: true,
            Labor: {
              include: {
                EmployeeProfile: true,
              },
            },
            Parts: {
              include: {
                Part: true,
              },
            },
          },
        },
        LegacyPayments: {
          orderBy: {
            receivedAt: 'asc',
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const workOrder = invoice.WorkOrder;
    const vehicle = workOrder.Vehicle;
    const customer = invoice.Customer;

    // Calculate totals
    const totalPaid = invoice.LegacyPayments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = invoice.total - totalPaid;

    // Build invoice data
    const invoiceData = {
      invoiceNumber: `INV-${invoice.id.slice(-6).toUpperCase()}`,
      invoiceDate: invoice.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      dueDate: new Date(invoice.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      ),

      // Shop info - these would come from shop settings in production
      shopName: process.env.SHOP_NAME || 'ShopMule Auto',
      shopAddress: process.env.SHOP_ADDRESS || '123 Main Street, City, ST 12345',
      shopPhone: process.env.SHOP_PHONE || '(555) 123-4567',
      shopEmail: process.env.SHOP_EMAIL || 'service@shopmule.com',

      // Customer info
      customerName: customer?.name || 'Unknown Customer',
      customerAddress: customer?.billingAddress || undefined,
      customerPhone: customer?.phone || undefined,
      customerEmail: customer?.email || undefined,

      // Vehicle info
      vehicleInfo: `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim(),
      vehicleVin: vehicle.vin,
      vehicleMileage: vehicle.currentMileage || undefined,

      // Work order info
      workOrderId: `WO-${workOrder.id.slice(-6).toUpperCase()}`,
      workOrderDescription: workOrder.description,

      // Labor items
      laborItems: workOrder.Labor.map((labor) => ({
        description: labor.note || `Labor - ${labor.EmployeeProfile?.name || 'Technician'}`,
        hours: labor.hours,
        rate: labor.rate,
        total: labor.hours * labor.rate,
      })),

      // Parts items
      partsItems: workOrder.Parts.map((part) => ({
        name: part.Part?.name || 'Unknown Part',
        sku: part.Part?.sku || '-',
        quantity: part.quantity,
        unitPrice: part.unitPrice * (1 + part.markupPct),
        total: part.quantity * part.unitPrice * (1 + part.markupPct),
      })),

      // Totals
      subtotalLabor: invoice.subtotalLabor,
      subtotalParts: invoice.subtotalParts,
      tax: invoice.tax,
      taxRate: invoice.tax / (invoice.subtotalLabor + invoice.subtotalParts) || 0.0825,
      discount: invoice.discount,
      total: invoice.total,

      // Payments
      payments: invoice.LegacyPayments.map((payment) => ({
        date: payment.receivedAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        method: payment.method,
        amount: payment.amount,
      })),
      amountPaid: totalPaid,
      balanceDue,

      // Notes
      notes: workOrder.notes || undefined,
    };

    // Generate PDF
    const pdf = generateInvoicePDF(invoiceData);
    const pdfBlob = invoiceToBlob(pdf);

    // Convert blob to buffer for response
    const buffer = await pdfBlob.arrayBuffer();

    // Check if download requested
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    const headers: HeadersInit = {
      'Content-Type': 'application/pdf',
      'Content-Length': String(buffer.byteLength),
    };

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${invoiceData.invoiceNumber}.pdf"`;
    } else {
      headers['Content-Disposition'] = `inline; filename="${invoiceData.invoiceNumber}.pdf"`;
    }

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
