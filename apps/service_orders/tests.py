from django.test import TestCase
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.customers.models import Customer
from apps.service_orders.models import ServiceOrder, ServiceOrderStatus


class ServiceOrderStatusTests(TestCase):
    def setUp(self):
        tenant = Tenant.objects.create(name='Tenant', slug='tenant')
        self.user = User.objects.create_user(username='writer', password='pass', tenant=tenant)
        customer = Customer.objects.create(tenant=tenant, name='Fleet Co')
        self.service_order = ServiceOrder.objects.create(tenant=tenant, customer=customer)

    def test_valid_transition(self):
        self.service_order.transition_status(ServiceOrderStatus.AWAITING_APPROVAL)
        self.assertEqual(self.service_order.status, ServiceOrderStatus.AWAITING_APPROVAL)

    def test_invalid_transition(self):
        with self.assertRaises(ValueError):
            self.service_order.transition_status(ServiceOrderStatus.IN_PROGRESS)
