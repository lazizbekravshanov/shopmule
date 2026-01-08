from django.test import TestCase
from rest_framework.test import APIClient
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.customers.models import Customer


class TenantIsolationTests(TestCase):
    def setUp(self):
        self.tenant_a = Tenant.objects.create(name='Tenant A', slug='tenant-a')
        self.tenant_b = Tenant.objects.create(name='Tenant B', slug='tenant-b')
        self.user_a = User.objects.create_user(username='user_a', password='pass', tenant=self.tenant_a)
        self.user_b = User.objects.create_user(username='user_b', password='pass', tenant=self.tenant_b)
        Customer.objects.create(tenant=self.tenant_a, name='Customer A')
        Customer.objects.create(tenant=self.tenant_b, name='Customer B')

    def test_customer_list_is_tenant_scoped(self):
        client = APIClient()
        client.force_authenticate(user=self.user_a)
        response = client.get('/api/customers/')
        self.assertEqual(response.status_code, 200)
        names = [item['name'] for item in response.json()]
        self.assertIn('Customer A', names)
        self.assertNotIn('Customer B', names)
