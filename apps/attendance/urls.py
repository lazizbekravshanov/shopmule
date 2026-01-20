from django.urls import path
from .api import ClockInView, ClockOutView, MyAttendanceView, TeamAttendanceView

urlpatterns = [
    path('clock-in', ClockInView.as_view(), name='clock_in'),
    path('clock-out', ClockOutView.as_view(), name='clock_out'),
    path('me', MyAttendanceView.as_view(), name='attendance_me'),
    path('team', TeamAttendanceView.as_view(), name='attendance_team'),
]
