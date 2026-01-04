from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from apps.tenants.models import TenantScopedModel


class ShiftPunchSource(models.TextChoices):
    WEB = 'WEB', 'Web'
    KIOSK = 'KIOSK', 'Kiosk'


class ShiftPunch(TenantScopedModel):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    clock_in_at = models.DateTimeField(default=timezone.now)
    clock_out_at = models.DateTimeField(null=True, blank=True)
    source = models.CharField(max_length=10, choices=ShiftPunchSource.choices, default=ShiftPunchSource.WEB)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'user'],
                condition=models.Q(clock_out_at__isnull=True),
                name='unique_open_shift_punch_per_user',
            )
        ]

    def clean(self):
        if self.clock_out_at and self.clock_out_at <= self.clock_in_at:
            raise ValidationError('Clock-out must be after clock-in.')


class TimeEntry(TenantScopedModel):
    tech = models.ForeignKey('users.User', on_delete=models.CASCADE)
    service_order = models.ForeignKey('service_orders.ServiceOrder', on_delete=models.CASCADE)
    clock_in = models.DateTimeField(default=timezone.now)
    clock_out = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'tech'],
                condition=models.Q(clock_out__isnull=True),
                name='unique_open_time_entry_per_tech',
            )
        ]

    def clean(self):
        if self.clock_out and self.clock_out <= self.clock_in:
            raise ValidationError('Clock-out must be after clock-in.')
