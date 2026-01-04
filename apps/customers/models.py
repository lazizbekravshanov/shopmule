from django.db import models
from apps.tenants.models import TenantScopedModel


class Customer(TenantScopedModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    billing_terms = models.CharField(max_length=100, blank=True)

    def __str__(self) -> str:
        return self.name
