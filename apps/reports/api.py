from django.db import models
from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.tenants.permissions import IsTenantUser
from apps.service_orders.models import ServiceOrder, ServiceOrderLaborLine
from apps.parts.models import Part
from apps.billing.models import Invoice


class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [IsTenantUser]

    @action(detail=False, methods=['get'])
    def labor_utilization(self, request):
        start = timezone.now() - timedelta(days=30)
        data = (
            ServiceOrderLaborLine.objects.for_tenant(request.user.tenant)
            .filter(service_order__opened_at__gte=start)
            .values('tech__id', 'tech__username')
            .annotate(total_billed=models.Sum('billed_hours'))
        )
        return Response(list(data))

    @action(detail=False, methods=['get'])
    def revenue_by_month(self, request):
        invoices = Invoice.objects.for_tenant(request.user.tenant).values('issued_at__year', 'issued_at__month')
        data = invoices.annotate(total=models.Sum('total')).order_by('issued_at__year', 'issued_at__month')
        return Response(list(data))

    @action(detail=False, methods=['get'])
    def parts_margin(self, request):
        parts = Part.objects.for_tenant(request.user.tenant)
        data = parts.annotate(margin=models.F('price') - models.F('cost')).values('sku', 'margin')
        return Response(list(data))

    @action(detail=False, methods=['get'])
    def open_service_orders_aging(self, request):
        open_orders = ServiceOrder.objects.for_tenant(request.user.tenant).exclude(status='closed')
        data = [
            {
                'id': order.id,
                'status': order.status,
                'days_open': (timezone.now() - order.opened_at).days,
            }
            for order in open_orders
        ]
        return Response(data)
