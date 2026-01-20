from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.tenants.viewsets import TenantScopedViewSet
from apps.audit.utils import log_audit_event
from .models import ServiceOrderAIArtifact
from .services import OpenAIService
from apps.service_orders.models import ServiceOrder, ServiceOrderLaborLine, ServiceOrderPartLine


class SuggestedPartSerializer(serializers.Serializer):
    sku_or_part_number = serializers.CharField()
    description = serializers.CharField()
    qty = serializers.IntegerField()


class CleanupNotesOutputSerializer(serializers.Serializer):
    complaint = serializers.CharField()
    cause = serializers.CharField()
    correction = serializers.CharField()
    recommended_services = serializers.ListField(child=serializers.CharField())
    customer_summary = serializers.CharField()
    suggested_parts = SuggestedPartSerializer(many=True)


class DraftEstimateLineSerializer(serializers.Serializer):
    description = serializers.CharField()
    hours = serializers.FloatField()
    rate = serializers.FloatField()


class DraftPartLineSerializer(serializers.Serializer):
    sku_or_part_number = serializers.CharField()
    description = serializers.CharField()
    qty = serializers.IntegerField()
    unit_cost = serializers.FloatField()
    unit_price = serializers.FloatField()


class DraftEstimateOutputSerializer(serializers.Serializer):
    labor_lines = DraftEstimateLineSerializer(many=True)
    part_lines = DraftPartLineSerializer(many=True)


class ServiceOrderAIArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrderAIArtifact
        fields = ('id', 'service_order', 'kind', 'input_text', 'output_json', 'created_at')


class ServiceOrderAIArtifactViewSet(TenantScopedViewSet):
    queryset = ServiceOrderAIArtifact.objects.all()
    serializer_class = ServiceOrderAIArtifactSerializer

    @action(detail=False, methods=['post'], url_path='service-orders/(?P<service_order_id>[^/.]+)/cleanup-notes')
    def cleanup_notes(self, request, service_order_id=None):
        service_order = ServiceOrder.objects.for_tenant(request.user.tenant).get(id=service_order_id)
        text = request.data.get('text', '')
        if not text:
            return Response({'detail': 'text is required.'}, status=400)
        try:
            output = OpenAIService().cleanup_notes(text)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=400)
        serializer = CleanupNotesOutputSerializer(data=output)
        serializer.is_valid(raise_exception=True)
        artifact = ServiceOrderAIArtifact.objects.create(
            tenant=request.user.tenant,
            service_order=service_order,
            kind='cleanup_notes',
            input_text=text,
            output_json=serializer.validated_data,
        )
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='ai_cleanup_notes',
            description=f'AI cleanup notes artifact {artifact.id}',
        )
        return Response(ServiceOrderAIArtifactSerializer(artifact).data, status=201)

    @action(detail=False, methods=['post'], url_path='service-orders/(?P<service_order_id>[^/.]+)/apply-cleanup')
    def apply_cleanup(self, request, service_order_id=None):
        service_order = ServiceOrder.objects.for_tenant(request.user.tenant).get(id=service_order_id)
        artifact_id = request.data.get('artifact_id')
        artifact = ServiceOrderAIArtifact.objects.for_tenant(request.user.tenant).get(id=artifact_id)
        if artifact.service_order_id != service_order.id:
            return Response({'detail': 'Artifact does not match service order.'}, status=400)
        customer_summary = artifact.output_json.get('customer_summary', '')
        service_order.customer_notes = customer_summary
        service_order.save(update_fields=['customer_notes'])
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='ai_apply_cleanup',
            description=f'Applied AI artifact {artifact.id}',
        )
        return Response({'detail': 'Applied.'})

    @action(detail=False, methods=['post'], url_path='service-orders/(?P<service_order_id>[^/.]+)/draft-estimate-lines')
    def draft_estimate_lines(self, request, service_order_id=None):
        service_order = ServiceOrder.objects.for_tenant(request.user.tenant).get(id=service_order_id)
        text = request.data.get('text', '')
        if not text:
            return Response({'detail': 'text is required.'}, status=400)
        try:
            output = OpenAIService().draft_estimate_lines(text)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=400)
        serializer = DraftEstimateOutputSerializer(data=output)
        serializer.is_valid(raise_exception=True)
        artifact = ServiceOrderAIArtifact.objects.create(
            tenant=request.user.tenant,
            service_order=service_order,
            kind='draft_estimate_lines',
            input_text=text,
            output_json=serializer.validated_data,
        )
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='ai_draft_estimate',
            description=f'AI draft estimate artifact {artifact.id}',
        )
        return Response(ServiceOrderAIArtifactSerializer(artifact).data, status=201)

    @action(detail=False, methods=['post'], url_path='service-orders/(?P<service_order_id>[^/.]+)/apply-estimate-lines')
    def apply_estimate_lines(self, request, service_order_id=None):
        service_order = ServiceOrder.objects.for_tenant(request.user.tenant).get(id=service_order_id)
        artifact_id = request.data.get('artifact_id')
        artifact = ServiceOrderAIArtifact.objects.for_tenant(request.user.tenant).get(id=artifact_id)
        if artifact.service_order_id != service_order.id:
            return Response({'detail': 'Artifact does not match service order.'}, status=400)
        labor_lines = artifact.output_json.get('labor_lines', [])
        part_lines = artifact.output_json.get('part_lines', [])
        for line in labor_lines:
            ServiceOrderLaborLine.objects.create(
                tenant=request.user.tenant,
                service_order=service_order,
                hours=line.get('hours', 0),
                rate=line.get('rate', 0),
                description=line.get('description', ''),
            )
        for line in part_lines:
            ServiceOrderPartLine.objects.create(
                tenant=request.user.tenant,
                service_order=service_order,
                qty=line.get('qty', 1),
                unit_cost=line.get('unit_cost', 0),
                unit_price=line.get('unit_price', 0),
                taxable=True,
            )
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='ai_apply_estimate_lines',
            description=f'Applied estimate lines from artifact {artifact.id}',
        )
        return Response({'detail': 'Estimate lines applied.'})
