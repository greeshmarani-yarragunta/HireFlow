from django.urls import path
from interviews.views import (
    CandidateInterviewListView,
    CandidateInterviewDetailView,
    RecruiterInterviewListCreateView,
    RecruiterInterviewDetailUpdateView,
    AdminInterviewListView,
)

urlpatterns = [
    # Candidate Interview Endpoints
    path('candidate/interviews/', CandidateInterviewListView.as_view(), name='candidate-interviews'),
    path('candidate/interviews/<int:pk>/', CandidateInterviewDetailView.as_view(), name='candidate-interview-detail'),

    # Recruiter Interview Endpoints
    path('recruiter/interviews/', RecruiterInterviewListCreateView.as_view(), name='recruiter-interviews'),
    path('recruiter/interviews/<int:pk>/', RecruiterInterviewDetailUpdateView.as_view(), name='recruiter-interview-detail'),

    # Admin Interview Endpoints
    path('admin/interviews/', AdminInterviewListView.as_view(), name='admin-interviews'),
]
