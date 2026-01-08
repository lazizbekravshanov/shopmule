import hashlib
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import TenantDisplayToken
from .services import get_dashboard_data


class TVDashboardAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        token = request.query_params.get('token')
        range_key = request.query_params.get('range', 'today')
        if not token:
            return Response({'detail': 'token required'}, status=400)
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        display = TenantDisplayToken.objects.filter(token_hash=token_hash).first()
        if not display or not display.verify_token(token):
            return Response({'detail': 'invalid token'}, status=403)
        cache_key = f'tv-dashboard:{display.tenant_id}:{range_key}'
        data = cache.get(cache_key)
        if not data:
            data = get_dashboard_data(display.tenant, range_key)
            cache.set(cache_key, data, timeout=30)
        return Response(data)
