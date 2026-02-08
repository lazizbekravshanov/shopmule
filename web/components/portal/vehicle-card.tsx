'use client';

import Link from 'next/link';
import { Car, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year?: number | null;
    licensePlate?: string | null;
    vin?: string | null;
    lastServiceDate?: string | null;
  };
  token: string;
}

export function VehicleCard({ vehicle, token }: VehicleCardProps) {
  const vehicleName = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(' ');

  return (
    <Link href={`/portal/${token}/vehicles/${vehicle.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Car className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{vehicleName}</h3>
              {vehicle.licensePlate && (
                <p className="text-sm text-muted-foreground">
                  Plate: {vehicle.licensePlate}
                </p>
              )}
              {vehicle.lastServiceDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  Last service: {formatDate(vehicle.lastServiceDate)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
