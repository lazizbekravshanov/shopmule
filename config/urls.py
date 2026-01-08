from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.customers.api import CustomerViewSet
from apps.units.api import UnitVehicleViewSet
from apps.service_orders.api import ServiceOrderViewSet
from apps.parts.api import PartViewSet
from apps.billing.api import InvoiceViewSet, PaymentViewSet, EstimateViewSet
from apps.inventory.api import InventoryAdjustmentViewSet
from apps.attendance.api import ShiftPunchViewSet
from apps.ai.api import ServiceOrderAIArtifactViewSet
from apps.reports.api import ReportsViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'units', UnitVehicleViewSet)
router.register(r'service-orders', ServiceOrderViewSet)
router.register(r'parts', PartViewSet)
router.register(r'estimates', EstimateViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'inventory-adjustments', InventoryAdjustmentViewSet)
router.register(r'attendance/punches', ShiftPunchViewSet)
router.register(r'ai/artifacts', ServiceOrderAIArtifactViewSet)
router.register(r'reports', ReportsViewSet, basename='reports')

urlpatterns = [
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/time-entries/', include('apps.attendance.time_urls')),
    path('api/tv/', include('apps.tv.api_urls')),
    path('portal/', include('apps.portal.urls')),
    path('tv/', include('apps.tv.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
