from django.contrib import admin
from .models import TenantDisplayToken


@admin.register(TenantDisplayToken)
class TenantDisplayTokenAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'expires_at', 'created_at')
    list_filter = ('tenant',)
    actions = ['rotate_tokens']

    def rotate_tokens(self, request, queryset):
        for token in queryset:
            new_token = token.generate_token()
            print(f"TV token for tenant {token.tenant_id}: {new_token}")
            from apps.audit.utils import log_audit_event
            log_audit_event(
                tenant=token.tenant,
                user=request.user,
                action='tv_token_rotated',
                description=f'TV token rotated for tenant {token.tenant_id}',
            )
        self.message_user(request, 'Tokens rotated. New tokens logged to console.')
