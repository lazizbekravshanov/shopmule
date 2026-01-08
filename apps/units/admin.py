from django.contrib import admin
from .models import UnitVehicle, PreventiveMaintenanceSchedule


@admin.register(UnitVehicle)
class UnitVehicleAdmin(admin.ModelAdmin):
    list_display = ('vin', 'customer', 'make', 'model', 'year', 'tenant')
    search_fields = ('vin', 'plate')
    list_filter = ('tenant',)


@admin.register(PreventiveMaintenanceSchedule)
class PreventiveMaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = ('unit', 'mileage_interval', 'days_interval', 'engine_hours_interval', 'tenant')
    list_filter = ('tenant',)
