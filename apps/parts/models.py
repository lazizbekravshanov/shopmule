from django.db import models
from apps.tenants.models import TenantScopedModel


class Part(TenantScopedModel):
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    vendor = models.CharField(max_length=255, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    qty_on_hand = models.IntegerField(default=0)
    reorder_point = models.IntegerField(default=0)
    bin_location = models.CharField(max_length=100, blank=True)

    def __str__(self) -> str:
        return f"{self.sku} - {self.description[:30]}"
