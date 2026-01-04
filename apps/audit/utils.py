from .models import AuditLog


def log_audit_event(*, tenant, user, action, description='', ip_address=None, user_agent=''):
    AuditLog.objects.create(
        tenant=tenant,
        user=user,
        action=action,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent,
    )
