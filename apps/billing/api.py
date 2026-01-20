from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.tenants.viewsets import TenantScopedViewSet
from apps.service_orders.models import ServiceOrderStatus
from .models import Invoice, Payment, Estimate
from apps.audit.utils import log_audit_event


class EstimateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estimate
        fields = (
            'id', 'service_order', 'status', 'total', 'portal_token_expires_at',
            'approved_at', 'approved_by_name', 'approved_ip', 'approved_user_agent'
        )


class EstimateViewSet(TenantScopedViewSet):
    queryset = Estimate.objects.all()
    serializer_class = EstimateSerializer


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ('id', 'service_order', 'status', 'total', 'issued_at')


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'invoice', 'method', 'amount', 'reference', 'paid_at')


class InvoiceViewSet(TenantScopedViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=False, methods=['post'])
    def from_service_order(self, request):
        service_order_id = request.data.get('service_order')
        if not service_order_id:
            return Response({'detail': 'service_order is required.'}, status=400)
        invoice, created = Invoice.objects.get_or_create(
            tenant=request.user.tenant,
            service_order_id=service_order_id,
            defaults={'total': request.data.get('total', 0)},
        )
        if created:
            from apps.service_orders.models import ServiceOrder
            order = ServiceOrder.objects.for_tenant(request.user.tenant).get(id=service_order_id)
            order.status = ServiceOrderStatus.INVOICED
            order.save(update_fields=['status'])
        return Response(self.get_serializer(invoice).data, status=201 if created else 200)


class PaymentViewSet(TenantScopedViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def perform_create(self, serializer):
        payment = serializer.save(tenant=self.request.user.tenant)
        log_audit_event(
            tenant=self.request.user.tenant,
            user=self.request.user,
            action='payment_recorded',
            description=f'Payment {payment.id} recorded',
        )
