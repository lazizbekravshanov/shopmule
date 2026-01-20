from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.utils import timezone
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.customers.models import Customer
from apps.units.models import UnitVehicle, PreventiveMaintenanceSchedule
from apps.service_orders.models import ServiceOrder, ServiceOrderStatus
from apps.parts.models import Part
from apps.billing.models import Estimate
from apps.tv.models import TenantDisplayToken


class Command(BaseCommand):
    help = 'Seed demo tenant, users, and sample data.'

    def handle(self, *args, **options):
        tenant, _ = Tenant.objects.get_or_create(name='Demo Fleet', slug='demo-fleet')

        groups = {
            'Owner/Admin': Group.objects.get_or_create(name='Owner/Admin')[0],
            'Service Writer': Group.objects.get_or_create(name='Service Writer')[0],
            'Technician': Group.objects.get_or_create(name='Technician')[0],
            'Parts Manager': Group.objects.get_or_create(name='Parts Manager')[0],
            'Accounting': Group.objects.get_or_create(name='Accounting')[0],
            'Customer': Group.objects.get_or_create(name='Customer')[0],
        }

        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@example.com', 'tenant': tenant, 'is_staff': True, 'is_superuser': True},
        )
        if not admin.has_usable_password():
            admin.set_password('admin123')
            admin.save(update_fields=['password'])
        writer, _ = User.objects.get_or_create(
            username='service_writer',
            defaults={'email': 'writer@example.com', 'tenant': tenant},
        )
        if not writer.has_usable_password():
            writer.set_password('writer123')
            writer.save(update_fields=['password'])
        tech, _ = User.objects.get_or_create(
            username='technician',
            defaults={'email': 'tech@example.com', 'tenant': tenant},
        )
        if not tech.has_usable_password():
            tech.set_password('tech123')
            tech.save(update_fields=['password'])
        parts, _ = User.objects.get_or_create(
            username='parts_manager',
            defaults={'email': 'parts@example.com', 'tenant': tenant},
        )
        if not parts.has_usable_password():
            parts.set_password('parts123')
            parts.save(update_fields=['password'])
        accounting, _ = User.objects.get_or_create(
            username='accounting',
            defaults={'email': 'accounting@example.com', 'tenant': tenant},
        )
        if not accounting.has_usable_password():
            accounting.set_password('accounting123')
            accounting.save(update_fields=['password'])

        writer.groups.add(groups['Service Writer'])
        tech.groups.add(groups['Technician'])
        parts.groups.add(groups['Parts Manager'])
        accounting.groups.add(groups['Accounting'])

        customer = Customer.objects.create(tenant=tenant, name='Acme Logistics', phone='555-0100')
        unit = UnitVehicle.objects.create(tenant=tenant, customer=customer, vin='1HGBH41JXMN109186', make='Volvo', model='VNL', year=2020, plate='TRK-100')
        PreventiveMaintenanceSchedule.objects.create(
            tenant=tenant,
            unit=unit,
            mileage_interval=15000,
            days_interval=90,
            engine_hours_interval=300,
            last_service_date=timezone.now().date(),
            last_service_mileage=120000,
        )

        service_order = ServiceOrder.objects.create(
            tenant=tenant,
            customer=customer,
            unit=unit,
            status=ServiceOrderStatus.AWAITING_APPROVAL,
            internal_notes='Brake inspection required',
        )

        Estimate.objects.create(
            tenant=tenant,
            service_order=service_order,
            total=1200.00,
        )

        Part.objects.create(
            tenant=tenant,
            sku='BRK-001',
            description='Brake Pad Set',
            vendor='FleetParts Inc',
            cost=200.00,
            price=350.00,
            qty_on_hand=10,
            reorder_point=3,
            bin_location='A1',
        )

        display_token, _ = TenantDisplayToken.objects.get_or_create(tenant=tenant)
        token = display_token.generate_token()
        self.stdout.write(self.style.WARNING(f'TV dashboard token: {token}'))

        self.stdout.write(self.style.SUCCESS('Demo data created.'))
