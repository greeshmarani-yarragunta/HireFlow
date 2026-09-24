from django.urls import path
from applications.views import (
    CandidateApplicationListCreateView,
    CandidateApplicationDetailView,
    RecruiterApplicantListView,
    RecruiterApplicantDetailView,
    RecruiterApplicantStatusUpdateView,
    AdminApplicationListView,
    AdminApplicationDetailView,
)

urlpatterns = [
    # Candidate Application Endpoints
    path('candidate/applications/', CandidateApplicationListCreateView.as_view(), name='candidate-applications'),
    path('candidate/applications/<int:pk>/', CandidateApplicationDetailView.as_view(), name='candidate-application-detail'),

    # Recruiter Applicant Management Endpoints
    path('recruiter/applicants/', RecruiterApplicantListView.as_view(), name='recruiter-applicants'),
    path('recruiter/applicants/<int:pk>/', RecruiterApplicantDetailView.as_view(), name='recruiter-applicant-detail'),
    path('recruiter/applicants/<int:pk>/status/', RecruiterApplicantStatusUpdateView.as_view(), name='recruiter-applicant-status'),

    # Admin Application Endpoints
    path('admin/applications/', AdminApplicationListView.as_view(), name='admin-applications'),
    path('admin/applications/<int:pk>/', AdminApplicationDetailView.as_view(), name='admin-application-detail'),
]
