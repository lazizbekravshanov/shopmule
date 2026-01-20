from django.db import models
from apps.tenants.models import TenantScopedModel


class AuditLog(TenantScopedModel):
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"{self.action} ({self.created_at:%Y-%m-%d %H:%M})"
