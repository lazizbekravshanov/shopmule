import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  shopName?: string;
}

export function EmailLayout({ children, shopName = 'ShopMule' }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f4f4f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f5', padding: '40px 20px' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: '#171717', padding: '24px', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 600 }}>
                      {shopName}
                    </h1>
                  </td>
                </tr>
                {/* Content */}
                <tr>
                  <td style={{ padding: '32px 24px' }}>
                    {children}
                  </td>
                </tr>
                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f4f4f5', padding: '24px', textAlign: 'center', borderTop: '1px solid #e5e5e5' }}>
                    <p style={{ margin: 0, color: '#71717a', fontSize: '14px' }}>
                      Powered by ShopMule
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

interface InvoiceSentEmailProps {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  paymentLink: string;
  shopName?: string;
}

export function InvoiceSentEmail({
  customerName,
  invoiceNumber,
  amount,
  dueDate,
  paymentLink,
  shopName,
}: InvoiceSentEmailProps) {
  return (
    <EmailLayout shopName={shopName}>
      <h2 style={{ margin: '0 0 16px', color: '#171717', fontSize: '20px', fontWeight: 600 }}>
        Invoice #{invoiceNumber}
      </h2>
      <p style={{ margin: '0 0 16px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        Hi {customerName},
      </p>
      <p style={{ margin: '0 0 24px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        Your invoice is ready for payment. Here are the details:
      </p>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f5', borderRadius: '8px', marginBottom: '24px' }}>
        <tr>
          <td style={{ padding: '16px' }}>
            <table width="100%">
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px', paddingBottom: '8px' }}>Amount Due</td>
                <td align="right" style={{ color: '#171717', fontSize: '18px', fontWeight: 600, paddingBottom: '8px' }}>{amount}</td>
              </tr>
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px' }}>Due Date</td>
                <td align="right" style={{ color: '#171717', fontSize: '14px' }}>{dueDate}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table width="100%">
        <tr>
          <td align="center">
            <a
              href={paymentLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#ee7a14',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Pay Invoice
            </a>
          </td>
        </tr>
      </table>
      <p style={{ margin: '24px 0 0', color: '#71717a', fontSize: '14px', textAlign: 'center' }}>
        Questions? Reply to this email or call us.
      </p>
    </EmailLayout>
  );
}

interface WorkOrderUpdateEmailProps {
  customerName: string;
  orderNumber: string;
  vehicleInfo: string;
  status: string;
  message?: string;
  portalLink?: string;
  shopName?: string;
}

export function WorkOrderUpdateEmail({
  customerName,
  orderNumber,
  vehicleInfo,
  status,
  message,
  portalLink,
  shopName,
}: WorkOrderUpdateEmailProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return '#10b981';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'APPROVED':
        return '#ee7a14';
      default:
        return '#71717a';
    }
  };

  return (
    <EmailLayout shopName={shopName}>
      <h2 style={{ margin: '0 0 16px', color: '#171717', fontSize: '20px', fontWeight: 600 }}>
        Work Order Update
      </h2>
      <p style={{ margin: '0 0 16px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        Hi {customerName},
      </p>
      <p style={{ margin: '0 0 24px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        We have an update on your work order:
      </p>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f5', borderRadius: '8px', marginBottom: '24px' }}>
        <tr>
          <td style={{ padding: '16px' }}>
            <table width="100%">
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px', paddingBottom: '8px' }}>Order #</td>
                <td align="right" style={{ color: '#171717', fontSize: '14px', paddingBottom: '8px' }}>{orderNumber}</td>
              </tr>
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px', paddingBottom: '8px' }}>Vehicle</td>
                <td align="right" style={{ color: '#171717', fontSize: '14px', paddingBottom: '8px' }}>{vehicleInfo}</td>
              </tr>
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px' }}>Status</td>
                <td align="right">
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: getStatusColor(status),
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}>
                    {status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      {message && (
        <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ margin: 0, color: '#92400e', fontSize: '14px', lineHeight: '20px' }}>
            <strong>Note from the shop:</strong><br />
            {message}
          </p>
        </div>
      )}
      {portalLink && (
        <table width="100%">
          <tr>
            <td align="center">
              <a
                href={portalLink}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#171717',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                View Details
              </a>
            </td>
          </tr>
        </table>
      )}
    </EmailLayout>
  );
}

interface EstimateApprovalEmailProps {
  customerName: string;
  orderNumber: string;
  vehicleInfo: string;
  estimateTotal: string;
  laborTotal: string;
  partsTotal: string;
  portalLink: string;
  shopName?: string;
}

export function EstimateApprovalEmail({
  customerName,
  orderNumber,
  vehicleInfo,
  estimateTotal,
  laborTotal,
  partsTotal,
  portalLink,
  shopName,
}: EstimateApprovalEmailProps) {
  return (
    <EmailLayout shopName={shopName}>
      <h2 style={{ margin: '0 0 16px', color: '#171717', fontSize: '20px', fontWeight: 600 }}>
        Estimate Ready for Approval
      </h2>
      <p style={{ margin: '0 0 16px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        Hi {customerName},
      </p>
      <p style={{ margin: '0 0 24px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        We've completed the diagnosis on your vehicle and prepared an estimate for the recommended repairs.
      </p>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f5', borderRadius: '8px', marginBottom: '24px' }}>
        <tr>
          <td style={{ padding: '16px' }}>
            <table width="100%">
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px', paddingBottom: '8px' }}>Work Order</td>
                <td align="right" style={{ color: '#171717', fontSize: '14px', paddingBottom: '8px' }}>{orderNumber}</td>
              </tr>
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px', paddingBottom: '8px' }}>Vehicle</td>
                <td align="right" style={{ color: '#171717', fontSize: '14px', paddingBottom: '8px' }}>{vehicleInfo}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ borderTop: '1px solid #e5e5e5', paddingTop: '12px' }}></td>
              </tr>
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px', paddingBottom: '4px' }}>Labor</td>
                <td align="right" style={{ color: '#171717', fontSize: '14px', paddingBottom: '4px' }}>{laborTotal}</td>
              </tr>
              <tr>
                <td style={{ color: '#71717a', fontSize: '14px', paddingBottom: '8px' }}>Parts</td>
                <td align="right" style={{ color: '#171717', fontSize: '14px', paddingBottom: '8px' }}>{partsTotal}</td>
              </tr>
              <tr>
                <td style={{ color: '#171717', fontSize: '16px', fontWeight: 600 }}>Estimated Total</td>
                <td align="right" style={{ color: '#171717', fontSize: '18px', fontWeight: 600 }}>{estimateTotal}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table width="100%">
        <tr>
          <td align="center">
            <a
              href={portalLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#ee7a14',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Review & Approve Estimate
            </a>
          </td>
        </tr>
      </table>
      <p style={{ margin: '24px 0 0', color: '#71717a', fontSize: '14px', textAlign: 'center' }}>
        Have questions? Reply to this email or call us to discuss the repairs.
      </p>
    </EmailLayout>
  );
}

interface PortalLinkEmailProps {
  customerName: string;
  portalLink: string;
  expiresIn: string;
  shopName?: string;
}

export function PortalLinkEmail({
  customerName,
  portalLink,
  expiresIn,
  shopName,
}: PortalLinkEmailProps) {
  return (
    <EmailLayout shopName={shopName}>
      <h2 style={{ margin: '0 0 16px', color: '#171717', fontSize: '20px', fontWeight: 600 }}>
        Your Customer Portal Access
      </h2>
      <p style={{ margin: '0 0 16px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        Hi {customerName},
      </p>
      <p style={{ margin: '0 0 24px', color: '#525252', fontSize: '16px', lineHeight: '24px' }}>
        Use the link below to access your customer portal where you can view your vehicles, work orders, and invoices.
      </p>
      <table width="100%">
        <tr>
          <td align="center">
            <a
              href={portalLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#171717',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Access Portal
            </a>
          </td>
        </tr>
      </table>
      <p style={{ margin: '24px 0 0', color: '#71717a', fontSize: '14px', textAlign: 'center' }}>
        This link will expire in {expiresIn}. No login required.
      </p>
    </EmailLayout>
  );
}
