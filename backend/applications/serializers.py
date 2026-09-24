import os
from rest_framework import serializers
from applications.models import Application
from jobs.models import Job
from jobs.serializers import JobSerializer
from accounts.models import CandidateProfile
from resume_matching.parser import extract_text_from_file
from resume_matching.matcher import calculate_resume_match
from accounts.validators import validate_resume_file

class ApplicationCandidateSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='candidate.id')
    name = serializers.CharField(source='candidate.name')
    email = serializers.EmailField(source='candidate.email')
    phone = serializers.CharField(source='candidate.phone')
    profile_image = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    education = serializers.SerializerMethodField()
    degree = serializers.SerializerMethodField()
    institution = serializers.SerializerMethodField()
    graduation_year = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()

    def _get_profile(self, obj):
        if hasattr(obj.candidate, 'candidate_profile'):
            return obj.candidate.candidate_profile
        return None

    def get_profile_image(self, obj):
        if obj.candidate.profile_image:
            return obj.candidate.profile_image.url
        return None

    def get_location(self, obj):
        p = self._get_profile(obj)
        return p.location if p else ''

    def get_education(self, obj):
        p = self._get_profile(obj)
        return p.education if p else ''

    def get_degree(self, obj):
        p = self._get_profile(obj)
        return p.degree if p else ''

    def get_institution(self, obj):
        p = self._get_profile(obj)
        return p.institution if p else ''

    def get_graduation_year(self, obj):
        p = self._get_profile(obj)
        return p.graduation_year if p else None

    def get_experience(self, obj):
        p = self._get_profile(obj)
        return p.experience if p else 0

    def get_skills(self, obj):
        p = self._get_profile(obj)
        return p.skills if p else ''

    def get_bio(self, obj):
        p = self._get_profile(obj)
        return p.bio if p else ''


class ApplicationSerializer(serializers.ModelSerializer):
    candidate = ApplicationCandidateSerializer(source='*', read_only=True)
    job = JobSerializer(read_only=True)
    resume_name = serializers.SerializerMethodField()
    match_analysis = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'candidate', 'job', 'resume', 'resume_name', 'cover_letter',
            'additional_information', 'status', 'match_score', 'match_analysis',
            'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'match_score', 'applied_at', 'updated_at']

    def get_resume_name(self, obj):
        if obj.resume:
            return os.path.basename(obj.resume.name)
        return None

    def get_match_analysis(self, obj):
        # Calculate full breakdown for recruiter/candidate view
        resume_text = ""
        if obj.resume:
            try:
                resume_text = extract_text_from_file(obj.resume.path)
            except Exception:
                pass
        
        candidate_skills = ""
        if hasattr(obj.candidate, 'candidate_profile'):
            candidate_skills = obj.candidate.candidate_profile.skills

        return calculate_resume_match(
            required_skills_raw=obj.job.required_skills,
            resume_text=resume_text,
            candidate_skills_raw=candidate_skills
        )


class ApplicationCreateSerializer(serializers.ModelSerializer):
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(status=Job.Status.ACTIVE),
        source='job'
    )
    resume = serializers.FileField(required=False)

    class Meta:
        model = Application
        fields = ['id', 'job_id', 'resume', 'cover_letter', 'additional_information', 'status', 'match_score']
        read_only_fields = ['id', 'status', 'match_score']

    def validate(self, attrs):
        user = self.context['request'].user
        job = attrs['job']

        # Ensure job is active
        if job.status != Job.Status.ACTIVE:
            raise serializers.ValidationError({'job_id': 'This job is no longer active for applications.'})

        # Check for duplicate application
        if Application.objects.filter(candidate=user, job=job).exists():
            raise serializers.ValidationError({'non_field_errors': ['You have already applied for this job.']})

        # If resume is not supplied in the request, use candidate's profile resume
        resume = attrs.get('resume')
        if not resume:
            if hasattr(user, 'candidate_profile') and user.candidate_profile.resume:
                attrs['resume'] = user.candidate_profile.resume
            else:
                raise serializers.ValidationError({'resume': 'Please upload a resume or add one to your profile before applying.'})
        else:
            try:
                validate_resume_file(resume)
            except Exception as e:
                msg = getattr(e, 'message', str(e)).strip("[]'")
                raise serializers.ValidationError({'resume': msg})

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        job = validated_data['job']
        resume_file = validated_data['resume']

        # Initial match score computation
        resume_text = extract_text_from_file(resume_file)
        candidate_skills = ""
        if hasattr(user, 'candidate_profile'):
            candidate_skills = user.candidate_profile.skills

        match_data = calculate_resume_match(
            required_skills_raw=job.required_skills,
            resume_text=resume_text,
            candidate_skills_raw=candidate_skills
        )

        application = Application.objects.create(
            candidate=user,
            job=job,
            resume=resume_file,
            cover_letter=validated_data.get('cover_letter', ''),
            additional_information=validated_data.get('additional_information', ''),
            status=Application.Status.APPLIED,
            match_score=match_data['match_score']
        )

        return application


class ApplicationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Application.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_status(self, value):
        instance = self.context.get('instance')
        if instance and not instance.can_transition_to(value):
            allowed = Application.VALID_TRANSITIONS.get(instance.status, [])
            allowed_names = [s for s in allowed]
            raise serializers.ValidationError(
                f"Invalid status transition from '{instance.status}' to '{value}'. Allowed transitions: {allowed_names}"
            )
        return value
