from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('parts', '0001_initial'),
        ('tenants', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InventoryAdjustment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('quantity_change', models.IntegerField()),
                ('reason', models.CharField(max_length=255)),
                ('adjusted_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('part', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='adjustments', to='parts.part')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
            ],
        ),
    ]
