from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('customers', '0001_initial'),
        ('tenants', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UnitVehicle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('vin', models.CharField(max_length=50)),
                ('make', models.CharField(blank=True, max_length=100)),
                ('model', models.CharField(blank=True, max_length=100)),
                ('year', models.PositiveIntegerField(blank=True, null=True)),
                ('plate', models.CharField(blank=True, max_length=50)),
                ('odometer', models.PositiveIntegerField(blank=True, null=True)),
                ('engine_hours', models.PositiveIntegerField(blank=True, null=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='units', to='customers.customer')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
        migrations.CreateModel(
            name='PreventiveMaintenanceSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('mileage_interval', models.PositiveIntegerField(blank=True, null=True)),
                ('days_interval', models.PositiveIntegerField(blank=True, null=True)),
                ('engine_hours_interval', models.PositiveIntegerField(blank=True, null=True)),
                ('last_service_date', models.DateField(blank=True, null=True)),
                ('last_service_mileage', models.PositiveIntegerField(blank=True, null=True)),
                ('last_service_engine_hours', models.PositiveIntegerField(blank=True, null=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
                ('unit', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='pm_schedule', to='units.unitvehicle')),
            ],
        ),
    ]
