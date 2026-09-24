from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import (
    CustomTokenObtainPairView,
    CandidateRegisterView,
    RecruiterRegisterView,
    CurrentUserView,
    CandidateProfileView,
    RecruiterProfileView,
    AdminUserListView,
    AdminUserToggleStatusView,
)

urlpatterns = [
    path('auth/register/candidate/', CandidateRegisterView.as_view(), name='candidate-register'),
    path('auth/register/recruiter/', RecruiterRegisterView.as_view(), name='recruiter-register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('candidate/profile/', CandidateProfileView.as_view(), name='candidate-profile'),
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/users/<int:pk>/toggle-status/', AdminUserToggleStatusView.as_view(), name='admin-user-toggle-status'),
]
