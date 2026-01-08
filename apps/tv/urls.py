from django.urls import path
from .views import TVDashboardView

urlpatterns = [
    path('dashboard/', TVDashboardView.as_view(), name='tv_dashboard'),
]
