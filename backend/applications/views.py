from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from applications.models import Application
from jobs.models import Job
from applications.serializers import (
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationStatusUpdateSerializer,
)
from accounts.permissions import IsCandidate, IsRecruiter, IsAdminUserRole
from notifications.services import send_notification
from notifications.models import Notification

class CandidateApplicationListCreateView(generics.ListCreateAPIView):
    """
    Candidate endpoint to view all their applications and submit a new application.
    """
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['applied_at', 'match_score']
    ordering = ['-applied_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user).select_related('job', 'job__recruiter')

    def perform_create(self, serializer):
        application = serializer.save()

        # Notify candidate
        send_notification(
            recipient=self.request.user,
            title="Application Submitted",
            message=f"You successfully applied for '{application.job.title}' at {application.job.company}. Match score: {application.match_score}%.",
            notification_type=Notification.NotificationType.APPLICATION
        )

        # Notify recruiter
        send_notification(
            recipient=application.job.recruiter,
            title="New Job Applicant",
            message=f"{self.request.user.name} applied for '{application.job.title}'. Match score: {application.match_score}%.",
            notification_type=Notification.NotificationType.APPLICATION
        )


class CandidateApplicationDetailView(generics.RetrieveAPIView):
    """
    Candidate endpoint to view details of their own application.
    """
    permission_classes = [IsCandidate]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user).select_related('job', 'job__recruiter')


class RecruiterApplicantListView(generics.ListAPIView):
    """
    Recruiter endpoint to view applicants for their jobs.
    Optionally filters by job_id, status, match_score.
    """
    permission_classes = [IsRecruiter]
    serializer_class = ApplicationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['candidate__name', 'candidate__email', 'job__title']
    ordering_fields = ['applied_at', 'match_score']
    ordering = ['-applied_at']

    def get_queryset(self):
        queryset = Application.objects.filter(job__recruiter=self.request.user).select_related(
            'candidate', 'candidate__candidate_profile', 'job'
        )
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        min_score = self.request.query_params.get('min_score')
        if min_score:
            queryset = queryset.filter(match_score__gte=int(min_score))
        return queryset


class RecruiterApplicantDetailView(generics.RetrieveAPIView):
    """
    Recruiter endpoint to view single applicant details and match analysis.
    """
    permission_classes = [IsRecruiter]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(job__recruiter=self.request.user).select_related(
            'candidate', 'candidate__candidate_profile', 'job'
        )


class RecruiterApplicantStatusUpdateView(APIView):
    """
    Recruiter endpoint to update application status following the strict state machine.
    """
    permission_classes = [IsRecruiter]

    def patch(self, request, pk):
        application = get_object_or_404(
            Application.objects.select_related('candidate', 'job'),
            pk=pk,
            job__recruiter=request.user
        )

        serializer = ApplicationStatusUpdateSerializer(data=request.data, context={'instance': application})
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            old_status = application.status
            application.status = new_status
            application.save()

            # Status human readable labels for notification
            status_labels = {
                Application.Status.UNDER_REVIEW: "is now Under Review",
                Application.Status.SHORTLISTED: "has been Shortlisted!",
                Application.Status.INTERVIEW_SCHEDULED: "has an Interview Scheduled",
                Application.Status.INTERVIEW_COMPLETED: "Interview has been marked as Completed",
                Application.Status.SELECTED: "Congratulations! You have been Selected for the position",
                Application.Status.REJECTED: "has unfortunately not been moved forward at this time",
            }

            msg_suffix = status_labels.get(new_status, f"status changed to {new_status}")

            send_notification(
                recipient=application.candidate,
                title=f"Application Update: {application.job.title}",
                message=f"Your application for '{application.job.title}' at {application.job.company} {msg_suffix}.",
                notification_type=Notification.NotificationType.APPLICATION
            )

            return Response({
                'message': f"Application status updated from {old_status} to {new_status}.",
                'status': application.status,
                'application_id': application.id
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminApplicationListView(generics.ListAPIView):
    """
    Admin endpoint to view all platform applications.
    """
    permission_classes = [IsAdminUserRole]
    serializer_class = ApplicationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['candidate__name', 'candidate__email', 'job__title', 'job__company']
    ordering_fields = ['applied_at', 'match_score']
    ordering = ['-applied_at']

    def get_queryset(self):
        return Application.objects.all().select_related(
            'candidate', 'candidate__candidate_profile', 'job', 'job__recruiter'
        )


class AdminApplicationDetailView(generics.RetrieveAPIView):
    """
    Admin endpoint to view single application details.
    """
    permission_classes = [IsAdminUserRole]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.all().select_related(
            'candidate', 'candidate__candidate_profile', 'job', 'job__recruiter'
        )
