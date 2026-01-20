from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'tenant', 'user', 'created_at')
    list_filter = ('tenant', 'action')
    search_fields = ('action', 'description')
    readonly_fields = ('created_at',)
