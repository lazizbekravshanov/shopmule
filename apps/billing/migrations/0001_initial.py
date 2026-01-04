from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('service_orders', '0001_initial'),
        ('tenants', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Estimate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('declined', 'Declined')], default='pending', max_length=20)),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('portal_token_hash', models.CharField(blank=True, max_length=128)),
                ('portal_token_expires_at', models.DateTimeField(blank=True, null=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('approved_by_name', models.CharField(blank=True, max_length=255)),
                ('approved_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('approved_user_agent', models.TextField(blank=True)),
                ('service_order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='estimate', to='service_orders.serviceorder')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('unpaid', 'Unpaid'), ('partially_paid', 'Partially Paid'), ('paid', 'Paid')], default='unpaid', max_length=20)),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('issued_at', models.DateTimeField(auto_now_add=True)),
                ('service_order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='service_orders.serviceorder')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('method', models.CharField(choices=[('card', 'Card'), ('ach', 'ACH'), ('cash', 'Cash'), ('check', 'Check')], max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('reference', models.CharField(blank=True, max_length=255)),
                ('paid_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='billing.invoice')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
    ]
