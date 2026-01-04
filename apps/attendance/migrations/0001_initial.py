from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('service_orders', '0001_initial'),
        ('tenants', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShiftPunch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('clock_in_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('clock_out_at', models.DateTimeField(blank=True, null=True)),
                ('source', models.CharField(choices=[('WEB', 'Web'), ('KIOSK', 'Kiosk')], default='WEB', max_length=10)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
            ],
        ),
        migrations.CreateModel(
            name='TimeEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('clock_in', models.DateTimeField(default=django.utils.timezone.now)),
                ('clock_out', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('service_order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='service_orders.serviceorder')),
                ('tech', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
        migrations.AddConstraint(
            model_name='shiftpunch',
            constraint=models.UniqueConstraint(condition=models.Q(('clock_out_at__isnull', True)), fields=('tenant', 'user'), name='unique_open_shift_punch_per_user'),
        ),
        migrations.AddConstraint(
            model_name='timeentry',
            constraint=models.UniqueConstraint(condition=models.Q(('clock_out__isnull', True)), fields=('tenant', 'tech'), name='unique_open_time_entry_per_tech'),
        ),
    ]
