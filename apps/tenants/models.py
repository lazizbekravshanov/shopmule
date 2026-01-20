from django.db import models


class Tenant(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class TenantQuerySet(models.QuerySet):
    def for_tenant(self, tenant):
        if tenant is None:
            return self.none()
        return self.filter(tenant=tenant)


class TenantScopedModel(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantQuerySet.as_manager()

    class Meta:
        abstract = True
