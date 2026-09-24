from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from jobs.models import Job, SavedJob
from jobs.filters import JobFilter
from jobs.serializers import JobSerializer, JobCreateUpdateSerializer, SavedJobSerializer
from accounts.permissions import IsCandidate, IsRecruiter, IsAdminUserRole
from notifications.models import Notification

class PublicJobListView(generics.ListAPIView):
    """
    Public endpoint for candidates and guests to search and filter ACTIVE jobs.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title', 'company', 'required_skills', 'description', 'location']
    ordering_fields = ['created_at', 'salary_min', 'experience_min']
    ordering = ['-created_at']

    def get_queryset(self):
        return Job.objects.filter(status=Job.Status.ACTIVE).select_related('recruiter')


class PublicJobDetailView(APIView):
    """
    Public endpoint to view single job details.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        job = get_object_or_404(Job.objects.select_related('recruiter'), pk=pk)
        # Only active jobs are public, unless the requester is the recruiter owner or an admin
        if job.status != Job.Status.ACTIVE:
            if not request.user.is_authenticated:
                return Response({'error': 'Job not found or not active.'}, status=status.HTTP_404_NOT_FOUND)
            if request.user != job.recruiter and not (request.user.role == 'ADMIN' or request.user.is_staff):
                return Response({'error': 'Job not found or not active.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobSerializer(job, context={'request': request})
        return Response(serializer.data)


class RecruiterJobListView(generics.ListCreateAPIView):
    """
    Recruiter endpoint to list all jobs created by the authenticated recruiter,
    or create a new job.
    """
    permission_classes = [IsRecruiter]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'job_type']
    search_fields = ['title', 'department', 'location']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateUpdateSerializer
        return JobSerializer

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user)

    def perform_create(self, serializer):
        job = serializer.save()
        # If job is submitted as PENDING_APPROVAL, notify admin
        if job.status == Job.Status.PENDING_APPROVAL:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            admins = User.objects.filter(role=User.Role.ADMIN)
            for admin in admins:
                Notification.objects.create(
                    recipient=admin,
                    title="New Job Awaiting Approval",
                    message=f"Recruiter {self.request.user.name} submitted job '{job.title}' for company '{job.company}'.",
                    notification_type=Notification.NotificationType.JOB
                )


class RecruiterJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Recruiter endpoint to view, edit, or delete their own job.
    """
    permission_classes = [IsRecruiter]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateUpdateSerializer
        return JobSerializer

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user)


class AdminJobListView(generics.ListAPIView):
    """
    Admin endpoint to view all jobs across all recruiters and statuses.
    """
    permission_classes = [IsAdminUserRole]
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title', 'company', 'recruiter__name', 'recruiter__email']
    ordering = ['-created_at']

    def get_queryset(self):
        return Job.objects.all().select_related('recruiter')


class AdminJobReviewView(APIView):
    """
    Admin action to approve, reject, or disable a job.
    """
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        action = request.data.get('action') # APPROVE, REJECT, DISABLE
        feedback = request.data.get('admin_feedback', '')

        if action == 'APPROVE':
            if job.status not in [Job.Status.PENDING_APPROVAL, Job.Status.REJECTED, Job.Status.DISABLED]:
                return Response(
                    {'error': f"Cannot approve job with status '{job.status}'. Only PENDING_APPROVAL, REJECTED, or DISABLED jobs can be approved."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            job.status = Job.Status.ACTIVE
            job.admin_feedback = feedback
            job.save()
            # Notify recruiter
            Notification.objects.create(
                recipient=job.recruiter,
                title="Job Approved",
                message=f"Congratulations! Your job posting '{job.title}' has been approved and is now ACTIVE.",
                notification_type=Notification.NotificationType.JOB
            )
            return Response({'message': 'Job approved successfully.', 'status': job.status})

        elif action == 'REJECT':
            job.status = Job.Status.REJECTED
            job.admin_feedback = feedback or 'Job posting did not meet platform guidelines.'
            job.save()
            # Notify recruiter
            Notification.objects.create(
                recipient=job.recruiter,
                title="Job Rejected",
                message=f"Your job posting '{job.title}' was rejected. Feedback: {job.admin_feedback}",
                notification_type=Notification.NotificationType.JOB
            )
            return Response({'message': 'Job rejected.', 'status': job.status, 'feedback': job.admin_feedback})

        elif action == 'DISABLE':
            job.status = Job.Status.DISABLED
            job.admin_feedback = feedback or 'Job posting has been disabled by administrator.'
            job.save()
            # Notify recruiter
            Notification.objects.create(
                recipient=job.recruiter,
                title="Job Disabled",
                message=f"Your job posting '{job.title}' was disabled by an administrator.",
                notification_type=Notification.NotificationType.JOB
            )
            return Response({'message': 'Job disabled.', 'status': job.status})

        return Response({'error': "Invalid action. Allowed: 'APPROVE', 'REJECT', 'DISABLE'."}, status=status.HTTP_400_BAD_REQUEST)


class CandidateSavedJobListCreateView(generics.ListCreateAPIView):
    """
    Candidate endpoint to list or save a job.
    """
    permission_classes = [IsCandidate]
    serializer_class = SavedJobSerializer

    def get_queryset(self):
        return SavedJob.objects.filter(candidate=self.request.user).select_related('job', 'job__recruiter')

    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        job = get_object_or_404(Job, pk=job_id)
        saved, created = SavedJob.objects.get_or_create(candidate=request.user, job=job)
        if not created:
            return Response({'message': 'Job is already saved.', 'id': saved.id}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(saved)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CandidateSavedJobDeleteView(APIView):
    """
    Candidate endpoint to remove a saved job.
    """
    permission_classes = [IsCandidate]

    def delete(self, request, job_id):
        saved = SavedJob.objects.filter(candidate=request.user, job_id=job_id).first()
        if saved:
            saved.delete()
            return Response({'message': 'Job removed from saved list.'}, status=status.HTTP_200_OK)
        return Response({'error': 'Saved job not found.'}, status=status.HTTP_404_NOT_FOUND)
