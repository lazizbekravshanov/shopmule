from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.tenants.viewsets import TenantScopedViewSet
from .models import ServiceOrder, ServiceOrderLaborLine, ServiceOrderPartLine, Attachment, ServiceOrderStatus


class ServiceOrderLaborLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrderLaborLine
        fields = ('id', 'service_order', 'tech', 'hours', 'rate', 'description', 'billed_hours')


class ServiceOrderPartLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrderPartLine
        fields = ('id', 'service_order', 'part', 'qty', 'unit_cost', 'unit_price', 'taxable')


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('id', 'service_order', 'file', 'uploaded_by', 'created_at')


class ServiceOrderSerializer(serializers.ModelSerializer):
    labor_lines = ServiceOrderLaborLineSerializer(many=True, read_only=True)
    part_lines = ServiceOrderPartLineSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceOrder
        fields = (
            'id', 'customer', 'unit', 'status', 'internal_notes', 'customer_notes',
            'opened_at', 'in_progress_at', 'closed_at', 'is_comeback',
            'labor_lines', 'part_lines', 'attachments'
        )


class ServiceOrderViewSet(TenantScopedViewSet):
    queryset = ServiceOrder.objects.all()
    serializer_class = ServiceOrderSerializer

    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        service_order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ServiceOrderStatus.values:
            return Response({'detail': 'Invalid status'}, status=400)
        try:
            service_order.transition_status(new_status)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=400)
        return Response(self.get_serializer(service_order).data)
