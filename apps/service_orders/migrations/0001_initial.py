from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('customers', '0001_initial'),
        ('parts', '0001_initial'),
        ('tenants', '0001_initial'),
        ('units', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ServiceOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('awaiting_approval', 'Awaiting Approval'), ('approved', 'Approved'), ('in_progress', 'In Progress'), ('ready_to_invoice', 'Ready to Invoice'), ('invoiced', 'Invoiced'), ('closed', 'Closed')], default='draft', max_length=50)),
                ('internal_notes', models.TextField(blank=True)),
                ('customer_notes', models.TextField(blank=True)),
                ('opened_at', models.DateTimeField(auto_now_add=True)),
                ('closed_at', models.DateTimeField(blank=True, null=True)),
                ('in_progress_at', models.DateTimeField(blank=True, null=True)),
                ('is_comeback', models.BooleanField(default=False)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='customers.customer')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
                ('unit', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='units.unitvehicle')),
            ],
        ),
        migrations.CreateModel(
            name='ServiceOrderLaborLine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('hours', models.DecimalField(decimal_places=2, max_digits=6)),
                ('rate', models.DecimalField(decimal_places=2, max_digits=8)),
                ('description', models.TextField()),
                ('billed_hours', models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ('service_order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='labor_lines', to='service_orders.serviceorder')),
                ('tech', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.user')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
        migrations.CreateModel(
            name='ServiceOrderPartLine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('qty', models.PositiveIntegerField(default=1)),
                ('unit_cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('taxable', models.BooleanField(default=True)),
                ('part', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='parts.part')),
                ('service_order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='part_lines', to='service_orders.serviceorder')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('file', models.FileField(upload_to='attachments/')),
                ('service_order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='service_orders.serviceorder')),
                ('uploaded_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.user')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
    ]
