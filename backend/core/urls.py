from django.urls import path
from core.views import (
    CandidateDashboardView,
    RecruiterDashboardView,
    AdminDashboardView,
    PlatformStatsView,
)

urlpatterns = [
    path('candidate/dashboard/', CandidateDashboardView.as_view(), name='candidate-dashboard'),
    path('recruiter/dashboard/', RecruiterDashboardView.as_view(), name='recruiter-dashboard'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('platform-stats/', PlatformStatsView.as_view(), name='platform-stats'),
]
