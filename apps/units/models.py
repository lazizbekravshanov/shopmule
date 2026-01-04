from django.db import models
from apps.tenants.models import TenantScopedModel


class UnitVehicle(TenantScopedModel):
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, related_name='units')
    vin = models.CharField(max_length=50)
    make = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    plate = models.CharField(max_length=50, blank=True)
    odometer = models.PositiveIntegerField(null=True, blank=True)
    engine_hours = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.vin} - {self.make} {self.model}"


class PreventiveMaintenanceSchedule(TenantScopedModel):
    unit = models.OneToOneField(UnitVehicle, on_delete=models.CASCADE, related_name='pm_schedule')
    mileage_interval = models.PositiveIntegerField(null=True, blank=True)
    days_interval = models.PositiveIntegerField(null=True, blank=True)
    engine_hours_interval = models.PositiveIntegerField(null=True, blank=True)
    last_service_date = models.DateField(null=True, blank=True)
    last_service_mileage = models.PositiveIntegerField(null=True, blank=True)
    last_service_engine_hours = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self) -> str:
        return f"PM Schedule for {self.unit}"
