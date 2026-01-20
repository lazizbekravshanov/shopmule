from datetime import timedelta
from django.db import models
from django.utils import timezone
from apps.attendance.models import ShiftPunch, TimeEntry
from apps.service_orders.models import ServiceOrder, ServiceOrderLaborLine, ServiceOrderStatus
from apps.users.models import User


def _range_start(range_key):
    now = timezone.now()
    if range_key == 'week':
        start = now - timedelta(days=now.weekday())
        return start.replace(hour=0, minute=0, second=0, microsecond=0)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def get_dashboard_data(tenant, range_key='today'):
    now = timezone.now()
    start = _range_start(range_key)

    open_punches = ShiftPunch.objects.for_tenant(tenant).filter(clock_out_at__isnull=True)
    clocked_in = [
        {
            'user_id': punch.user_id,
            'name': punch.user.get_full_name() or punch.user.username,
            'duration_minutes': int((now - punch.clock_in_at).total_seconds() / 60),
        }
        for punch in open_punches
    ]

    active_orders_qs = ServiceOrder.objects.for_tenant(tenant).filter(status=ServiceOrderStatus.IN_PROGRESS)
    active_orders = list(active_orders_qs.order_by('-opened_at')[:10].values('id', 'customer__name', 'unit__vin', 'status'))

    techs = User.objects.filter(tenant=tenant, is_active=True)
    leaderboard = []
    for tech in techs:
        clocked_entries = ShiftPunch.objects.for_tenant(tenant).filter(user=tech, clock_in_at__gte=start)
        clocked_seconds = 0
        for punch in clocked_entries:
            end = punch.clock_out_at or now
            clocked_seconds += max(0, (end - punch.clock_in_at).total_seconds())
        wrench_entries = TimeEntry.objects.for_tenant(tenant).filter(tech=tech, clock_in__gte=start)
        wrench_seconds = 0
        for entry in wrench_entries:
            end = entry.clock_out or now
            wrench_seconds += max(0, (end - entry.clock_in).total_seconds())
        billed_hours = (
            ServiceOrderLaborLine.objects.for_tenant(tenant)
            .filter(tech=tech, service_order__opened_at__gte=start)
            .aggregate(total=models.Sum('billed_hours'))['total']
            or 0
        )
        clocked_hours = round(clocked_seconds / 3600, 2)
        wrench_hours = round(wrench_seconds / 3600, 2)
        utilization = round((wrench_hours / clocked_hours) if clocked_hours else 0, 2)
        efficiency = round((float(billed_hours) / wrench_hours) if wrench_hours else 0, 2)
        leaderboard.append(
            {
                'tech_id': tech.id,
                'name': tech.get_full_name() or tech.username,
                'clocked_hours': clocked_hours,
                'wrench_hours': wrench_hours,
                'billed_hours': float(billed_hours),
                'utilization': utilization,
                'efficiency': efficiency,
            }
        )

    closed_orders = ServiceOrder.objects.for_tenant(tenant).filter(closed_at__gte=start)
    durations = []
    for order in closed_orders:
        if order.in_progress_at and order.closed_at:
            durations.append((order.closed_at - order.in_progress_at).total_seconds())
    avg_seconds = int(sum(durations) / len(durations)) if durations else 0

    return {
        'clocked_in': clocked_in,
        'active_orders': {
            'count': active_orders_qs.count(),
            'top': active_orders,
        },
        'leaderboard': leaderboard,
        'throughput': {
            'jobs_closed': closed_orders.count(),
            'average_in_progress_to_closed_minutes': int(avg_seconds / 60) if avg_seconds else 0,
            'comebacks': closed_orders.filter(is_comeback=True).count(),
        },
    }
