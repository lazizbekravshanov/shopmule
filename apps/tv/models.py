import hashlib
import secrets
from datetime import timedelta
from django.db import models
from django.utils import timezone
from apps.tenants.models import TenantScopedModel


class TenantDisplayToken(TenantScopedModel):
    token_hash = models.CharField(max_length=128, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def generate_token(self, ttl_hours=24):
        token = secrets.token_urlsafe(24)
        self.token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        self.expires_at = timezone.now() + timedelta(hours=ttl_hours)
        self.save(update_fields=['token_hash', 'expires_at'])
        return token

    def verify_token(self, token):
        if not self.token_hash or not self.expires_at:
            return False
        if timezone.now() > self.expires_at:
            return False
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        return secrets.compare_digest(self.token_hash, token_hash)
