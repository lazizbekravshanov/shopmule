from rest_framework import viewsets
from .permissions import IsTenantUser


class TenantScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTenantUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.for_tenant(self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
