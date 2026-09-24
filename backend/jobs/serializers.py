from rest_framework import serializers
from django.utils import timezone
from jobs.models import Job, SavedJob

class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.ReadOnlyField(source='recruiter.name')
    company_logo = serializers.SerializerMethodField()
    skills_list = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    applicants_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'recruiter', 'recruiter_name', 'company_logo', 'title', 'company',
            'department', 'description', 'responsibilities', 'qualifications',
            'location', 'job_type', 'experience_min', 'experience_max',
            'salary_min', 'salary_max', 'required_skills', 'skills_list',
            'openings', 'deadline', 'status', 'admin_feedback', 'is_saved',
            'applicants_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'recruiter', 'created_at', 'updated_at']

    def get_company_logo(self, obj):
        if hasattr(obj.recruiter, 'recruiter_profile') and obj.recruiter.recruiter_profile.company_logo:
            return obj.recruiter.recruiter_profile.company_logo.url
        return None

    def get_skills_list(self, obj):
        return obj.get_skills_list()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'CANDIDATE':
            return SavedJob.objects.filter(candidate=request.user, job=obj).exists()
        return False

    def get_applicants_count(self, obj):
        return obj.applications.count()


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'department', 'description',
            'responsibilities', 'qualifications', 'location', 'job_type',
            'experience_min', 'experience_max', 'salary_min', 'salary_max',
            'required_skills', 'openings', 'deadline', 'status'
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        exp_min = attrs.get('experience_min', getattr(self.instance, 'experience_min', 0))
        exp_max = attrs.get('experience_max', getattr(self.instance, 'experience_max', 10))
        if exp_min > exp_max:
            raise serializers.ValidationError({'experience_min': 'Minimum experience cannot exceed maximum experience.'})

        sal_min = attrs.get('salary_min', getattr(self.instance, 'salary_min', None))
        sal_max = attrs.get('salary_max', getattr(self.instance, 'salary_max', None))
        if sal_min is not None and sal_max is not None and sal_min > sal_max:
            raise serializers.ValidationError({'salary_min': 'Minimum salary cannot exceed maximum salary.'})

        deadline = attrs.get('deadline', getattr(self.instance, 'deadline', None))
        if deadline and deadline < timezone.now().date():
            raise serializers.ValidationError({'deadline': 'Job deadline cannot be in the past.'})

        # Recruiter status transition validation
        if not self.instance:
            status_val = attrs.get('status', Job.Status.PENDING_APPROVAL)
            if status_val not in [Job.Status.DRAFT, Job.Status.PENDING_APPROVAL]:
                raise serializers.ValidationError({'status': f"New jobs can only be created with status DRAFT or PENDING_APPROVAL (got '{status_val}')."})
        else:
            if 'status' in attrs:
                new_status = attrs['status']
                old_status = self.instance.status
                if new_status != old_status:
                    allowed_recruiter_transitions = {
                        Job.Status.DRAFT: [Job.Status.PENDING_APPROVAL],
                        Job.Status.PENDING_APPROVAL: [Job.Status.DRAFT],
                        Job.Status.ACTIVE: [Job.Status.CLOSED],
                        Job.Status.REJECTED: [Job.Status.DRAFT, Job.Status.PENDING_APPROVAL],
                        Job.Status.CLOSED: [],
                        Job.Status.DISABLED: [],
                    }
                    allowed = allowed_recruiter_transitions.get(old_status, [])
                    if new_status not in allowed:
                        raise serializers.ValidationError({
                            'status': f"Invalid status transition from '{old_status}' to '{new_status}'. Allowed transitions: {allowed}"
                        })

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['recruiter'] = user
        if not validated_data.get('company') and hasattr(user, 'recruiter_profile'):
            validated_data['company'] = user.recruiter_profile.company_name or user.name
        return super().create(validated_data)


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(status=Job.Status.ACTIVE),
        source='job',
        write_only=True
    )

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_id', 'created_at']
        read_only_fields = ['id', 'created_at']
