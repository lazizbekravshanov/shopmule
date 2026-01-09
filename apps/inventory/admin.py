from datetime import timedelta

from django.contrib import admin
from django.utils import timezone
from .models import InventoryAdjustment


class InventoryRangeFilter(admin.SimpleListFilter):
    title = 'adjusted range'
    parameter_name = 'range'

    def lookups(self, request, model_admin):
        return (('7', 'Last 7 days'), ('30', 'Last 30 days'), ('90', 'Last 90 days'))

    def queryset(self, request, queryset):
        if not self.value():
            return queryset
        try:
            days = int(self.value())
        except ValueError:
            return queryset
        if days not in {7, 30, 90}:
            return queryset
        range_start = timezone.now() - timedelta(days=days)
        return queryset.filter(adjusted_at__gte=range_start)


@admin.register(InventoryAdjustment)
class InventoryAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('part', 'quantity_change', 'reason', 'adjusted_at', 'tenant')
    list_filter = (InventoryRangeFilter, 'tenant')
    search_fields = ('part__sku',)
