from django.contrib import admin
from .models import InventoryAdjustment


@admin.register(InventoryAdjustment)
class InventoryAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('part', 'quantity_change', 'reason', 'adjusted_at', 'tenant')
    list_filter = ('tenant',)
    search_fields = ('part__sku',)
