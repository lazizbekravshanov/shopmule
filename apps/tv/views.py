import hashlib
from django.shortcuts import render
from django.http import HttpResponseForbidden
from django.views import View
from django.core.cache import cache
from .models import TenantDisplayToken


class TVDashboardView(View):
    template_name = 'tv/dashboard.html'
    rate_limit_window = 60
    rate_limit_count = 60

    def get(self, request):
        token = request.GET.get('token')
        if not token:
            return HttpResponseForbidden('Token required.')
        ip = request.META.get('REMOTE_ADDR')
        cache_key = f'tv-rate:{ip}'
        count = cache.get(cache_key, 0)
        if count >= self.rate_limit_count:
            return HttpResponseForbidden('Rate limit exceeded.')
        cache.set(cache_key, count + 1, timeout=self.rate_limit_window)
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        display = TenantDisplayToken.objects.filter(token_hash=token_hash).first()
        if not display or not display.verify_token(token):
            return HttpResponseForbidden('Invalid token.')
        return render(request, self.template_name, {'token': token})
