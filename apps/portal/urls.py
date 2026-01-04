from django.urls import path
from .views import EstimatePortalView

urlpatterns = [
    path('estimate/', EstimatePortalView.as_view(), name='estimate_portal'),
]
