from django.urls import path
from .time_api import TimeEntryStartView, TimeEntryStopView

urlpatterns = [
    path('start', TimeEntryStartView.as_view(), name='time_entry_start'),
    path('stop', TimeEntryStopView.as_view(), name='time_entry_stop'),
]
