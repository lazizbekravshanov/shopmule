from rest_framework import serializers
from apps.tenants.viewsets import TenantScopedViewSet
from .models import InventoryAdjustment


class InventoryAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryAdjustment
        fields = ('id', 'part', 'quantity_change', 'reason', 'adjusted_at')


class InventoryAdjustmentViewSet(TenantScopedViewSet):
    queryset = InventoryAdjustment.objects.all()
    serializer_class = InventoryAdjustmentSerializer
