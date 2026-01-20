import hashlib
import secrets
from datetime import timedelta
from django.db import models
from django.utils import timezone
from apps.tenants.models import TenantScopedModel
from apps.service_orders.models import ServiceOrder


class EstimateStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    DECLINED = 'declined', 'Declined'


class Estimate(TenantScopedModel):
    service_order = models.OneToOneField(ServiceOrder, on_delete=models.CASCADE, related_name='estimate')
    status = models.CharField(max_length=20, choices=EstimateStatus.choices, default=EstimateStatus.PENDING)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    portal_token_hash = models.CharField(max_length=128, blank=True)
    portal_token_expires_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by_name = models.CharField(max_length=255, blank=True)
    approved_ip = models.GenericIPAddressField(null=True, blank=True)
    approved_user_agent = models.TextField(blank=True)

    def generate_portal_token(self, ttl_hours=72):
        token = secrets.token_urlsafe(32)
        self.portal_token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        self.portal_token_expires_at = timezone.now() + timedelta(hours=ttl_hours)
        self.save(update_fields=['portal_token_hash', 'portal_token_expires_at'])
        return token

    def verify_portal_token(self, token):
        if not self.portal_token_hash or not self.portal_token_expires_at:
            return False
        if timezone.now() > self.portal_token_expires_at:
            return False
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        return secrets.compare_digest(self.portal_token_hash, token_hash)


class InvoiceStatus(models.TextChoices):
    UNPAID = 'unpaid', 'Unpaid'
    PARTIALLY_PAID = 'partially_paid', 'Partially Paid'
    PAID = 'paid', 'Paid'


class Invoice(TenantScopedModel):
    service_order = models.OneToOneField(ServiceOrder, on_delete=models.CASCADE, related_name='invoice')
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.UNPAID)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    issued_at = models.DateTimeField(auto_now_add=True)


class PaymentMethod(models.TextChoices):
    CARD = 'card', 'Card'
    ACH = 'ach', 'ACH'
    CASH = 'cash', 'Cash'
    CHECK = 'check', 'Check'


class Payment(TenantScopedModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True)
    paid_at = models.DateTimeField(default=timezone.now)
