from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from interviews.models import Interview
from applications.models import Application
from interviews.serializers import InterviewSerializer, InterviewCreateSerializer
from accounts.permissions import IsCandidate, IsRecruiter, IsAdminUserRole
from notifications.services import send_notification
from notifications.models import Notification

class CandidateInterviewListView(generics.ListAPIView):
    """
    Candidate endpoint to view all their scheduled and completed interviews.
    """
    permission_classes = [IsCandidate]
    serializer_class = InterviewSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'interview_type']
    ordering_fields = ['date', 'time']
    ordering = ['date', 'time']

    def get_queryset(self):
        return Interview.objects.filter(candidate=self.request.user).select_related(
            'job', 'recruiter', 'application'
        )


class CandidateInterviewDetailView(generics.RetrieveAPIView):
    """
    Candidate endpoint to view single interview details.
    """
    permission_classes = [IsCandidate]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        return Interview.objects.filter(candidate=self.request.user).select_related(
            'job', 'recruiter', 'application'
        )


class RecruiterInterviewListCreateView(generics.ListCreateAPIView):
    """
    Recruiter endpoint to view all interviews they have scheduled or schedule a new one.
    """
    permission_classes = [IsRecruiter]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'interview_type', 'job_id']
    search_fields = ['candidate__name', 'candidate__email', 'job__title']
    ordering_fields = ['date', 'time']
    ordering = ['date', 'time']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InterviewCreateSerializer
        return InterviewSerializer

    def get_queryset(self):
        return Interview.objects.filter(recruiter=self.request.user).select_related(
            'candidate', 'job', 'application'
        )

    def perform_create(self, serializer):
        interview = serializer.save()

        # Send notification to candidate
        send_notification(
            recipient=interview.candidate,
            title=f"Interview Scheduled: {interview.job.title}",
            message=f"You have a {interview.interview_type} interview for '{interview.job.title}' scheduled on {interview.date} at {interview.time}.",
            notification_type=Notification.NotificationType.INTERVIEW
        )


class RecruiterInterviewDetailUpdateView(generics.RetrieveUpdateAPIView):
    """
    Recruiter endpoint to view or update interview details (status, notes, link, etc.).
    """
    permission_classes = [IsRecruiter]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        return Interview.objects.filter(recruiter=self.request.user).select_related(
            'candidate', 'job', 'application'
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        interview = serializer.save()
        new_status = interview.status

        # If status changed to COMPLETED, update application status as well
        if new_status == Interview.Status.COMPLETED and old_status != Interview.Status.COMPLETED:
            if interview.application.can_transition_to(Application.Status.INTERVIEW_COMPLETED):
                interview.application.status = Application.Status.INTERVIEW_COMPLETED
                interview.application.save()

            send_notification(
                recipient=interview.candidate,
                title=f"Interview Completed: {interview.job.title}",
                message=f"Your {interview.interview_type} interview for '{interview.job.title}' has been marked as Completed.",
                notification_type=Notification.NotificationType.INTERVIEW
            )

        elif new_status == Interview.Status.CANCELLED and old_status != Interview.Status.CANCELLED:
            send_notification(
                recipient=interview.candidate,
                title=f"Interview Cancelled: {interview.job.title}",
                message=f"Your {interview.interview_type} interview for '{interview.job.title}' on {interview.date} has been cancelled.",
                notification_type=Notification.NotificationType.INTERVIEW
            )


class AdminInterviewListView(generics.ListAPIView):
    """
    Admin endpoint to view all interviews across platform.
    """
    permission_classes = [IsAdminUserRole]
    serializer_class = InterviewSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'interview_type']
    search_fields = ['candidate__name', 'candidate__email', 'job__title', 'recruiter__name']
    ordering_fields = ['date', 'time']
    ordering = ['-date', '-time']

    def get_queryset(self):
        return Interview.objects.all().select_related('candidate', 'recruiter', 'job')
