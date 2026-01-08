from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.tenants.permissions import IsTenantUser
from apps.tenants.viewsets import TenantScopedViewSet
from apps.audit.utils import log_audit_event
from .models import ShiftPunch, ShiftPunchSource


class ShiftPunchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftPunch
        fields = ('id', 'user', 'clock_in_at', 'clock_out_at', 'source', 'ip_address', 'user_agent')


class ShiftPunchViewSet(TenantScopedViewSet):
    queryset = ShiftPunch.objects.all()
    serializer_class = ShiftPunchSerializer
    permission_classes = [IsTenantUser, IsAdminUser]


class ClockInView(APIView):
    permission_classes = [IsTenantUser]

    def post(self, request):
        if ShiftPunch.objects.for_tenant(request.user.tenant).filter(user=request.user, clock_out_at__isnull=True).exists():
            return Response({'detail': 'Already clocked in.'}, status=400)
        punch = ShiftPunch.objects.create(
            tenant=request.user.tenant,
            user=request.user,
            source=request.data.get('source', ShiftPunchSource.WEB),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='clock_in',
            description=f'Clock in punch {punch.id}',
            ip_address=punch.ip_address,
            user_agent=punch.user_agent,
        )
        return Response(ShiftPunchSerializer(punch).data, status=201)


class ClockOutView(APIView):
    permission_classes = [IsTenantUser]

    def post(self, request):
        punch = ShiftPunch.objects.for_tenant(request.user.tenant).filter(user=request.user, clock_out_at__isnull=True).first()
        if not punch:
            return Response({'detail': 'No open punch.'}, status=400)
        punch.clock_out_at = timezone.now()
        punch.save(update_fields=['clock_out_at'])
        log_audit_event(
            tenant=request.user.tenant,
            user=request.user,
            action='clock_out',
            description=f'Clock out punch {punch.id}',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(ShiftPunchSerializer(punch).data)


class MyAttendanceView(APIView):
    permission_classes = [IsTenantUser]

    def get(self, request):
        punches = ShiftPunch.objects.for_tenant(request.user.tenant).filter(user=request.user).order_by('-clock_in_at')[:10]
        return Response(ShiftPunchSerializer(punches, many=True).data)


class TeamAttendanceView(APIView):
    permission_classes = [IsTenantUser, IsAdminUser]

    def get(self, request):
        punches = ShiftPunch.objects.for_tenant(request.user.tenant).order_by('-clock_in_at')[:50]
        return Response(ShiftPunchSerializer(punches, many=True).data)
