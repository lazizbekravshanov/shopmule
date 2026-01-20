from django.db import models
from apps.tenants.models import TenantScopedModel


class ServiceOrderAIArtifact(TenantScopedModel):
    service_order = models.ForeignKey('service_orders.ServiceOrder', on_delete=models.CASCADE, related_name='ai_artifacts')
    kind = models.CharField(max_length=100)
    input_text = models.TextField(blank=True)
    output_json = models.JSONField()

    def __str__(self) -> str:
        return f"{self.kind} for SO-{self.service_order_id}"
