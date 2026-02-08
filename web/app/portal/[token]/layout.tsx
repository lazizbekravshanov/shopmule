'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PortalHeader } from '@/components/portal';

interface PortalData {
  customer: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  summary: {
    activeWorkOrders: number;
    totalVehicles: number;
    unpaidBalance: number;
  };
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    year?: number | null;
    licensePlate?: string | null;
    vin?: string | null;
    unitNumber?: string | null;
    mileage?: number | null;
    lastServiceDate?: string | null;
  }>;
  workOrders: Array<{
    id: string;
    status: 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
    description: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    vehicle: {
      id: string;
      make: string;
      model: string;
      year?: number | null;
      licensePlate?: string | null;
    } | null;
    laborTotal: number;
    partsTotal: number;
    laborLines: Array<{
      id: string;
      description: string;
      hours: number;
      rate: number;
      total: number;
    }>;
    partLines: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    hasInvoice: boolean;
    invoiceId?: string | null;
    invoiceStatus?: string | null;
  }>;
  invoices: Array<{
    id: string;
    status: 'UNPAID' | 'PARTIAL' | 'PAID';
    total: number;
    paidAmount: number;
    remainingBalance: number;
    createdAt: string;
    hasPaymentLink: boolean;
    vehicle: {
      id: string;
      make: string;
      model: string;
      year?: number | null;
      licensePlate?: string | null;
    } | null;
  }>;
}

import { createContext, useContext, ReactNode } from 'react';

const PortalContext = createContext<PortalData | null>(null);

export function usePortalData() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortalData must be used within PortalLayout');
  }
  return context;
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const token = params.token as string;

  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortalData() {
      try {
        const response = await fetch(`/api/portal/${token}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to load portal');
          return;
        }

        setPortalData(result.data);
      } catch {
        setError('Failed to load portal. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPortalData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#ee7a14]" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-semibold">Unable to Load Portal</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!portalData) {
    return null;
  }

  return (
    <PortalContext.Provider value={portalData}>
      <div className="min-h-screen bg-gray-50">
        <PortalHeader customerName={portalData.customer.name} token={token} />
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </div>
    </PortalContext.Provider>
  );
}
