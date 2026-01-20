from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('tenants', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('action', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tenants.tenant')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.user')),
            ],
        ),
    ]
