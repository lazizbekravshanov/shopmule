from django.contrib import admin
from .models import Part


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ('sku', 'description', 'qty_on_hand', 'reorder_point', 'tenant')
    search_fields = ('sku', 'description')
    list_filter = ('tenant',)
