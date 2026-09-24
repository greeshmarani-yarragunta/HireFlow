from rest_framework import serializers
from django.utils import timezone
from interviews.models import Interview
from applications.models import Application

class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    candidate_phone = serializers.CharField(source='candidate.phone', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company', read_only=True)
    recruiter_name = serializers.CharField(source='recruiter.name', read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'candidate', 'candidate_name', 'candidate_email',
            'candidate_phone', 'recruiter', 'recruiter_name', 'job', 'job_title',
            'company_name', 'date', 'time', 'interview_type', 'meeting_link',
            'interviewer', 'notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'candidate', 'recruiter', 'job', 'created_at', 'updated_at']


class InterviewCreateSerializer(serializers.ModelSerializer):
    application_id = serializers.PrimaryKeyRelatedField(
        queryset=Application.objects.all(),
        source='application',
        write_only=True
    )

    class Meta:
        model = Interview
        fields = [
            'id', 'application_id', 'date', 'time', 'interview_type',
            'meeting_link', 'interviewer', 'notes'
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        application = attrs['application']
        request = self.context['request']

        # Ensure application belongs to one of recruiter's jobs
        if application.job.recruiter != request.user:
            raise serializers.ValidationError({'application_id': 'You can only schedule interviews for your own job applicants.'})

        # Ensure application is in an interviewable status (e.g. SHORTLISTED or already INTERVIEW_SCHEDULED)
        if application.status not in [Application.Status.SHORTLISTED, Application.Status.INTERVIEW_SCHEDULED, Application.Status.UNDER_REVIEW]:
            raise serializers.ValidationError(
                {'application_id': f"Cannot schedule interview for application with status '{application.status}'. Applicant must be Shortlisted or Under Review."}
            )

        # Validate date
        if attrs['date'] < timezone.now().date():
            raise serializers.ValidationError({'date': 'Interview date cannot be in the past.'})

        return attrs

    def create(self, validated_data):
        application = validated_data['application']
        recruiter = self.context['request'].user
        interview = Interview.objects.create(
            application=application,
            candidate=application.candidate,
            recruiter=recruiter,
            job=application.job,
            date=validated_data['date'],
            time=validated_data['time'],
            interview_type=validated_data.get('interview_type', Interview.InterviewType.TECHNICAL),
            meeting_link=validated_data.get('meeting_link', ''),
            interviewer=validated_data.get('interviewer', recruiter.name),
            notes=validated_data.get('notes', ''),
            status=Interview.Status.SCHEDULED
        )

        # Update application status to INTERVIEW_SCHEDULED
        application.status = Application.Status.INTERVIEW_SCHEDULED
        application.save()

        return interview
