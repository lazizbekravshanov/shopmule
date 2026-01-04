import hashlib
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseForbidden
from django.views import View
from django.core.cache import cache
from django.utils import timezone
from apps.billing.models import Estimate, EstimateStatus
from apps.service_orders.models import ServiceOrderStatus
from apps.audit.utils import log_audit_event


class EstimatePortalView(View):
    template_name = 'portal/estimate.html'
    rate_limit_window = 60
    rate_limit_count = 20

    def get(self, request):
        token = request.GET.get('token')
        if not token:
            return HttpResponseForbidden('Invalid or expired token.')
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        estimate = get_object_or_404(Estimate, portal_token_hash=token_hash)
        if not estimate.verify_portal_token(token):
            return HttpResponseForbidden('Invalid or expired token.')
        ip = request.META.get('REMOTE_ADDR')
        cache_key = f'portal-rate:{ip}'
        count = cache.get(cache_key, 0)
        if count >= self.rate_limit_count:
            return HttpResponseForbidden('Rate limit exceeded.')
        cache.set(cache_key, count + 1, timeout=self.rate_limit_window)
        return render(request, self.template_name, {'estimate': estimate, 'token': token})

    def post(self, request):
        token = request.GET.get('token')
        if not token:
            return HttpResponseForbidden('Invalid or expired token.')
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        estimate = get_object_or_404(Estimate, portal_token_hash=token_hash)
        if not estimate.verify_portal_token(token):
            return HttpResponseForbidden('Invalid or expired token.')
        ip = request.META.get('REMOTE_ADDR')
        cache_key = f'portal-rate:{ip}'
        count = cache.get(cache_key, 0)
        if count >= self.rate_limit_count:
            return HttpResponseForbidden('Rate limit exceeded.')
        cache.set(cache_key, count + 1, timeout=self.rate_limit_window)
        action = request.POST.get('action')
        name = request.POST.get('name', '')
        if action not in ['approve', 'decline']:
            return HttpResponseForbidden('Invalid action.')
        estimate.status = EstimateStatus.APPROVED if action == 'approve' else EstimateStatus.DECLINED
        estimate.approved_at = timezone.now()
        estimate.approved_by_name = name
        estimate.approved_ip = ip
        estimate.approved_user_agent = request.META.get('HTTP_USER_AGENT', '')
        estimate.save(update_fields=['status', 'approved_at', 'approved_by_name', 'approved_ip', 'approved_user_agent'])
        if estimate.status == EstimateStatus.APPROVED:
            estimate.service_order.status = ServiceOrderStatus.APPROVED
            estimate.service_order.save(update_fields=['status'])
        log_audit_event(
            tenant=estimate.tenant,
            user=None,
            action='estimate_portal_action',
            description=f'Estimate {estimate.id} {estimate.status}',
            ip_address=ip,
            user_agent=estimate.approved_user_agent,
        )
        return render(request, self.template_name, {'estimate': estimate, 'token': token, 'submitted': True})
