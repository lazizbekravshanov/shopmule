'use client';

import { useParams } from 'next/navigation';
import { Car } from 'lucide-react';
import { usePortalData } from '../layout';
import { VehicleCard } from '@/components/portal';

export default function VehiclesPage() {
  const params = useParams();
  const token = params.token as string;
  const { vehicles } = usePortalData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Vehicles</h1>
        <p className="text-muted-foreground">
          {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} on file
        </p>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No vehicles on file</p>
          <p className="text-sm">Contact us to add your vehicles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
