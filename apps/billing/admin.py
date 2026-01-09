from datetime import timedelta

from django.contrib import admin
from django.utils import timezone
from .models import Estimate, Invoice, Payment


class InvoiceStatusGroupFilter(admin.SimpleListFilter):
    title = 'status group'
    parameter_name = 'status_group'

    def lookups(self, request, model_admin):
        return (('open', 'Unpaid + partial'),)

    def queryset(self, request, queryset):
        if self.value() == 'open':
            return queryset.filter(status__in=['unpaid', 'partially_paid'])
        return queryset


class DateRangeFilter(admin.SimpleListFilter):
    title = 'range'
    parameter_name = 'range'
    date_field = None

    def lookups(self, request, model_admin):
        return (('7', 'Last 7 days'), ('30', 'Last 30 days'), ('90', 'Last 90 days'))

    def queryset(self, request, queryset):
        if not self.value() or not self.date_field:
            return queryset
        try:
            days = int(self.value())
        except ValueError:
            return queryset
        if days not in {7, 30, 90}:
            return queryset
        range_start = timezone.now() - timedelta(days=days)
        return queryset.filter(**{f'{self.date_field}__gte': range_start})


class InvoiceIssuedRangeFilter(DateRangeFilter):
    title = 'issued range'
    date_field = 'issued_at'


class PaymentPaidRangeFilter(DateRangeFilter):
    title = 'paid range'
    date_field = 'paid_at'


@admin.register(Estimate)
class EstimateAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'status', 'total', 'portal_token_expires_at', 'tenant')
    list_filter = ('status', 'tenant')
    actions = ['send_estimate_link']
    readonly_fields = (
        'portal_token_hash',
        'portal_token_expires_at',
        'approved_at',
        'approved_by_name',
        'approved_ip',
        'approved_user_agent',
    )

    def send_estimate_link(self, request, queryset):
        for estimate in queryset:
            token = estimate.generate_portal_token()
            print(f"Estimate link for SO-{estimate.service_order_id}: /portal/estimate/?token={token}")
        self.message_user(request, 'Estimate links generated and logged to console.')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'status', 'total', 'issued_at', 'tenant')
    list_filter = (InvoiceStatusGroupFilter, InvoiceIssuedRangeFilter, 'status', 'tenant')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'method', 'amount', 'paid_at', 'tenant')
    list_filter = (PaymentPaidRangeFilter, 'method', 'tenant')
