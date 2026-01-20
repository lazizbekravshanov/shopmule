from django.contrib import admin
from .models import ServiceOrderAIArtifact


@admin.register(ServiceOrderAIArtifact)
class ServiceOrderAIArtifactAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'kind', 'tenant', 'created_at')
    list_filter = ('kind', 'tenant')
