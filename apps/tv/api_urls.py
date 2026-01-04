from django.urls import path
from .api import TVDashboardAPIView

urlpatterns = [
    path('dashboard', TVDashboardAPIView.as_view(), name='tv_dashboard_api'),
]
