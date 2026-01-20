from datetime import timedelta

from django import template
from django.core.cache import cache
from django.db.models import Count, F, Sum
from django.utils import timezone

from apps.attendance.models import ShiftPunch, TimeEntry
from apps.billing.models import Estimate, EstimateStatus, Invoice, InvoiceStatus, Payment
from apps.inventory.models import InventoryAdjustment
from apps.parts.models import Part
from apps.service_orders.models import ServiceOrder, ServiceOrderStatus

register = template.Library()


@register.filter(name="has_group")
def has_group(user, group_name):
    if not user or not user.is_authenticated:
        return False
    return user.groups.filter(name=group_name).exists()


def _tenant_filter(queryset, tenant):
    if tenant:
        return queryset.filter(tenant=tenant)
    return queryset


def _status_counts(queryset, field_name="status"):
    return {
        row[field_name]: row["count"]
        for row in queryset.values(field_name).annotate(count=Count("id"))
    }


@register.simple_tag
def get_admin_metrics(user, range_days=None):
    try:
        range_days_int = int(range_days)
    except (TypeError, ValueError):
        range_days_int = 7
    if range_days_int not in {7, 30, 90}:
        range_days_int = 7

    tenant = getattr(user, "tenant", None)
    tenant_id = tenant.id if tenant else "none"
    user_id = user.id if user and user.is_authenticated else "anon"
    cache_key = f"admin-dashboard:{tenant_id}:{user_id}:{range_days_int}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    service_orders = _tenant_filter(ServiceOrder.objects.all(), tenant)
    status_counts = _status_counts(service_orders, "status")
    open_service_orders = sum(
        count for status, count in status_counts.items() if status != ServiceOrderStatus.CLOSED
    )

    estimates = _tenant_filter(Estimate.objects.all(), tenant)
    estimate_counts = _status_counts(estimates, "status")

    invoices = _tenant_filter(Invoice.objects.all(), tenant)
    invoice_counts = _status_counts(invoices, "status")

    parts_low = _tenant_filter(Part.objects.all(), tenant).filter(
        qty_on_hand__lte=F("reorder_point")
    ).count()

    parts_on_hand_total = _tenant_filter(Part.objects.all(), tenant).aggregate(
        total=Sum("qty_on_hand")
    )["total"] or 0

    range_start = timezone.now() - timedelta(days=range_days_int)
    adjustments = _tenant_filter(InventoryAdjustment.objects.all(), tenant).filter(
        adjusted_at__gte=range_start
    )
    inventory_adjustments_range = adjustments.count()
    parts_touched_range = adjustments.values("part").distinct().count()

    payments_today = _tenant_filter(Payment.objects.all(), tenant).filter(
        paid_at__gte=range_start
    ).count()

    invoices_issued_range = invoices.filter(issued_at__gte=range_start).count()

    open_shifts = 0
    open_time_entries = 0
    if user and user.is_authenticated:
        open_shifts = _tenant_filter(ShiftPunch.objects.all(), tenant).filter(
            user=user, clock_out_at__isnull=True
        ).count()
        open_time_entries = _tenant_filter(TimeEntry.objects.all(), tenant).filter(
            tech=user, clock_out__isnull=True
        ).count()

    comebacks = service_orders.filter(is_comeback=True).exclude(
        status=ServiceOrderStatus.CLOSED
    ).count()

    data = {
        "open_service_orders": open_service_orders,
        "awaiting_approval": status_counts.get(ServiceOrderStatus.AWAITING_APPROVAL, 0),
        "in_progress": status_counts.get(ServiceOrderStatus.IN_PROGRESS, 0),
        "ready_to_invoice": status_counts.get(ServiceOrderStatus.READY_TO_INVOICE, 0),
        "estimates_pending": estimate_counts.get(EstimateStatus.PENDING, 0),
        "invoices_unpaid": invoice_counts.get(InvoiceStatus.UNPAID, 0),
        "invoices_partially_paid": invoice_counts.get(InvoiceStatus.PARTIALLY_PAID, 0),
        "unpaid_invoices": invoice_counts.get(InvoiceStatus.UNPAID, 0)
        + invoice_counts.get(InvoiceStatus.PARTIALLY_PAID, 0),
        "payments_today": payments_today,
        "parts_low": parts_low,
        "parts_on_hand_total": parts_on_hand_total,
        "inventory_adjustments_range": inventory_adjustments_range,
        "parts_touched_range": parts_touched_range,
        "open_time_entries": open_time_entries,
        "open_shifts": open_shifts,
        "comebacks": comebacks,
        "invoices_issued_range": invoices_issued_range,
        "payments_range": payments_today,
        "range_days": range_days_int,
    }
    cache.set(cache_key, data, 60)
    return data
