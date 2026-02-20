'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Users,
  CircleDot,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  photoUrl?: string;
}

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isRequired: boolean;
  isActive: boolean;
  shop?: {
    id: string;
    name: string;
  };
  GeofenceAssignment?: {
    EmployeeProfile: Employee;
  }[];
  _count?: {
    GeofenceAssignment: number;
    PunchRecord: number;
  };
}

interface GeofenceFormData {
  name: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  isRequired: boolean;
  isActive: boolean;
}

const defaultFormData: GeofenceFormData = {
  name: '',
  latitude: '',
  longitude: '',
  radiusMeters: '150',
  isRequired: true,
  isActive: true,
};

export default function GeofencesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [formData, setFormData] = useState<GeofenceFormData>(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<Geofence | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch geofences
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['geofences'],
    queryFn: async () => {
      const res = await fetch('/api/geofences?includeAssignments=true');
      const json = await res.json();
      return json.geofences as Geofence[];
    },
    staleTime: 60_000,
  });

  // Fetch shops for default
  const { data: shopsData } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const res = await fetch('/api/shops');
      if (!res.ok) return [];
      const json = await res.json();
      return json.shops || [];
    },
    staleTime: 300_000, // shops rarely change
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: GeofenceFormData) => {
      // Get first shop or create if none exists
      let shopId = shopsData?.[0]?.id;
      if (!shopId) {
        const createShopRes = await fetch('/api/shops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Main Shop',
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
          }),
        });
        const shopJson = await createShopRes.json();
        shopId = shopJson.shop?.id;
      }

      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          shopId,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          radiusMeters: parseInt(data.radiusMeters),
        }),
      });
      if (!res.ok) throw new Error('Failed to create geofence');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      toast({ title: 'Geofence created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GeofenceFormData> }) => {
      const res = await fetch(`/api/geofences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          latitude: data.latitude ? parseFloat(data.latitude) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude) : undefined,
          radiusMeters: data.radiusMeters ? parseInt(data.radiusMeters) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to update geofence');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
      setIsDialogOpen(false);
      setEditingGeofence(null);
      setFormData(defaultFormData);
      toast({ title: 'Geofence updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/geofences/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete geofence');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
      setDeleteConfirm(null);
      toast({
        title: data.deactivated ? 'Geofence deactivated' : 'Geofence deleted',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (geofence: Geofence) => {
    setEditingGeofence(geofence);
    setFormData({
      name: geofence.name,
      latitude: String(geofence.latitude),
      longitude: String(geofence.longitude),
      radiusMeters: String(geofence.radiusMeters),
      isRequired: geofence.isRequired,
      isActive: geofence.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGeofence) {
      updateMutation.mutate({ id: editingGeofence.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGeofence(null);
    setFormData(defaultFormData);
  };

  const geofences = data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Geofence Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Define location boundaries for time clock punch-ins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#ee7a14] hover:bg-[#d96a0a]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Geofence
          </Button>
        </div>
      </div>

      {/* Geofences Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : geofences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No Geofences Configured
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              Add a geofence to enable location-based time clock punches
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Geofence
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {geofences.map((geofence) => (
            <Card
              key={geofence.id}
              className={cn(
                'relative overflow-hidden',
                !geofence.isActive && 'opacity-60'
              )}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  'absolute top-0 left-0 right-0 h-1',
                  geofence.isActive ? 'bg-green-500' : 'bg-neutral-300'
                )}
              />

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CircleDot
                        className={cn(
                          'h-4 w-4',
                          geofence.isActive
                            ? 'text-green-500'
                            : 'text-neutral-400'
                        )}
                      />
                      {geofence.name}
                    </CardTitle>
                    <CardDescription>
                      {geofence.shop?.name || 'No shop assigned'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(geofence)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => setDeleteConfirm(geofence)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location info */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-500">Coordinates</span>
                    <span className="font-mono text-xs">
                      {geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Radius</span>
                    <span className="font-medium">{geofence.radiusMeters}m</span>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={geofence.isActive ? 'default' : 'secondary'}
                    className={cn(
                      'text-xs',
                      geofence.isActive && 'bg-green-100 text-green-700'
                    )}
                  >
                    {geofence.isActive ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {geofence.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {geofence.isRequired && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-neutral-500 pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {geofence._count?.GeofenceAssignment || 0} assigned
                  </span>
                  <span>{geofence._count?.PunchRecord || 0} punches</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGeofence ? 'Edit Geofence' : 'Create Geofence'}
            </DialogTitle>
            <DialogDescription>
              {editingGeofence
                ? 'Update the geofence location and settings'
                : 'Define a new location boundary for punch-ins'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Main Shop, Warehouse"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="e.g., 40.7128"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="e.g., -74.0060"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius">Radius (meters)</Label>
              <Input
                id="radius"
                type="number"
                min="10"
                max="10000"
                value={formData.radiusMeters}
                onChange={(e) =>
                  setFormData({ ...formData, radiusMeters: e.target.value })
                }
                required
              />
              <p className="text-xs text-neutral-500">
                Employees must be within this distance to punch in
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="required">Required for punch-in</Label>
                <p className="text-xs text-neutral-500">
                  Employees must be in this zone to clock in
                </p>
              </div>
              <Switch
                id="required"
                checked={formData.isRequired}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRequired: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-neutral-500">
                  Geofence is currently enforced
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#ee7a14] hover:bg-[#d96a0a]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingGeofence
                  ? 'Update Geofence'
                  : 'Create Geofence'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Geofence</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
