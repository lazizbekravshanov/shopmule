from datetime import timedelta
from django.db import models
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.tenants.viewsets import TenantScopedViewSet
from .models import UnitVehicle, PreventiveMaintenanceSchedule


class UnitVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitVehicle
        fields = (
            'id', 'customer', 'vin', 'make', 'model', 'year', 'plate',
            'odometer', 'engine_hours', 'created_at', 'updated_at'
        )


class PreventiveMaintenanceScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreventiveMaintenanceSchedule
        fields = (
            'id', 'unit', 'mileage_interval', 'days_interval', 'engine_hours_interval',
            'last_service_date', 'last_service_mileage', 'last_service_engine_hours',
            'created_at', 'updated_at'
        )


class UnitVehicleViewSet(TenantScopedViewSet):
    queryset = UnitVehicle.objects.all()
    serializer_class = UnitVehicleSerializer

    @action(detail=False, methods=['get'])
    def due_pm(self, request):
        soon_days = int(request.query_params.get('days', '30'))
        cutoff_date = timezone.now().date() + timedelta(days=soon_days)
        schedules = PreventiveMaintenanceSchedule.objects.for_tenant(request.user.tenant)
        due_units = schedules.filter(
            models.Q(last_service_date__isnull=True) | models.Q(last_service_date__lte=cutoff_date)
        )
        data = PreventiveMaintenanceScheduleSerializer(due_units, many=True).data
        return Response(data)
