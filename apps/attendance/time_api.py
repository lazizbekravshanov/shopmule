from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.tenants.permissions import IsTenantUser
from apps.audit.utils import log_audit_event
from .models import TimeEntry, ShiftPunch
from apps.service_orders.models import ServiceOrder


class TimeEntryStartView(APIView):
    permission_classes = [IsTenantUser]

    def post(self, request):
        if not ShiftPunch.objects.for_tenant(request.user.tenant).filter(user=request.user, clock_out_at__isnull=True).exists():
            return Response({'detail': 'Must be clocked in to start time entry.'}, status=400)
        if TimeEntry.objects.for_tenant(request.user.tenant).filter(tech=request.user, clock_out__isnull=True).exists():
            return Response({'detail': 'Already tracking time.'}, status=400)
        service_order_id = request.data.get('service_order')
        if not service_order_id:
            return Response({'detail': 'service_order is required.'}, status=400)
        if not ServiceOrder.objects.for_tenant(request.user.tenant).filter(id=service_order_id).exists():
            return Response({'detail': 'Invalid service_order.'}, status=400)
        entry = TimeEntry.objects.create(
            tenant=request.user.tenant,
            tech=request.user,
            service_order_id=service_order_id,
            notes=request.data.get('notes', ''),
        )
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='time_entry_start',
            description=f'Time entry {entry.id} started',
        )
        return Response({'id': entry.id, 'clock_in': entry.clock_in}, status=201)


class TimeEntryStopView(APIView):
    permission_classes = [IsTenantUser]

    def post(self, request):
        entry = TimeEntry.objects.for_tenant(request.user.tenant).filter(tech=request.user, clock_out__isnull=True).first()
        if not entry:
            return Response({'detail': 'No active time entry.'}, status=400)
        entry.clock_out = timezone.now()
        entry.save(update_fields=['clock_out'])
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='time_entry_stop',
            description=f'Time entry {entry.id} stopped',
        )
        return Response({'id': entry.id, 'clock_out': entry.clock_out})
