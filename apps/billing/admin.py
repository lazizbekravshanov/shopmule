from django.contrib import admin
from .models import Estimate, Invoice, Payment


@admin.register(Estimate)
class EstimateAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'status', 'total', 'portal_token_expires_at', 'tenant')
    list_filter = ('status', 'tenant')
    actions = ['send_estimate_link']

    def send_estimate_link(self, request, queryset):
        for estimate in queryset:
            token = estimate.generate_portal_token()
            print(f"Estimate link for SO-{estimate.service_order_id}: /portal/estimate/?token={token}")
        self.message_user(request, 'Estimate links generated and logged to console.')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'status', 'total', 'issued_at', 'tenant')
    list_filter = ('status', 'tenant')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'method', 'amount', 'paid_at', 'tenant')
    list_filter = ('method', 'tenant')
