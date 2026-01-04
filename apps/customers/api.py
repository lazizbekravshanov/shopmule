from rest_framework import serializers
from apps.tenants.viewsets import TenantScopedViewSet
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('id', 'name', 'phone', 'email', 'billing_terms', 'created_at', 'updated_at')


class CustomerViewSet(TenantScopedViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
