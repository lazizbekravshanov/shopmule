from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.tenants.models import Tenant


class User(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)
    phone = models.CharField(max_length=50, blank=True)

    def __str__(self) -> str:
        return self.get_username()
