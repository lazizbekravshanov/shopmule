from django.contrib import admin
from .models import ShiftPunch, TimeEntry


@admin.register(ShiftPunch)
class ShiftPunchAdmin(admin.ModelAdmin):
    list_display = ('user', 'clock_in_at', 'clock_out_at', 'source', 'tenant')
    list_filter = ('tenant', 'source')
    search_fields = ('user__username',)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if change:
            from apps.audit.utils import log_audit_event
            log_audit_event(
                tenant=obj.tenant,
                user=request.user,
                action='admin_edit_punch',
                description=f'Admin edited shift punch {obj.id}',
            )


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ('tech', 'service_order', 'clock_in', 'clock_out', 'tenant')
    list_filter = ('tenant',)
    search_fields = ('tech__username', 'service_order__id')
