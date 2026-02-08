'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Car,
  Calendar,
  Wrench,
  Package,
  FileText,
  MessageSquare,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePortalData } from '../../layout';
import { WorkOrderTimeline } from '@/components/portal';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const workOrderId = params.workOrderId as string;

  const { workOrders } = usePortalData();

  const [approving, setApproving] = useState(false);
  const [requestingUpdate, setRequestingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const workOrder = workOrders.find((wo) => wo.id === workOrderId);

  if (!workOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Work order not found</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push(`/portal/${token}/work-orders`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>
      </div>
    );
  }

  const vehicleName = workOrder.vehicle
    ? [workOrder.vehicle.year, workOrder.vehicle.make, workOrder.vehicle.model]
        .filter(Boolean)
        .join(' ')
    : null;

  const total = workOrder.laborTotal + workOrder.partsTotal;
  const currentStatus = approvalSuccess ? 'APPROVED' : workOrder.status;

  async function handleApprove() {
    setApproving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/portal/${token}/work-orders/${workOrderId}/approve`,
        { method: 'POST' }
      );
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to approve estimate');
        return;
      }

      setApprovalSuccess(true);
    } catch {
      setError('Failed to approve estimate. Please try again.');
    } finally {
      setApproving(false);
    }
  }

  async function handleRequestUpdate() {
    setRequestingUpdate(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/portal/${token}/work-orders/${workOrderId}/request-update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: updateMessage }),
        }
      );
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to request update');
        return;
      }

      setUpdateSuccess(true);
      setUpdateMessage('');
      setDialogOpen(false);
    } catch {
      setError('Failed to request update. Please try again.');
    } finally {
      setRequestingUpdate(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/portal/${token}/work-orders`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Work Orders
      </Button>

      {/* Status Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderTimeline status={currentStatus} />
        </CardContent>
      </Card>

      {/* Work Order Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Work Order Details</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                #{workOrderId.slice(0, 8)}
              </p>
            </div>
            <Badge
              variant={
                currentStatus === 'COMPLETED'
                  ? 'outline'
                  : currentStatus === 'IN_PROGRESS'
                  ? 'default'
                  : currentStatus === 'APPROVED'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {currentStatus === 'DIAGNOSED'
                ? 'Awaiting Approval'
                : currentStatus.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{workOrder.description}</p>
          </div>

          {vehicleName && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Car className="h-3 w-3" />
                Vehicle
              </p>
              <p className="font-medium">{vehicleName}</p>
              {workOrder.vehicle?.licensePlate && (
                <p className="text-sm text-muted-foreground">
                  Plate: {workOrder.vehicle.licensePlate}
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created
            </p>
            <p className="font-medium">{formatDate(workOrder.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Estimate Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Estimate Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Labor */}
          {workOrder.laborLines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Labor</span>
              </div>
              <div className="space-y-2 pl-6">
                {workOrder.laborLines.map((line) => (
                  <div key={line.id} className="flex justify-between text-sm">
                    <div>
                      <p>{line.description}</p>
                      <p className="text-muted-foreground">
                        {line.hours} hrs @ {formatCurrency(line.rate)}/hr
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(line.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parts */}
          {workOrder.partLines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Parts</span>
              </div>
              <div className="space-y-2 pl-6">
                {workOrder.partLines.map((line) => (
                  <div key={line.id} className="flex justify-between text-sm">
                    <div>
                      <p>{line.description}</p>
                      <p className="text-muted-foreground">
                        {line.quantity} x {formatCurrency(line.unitPrice)}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(line.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Labor Total</span>
              <span>{formatCurrency(workOrder.laborTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Parts Total</span>
              <span>{formatCurrency(workOrder.partsTotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Estimate Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Success Messages */}
      {approvalSuccess && (
        <div className="rounded-md bg-green-100 p-4 text-green-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Estimate approved successfully! We'll begin work on your vehicle soon.
        </div>
      )}

      {updateSuccess && (
        <div className="rounded-md bg-green-100 p-4 text-green-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Update request submitted. We'll get back to you soon.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {currentStatus === 'DIAGNOSED' && !approvalSuccess && (
          <Button
            onClick={handleApprove}
            disabled={approving}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] flex-1"
            size="lg"
          >
            {approving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Estimate
              </>
            )}
          </Button>
        )}

        {currentStatus !== 'COMPLETED' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1" size="lg">
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Status Update</DialogTitle>
                <DialogDescription>
                  Have a question about your work order? We'll get back to you as
                  soon as possible.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Add a message (optional)"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestUpdate}
                  disabled={requestingUpdate}
                  className="bg-[#ee7a14] hover:bg-[#d96a0a]"
                >
                  {requestingUpdate ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {workOrder.hasInvoice && workOrder.invoiceId && (
          <Button variant="outline" className="flex-1" size="lg" asChild>
            <a href={`/portal/${token}/invoices`}>
              <FileText className="h-4 w-4 mr-2" />
              View Invoice
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
