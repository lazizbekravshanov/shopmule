from django.db import models
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.tenants.viewsets import TenantScopedViewSet
from apps.tenants.permissions import HasAnyGroup, IsTenantUser
from .models import Part


class PartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Part
        fields = (
            'id', 'sku', 'description', 'vendor', 'cost', 'price',
            'qty_on_hand', 'reorder_point', 'bin_location', 'created_at', 'updated_at'
        )


class PartsManagerPermission(HasAnyGroup):
    required_groups = ['Parts Manager', 'Owner/Admin']


class PartViewSet(TenantScopedViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    permission_classes = [IsTenantUser, PartsManagerPermission]

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_parts = self.get_queryset().filter(qty_on_hand__lte=models.F('reorder_point'))
        return Response(self.get_serializer(low_parts, many=True).data)
