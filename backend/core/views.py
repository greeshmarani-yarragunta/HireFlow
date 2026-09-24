from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from jobs.models import Job, SavedJob
from applications.models import Application
from interviews.models import Interview
from notifications.models import Notification
from accounts.permissions import IsCandidate, IsRecruiter, IsAdminUserRole
from jobs.serializers import JobSerializer
from applications.serializers import ApplicationSerializer
from interviews.serializers import InterviewSerializer
from notifications.serializers import NotificationSerializer

User = get_user_model()

class CandidateDashboardView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        user = request.user
        apps = Application.objects.filter(candidate=user)
        total_apps = apps.count()
        shortlisted_count = apps.filter(status=Application.Status.SHORTLISTED).count()
        selected_count = apps.filter(status=Application.Status.SELECTED).count()
        interviews_count = Interview.objects.filter(candidate=user, status=Interview.Status.SCHEDULED).count()
        saved_jobs_count = SavedJob.objects.filter(candidate=user).count()

        # Recent applications
        recent_apps = apps.select_related('job', 'job__recruiter')[:5]
        recent_apps_data = ApplicationSerializer(recent_apps, many=True).data

        # Upcoming interviews
        upcoming_interviews = Interview.objects.filter(
            candidate=user,
            status=Interview.Status.SCHEDULED,
            date__gte=timezone.now().date()
        ).select_related('job', 'recruiter')[:5]
        upcoming_interviews_data = InterviewSerializer(upcoming_interviews, many=True).data

        # Recent notifications
        recent_notifs = Notification.objects.filter(recipient=user)[:5]
        recent_notifs_data = NotificationSerializer(recent_notifs, many=True).data

        # Recommended jobs based on candidate profile skills
        recommended_jobs_qs = Job.objects.filter(status=Job.Status.ACTIVE)
        if hasattr(user, 'candidate_profile') and user.candidate_profile.skills:
            candidate_skills = [s.strip().lower() for s in user.candidate_profile.skills.split(',') if s.strip()]
            q_filter = Q()
            for skill in candidate_skills[:4]:
                q_filter |= Q(required_skills__icontains=skill)
            if q_filter:
                recommended_jobs_qs = recommended_jobs_qs.filter(q_filter)

        recommended_jobs = recommended_jobs_qs[:6]
        recommended_jobs_data = JobSerializer(recommended_jobs, many=True, context={'request': request}).data

        return Response({
            'stats': {
                'total_applications': total_apps,
                'shortlisted': shortlisted_count,
                'interviews': interviews_count,
                'saved_jobs': saved_jobs_count,
                'selected': selected_count,
            },
            'recent_applications': recent_apps_data,
            'upcoming_interviews': upcoming_interviews_data,
            'recent_notifications': recent_notifs_data,
            'recommended_jobs': recommended_jobs_data,
        })


class RecruiterDashboardView(APIView):
    permission_classes = [IsRecruiter]

    def get(self, request):
        user = request.user
        recruiter_jobs = Job.objects.filter(recruiter=user)
        active_jobs_count = recruiter_jobs.filter(status=Job.Status.ACTIVE).count()
        total_jobs_count = recruiter_jobs.count()

        apps = Application.objects.filter(job__recruiter=user)
        total_applicants = apps.count()
        shortlisted_count = apps.filter(status=Application.Status.SHORTLISTED).count()
        selected_count = apps.filter(status=Application.Status.SELECTED).count()

        interviews_qs = Interview.objects.filter(recruiter=user)
        interviews_count = interviews_qs.filter(status=Interview.Status.SCHEDULED).count()

        # Status breakdown for chart
        status_counts = apps.values('status').annotate(count=Count('id'))
        status_breakdown = {s[0]: 0 for s in Application.Status.choices}
        for item in status_counts:
            status_breakdown[item['status']] = item['count']

        # Department breakdown for chart
        dept_counts = recruiter_jobs.values('department').annotate(count=Count('id')).order_by('-count')[:5]
        department_breakdown = [
            {'department': d['department'] or 'General', 'count': d['count']}
            for d in dept_counts
        ]

        # Applications over last 7 days for trend chart
        seven_days_ago = timezone.now().date() - timedelta(days=6)
        daily_apps = []
        for i in range(7):
            day = seven_days_ago + timedelta(days=i)
            cnt = apps.filter(applied_at__date=day).count()
            daily_apps.append({
                'date': day.strftime('%b %d'),
                'count': cnt
            })

        # Recent applicants
        recent_applicants = apps.select_related('candidate', 'candidate__candidate_profile', 'job')[:5]
        recent_applicants_data = ApplicationSerializer(recent_applicants, many=True).data

        # Active jobs
        active_jobs = recruiter_jobs.filter(status=Job.Status.ACTIVE)[:5]
        active_jobs_data = JobSerializer(active_jobs, many=True).data

        # Upcoming interviews
        upcoming_interviews = interviews_qs.filter(
            status=Interview.Status.SCHEDULED,
            date__gte=timezone.now().date()
        ).select_related('candidate', 'job')[:5]
        upcoming_interviews_data = InterviewSerializer(upcoming_interviews, many=True).data

        return Response({
            'stats': {
                'active_jobs': active_jobs_count,
                'total_jobs': total_jobs_count,
                'total_applicants': total_applicants,
                'shortlisted': shortlisted_count,
                'interviews': interviews_count,
                'selected': selected_count,
            },
            'analytics': {
                'status_breakdown': status_breakdown,
                'department_breakdown': department_breakdown,
                'daily_applications': daily_apps,
            },
            'recent_applicants': recent_applicants_data,
            'active_jobs': active_jobs_data,
            'upcoming_interviews': upcoming_interviews_data,
        })


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_users = User.objects.count()
        candidates_count = User.objects.filter(role=User.Role.CANDIDATE).count()
        recruiters_count = User.objects.filter(role=User.Role.RECRUITER).count()

        all_jobs = Job.objects.all()
        total_jobs = all_jobs.count()
        active_jobs = all_jobs.filter(status=Job.Status.ACTIVE).count()
        pending_jobs = all_jobs.filter(status=Job.Status.PENDING_APPROVAL).count()
        rejected_jobs = all_jobs.filter(status=Job.Status.REJECTED).count()

        all_apps = Application.objects.all()
        total_applications = all_apps.count()
        selected_candidates = all_apps.filter(status=Application.Status.SELECTED).count()
        total_interviews = Interview.objects.count()

        # Status breakdown
        app_status_counts = all_apps.values('status').annotate(count=Count('id'))
        app_status_breakdown = {s[0]: 0 for s in Application.Status.choices}
        for item in app_status_counts:
            app_status_breakdown[item['status']] = item['count']

        # Job type distribution
        job_types = all_jobs.values('job_type').annotate(count=Count('id'))
        job_type_distribution = [{'type': item['job_type'], 'count': item['count']} for item in job_types]

        # Jobs awaiting approval
        pending_jobs_list = all_jobs.filter(status=Job.Status.PENDING_APPROVAL).select_related('recruiter')[:5]
        pending_jobs_data = JobSerializer(pending_jobs_list, many=True).data

        # Recent applications
        recent_apps = all_apps.select_related('candidate', 'job', 'job__recruiter')[:5]
        recent_apps_data = ApplicationSerializer(recent_apps, many=True).data

        return Response({
            'stats': {
                'total_users': total_users,
                'candidates': candidates_count,
                'recruiters': recruiters_count,
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'pending_jobs': pending_jobs,
                'rejected_jobs': rejected_jobs,
                'total_applications': total_applications,
                'total_interviews': total_interviews,
                'selected_candidates': selected_candidates,
            },
            'analytics': {
                'application_status_breakdown': app_status_breakdown,
                'job_type_distribution': job_type_distribution,
            },
            'pending_jobs': pending_jobs_data,
            'recent_applications': recent_apps_data,
        })
