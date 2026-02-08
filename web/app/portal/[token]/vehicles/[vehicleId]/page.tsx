'use client';

import { useParams, useRouter } from 'next/navigation';
import { Car, ArrowLeft, Calendar, Hash, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortalData } from '../../layout';
import { ServiceHistory } from '@/components/portal';
import { formatDate } from '@/lib/utils';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const vehicleId = params.vehicleId as string;

  const { vehicles, workOrders } = usePortalData();

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const vehicleWorkOrders = workOrders.filter(
    (wo) => wo.vehicle?.id === vehicleId
  );

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vehicle not found</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push(`/portal/${token}/vehicles`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vehicles
        </Button>
      </div>
    );
  }

  const vehicleName = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/portal/${token}/vehicles`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Vehicles
      </Button>

      {/* Vehicle Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <Car className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>{vehicleName}</CardTitle>
              {vehicle.licensePlate && (
                <p className="text-sm text-muted-foreground">
                  Plate: {vehicle.licensePlate}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vehicle.vin && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  VIN
                </p>
                <p className="font-medium text-sm truncate">{vehicle.vin}</p>
              </div>
            )}
            {vehicle.mileage && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  Mileage
                </p>
                <p className="font-medium">
                  {vehicle.mileage.toLocaleString()} mi
                </p>
              </div>
            )}
            {vehicle.lastServiceDate && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last Service
                </p>
                <p className="font-medium">{formatDate(vehicle.lastServiceDate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceHistory
            workOrders={vehicleWorkOrders}
            onSelect={(id) =>
              router.push(`/portal/${token}/work-orders/${id}`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
