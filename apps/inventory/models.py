from django.db import models, transaction
from django.utils import timezone
from apps.tenants.models import TenantScopedModel


class InventoryAdjustment(TenantScopedModel):
    part = models.ForeignKey('parts.Part', on_delete=models.CASCADE, related_name='adjustments')
    quantity_change = models.IntegerField()
    reason = models.CharField(max_length=255)
    adjusted_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        with transaction.atomic():
            super().save(*args, **kwargs)
            if is_new:
                self.part.qty_on_hand = models.F('qty_on_hand') + self.quantity_change
                self.part.save(update_fields=['qty_on_hand'])
