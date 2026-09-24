from django.urls import path
from jobs.views import (
    PublicJobListView,
    PublicJobDetailView,
    RecruiterJobListView,
    RecruiterJobDetailView,
    AdminJobListView,
    AdminJobReviewView,
    CandidateSavedJobListCreateView,
    CandidateSavedJobDeleteView,
)

urlpatterns = [
    # Public Job Search & Details
    path('jobs/', PublicJobListView.as_view(), name='public-jobs-list'),
    path('jobs/<int:pk>/', PublicJobDetailView.as_view(), name='public-job-detail'),

    # Recruiter Job Endpoints
    path('recruiter/jobs/', RecruiterJobListView.as_view(), name='recruiter-jobs-list'),
    path('recruiter/jobs/<int:pk>/', RecruiterJobDetailView.as_view(), name='recruiter-job-detail'),

    # Admin Job Management
    path('admin/jobs/', AdminJobListView.as_view(), name='admin-jobs-list'),
    path('admin/jobs/<int:pk>/review/', AdminJobReviewView.as_view(), name='admin-job-review'),

    # Candidate Saved Jobs
    path('candidate/saved-jobs/', CandidateSavedJobListCreateView.as_view(), name='candidate-saved-jobs'),
    path('candidate/saved-jobs/<int:job_id>/', CandidateSavedJobDeleteView.as_view(), name='candidate-saved-job-delete'),
]
