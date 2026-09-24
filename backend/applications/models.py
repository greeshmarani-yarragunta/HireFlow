import os
import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from jobs.models import Job
from accounts.validators import validate_resume_file

def application_resume_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    candidate_id = instance.candidate_id if hasattr(instance, 'candidate_id') else 'anon'
    return f'resumes/app_{candidate_id}_{uuid.uuid4().hex[:8]}{ext}'

class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', 'Interview Scheduled'
        INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED', 'Interview Completed'
        SELECTED = 'SELECTED', 'Selected'
        REJECTED = 'REJECTED', 'Rejected'

    # Valid status transitions map
    VALID_TRANSITIONS = {
        Status.APPLIED: [Status.UNDER_REVIEW, Status.REJECTED],
        Status.UNDER_REVIEW: [Status.SHORTLISTED, Status.REJECTED],
        Status.SHORTLISTED: [Status.INTERVIEW_SCHEDULED, Status.REJECTED],
        Status.INTERVIEW_SCHEDULED: [Status.INTERVIEW_COMPLETED, Status.REJECTED],
        Status.INTERVIEW_COMPLETED: [Status.SELECTED, Status.REJECTED],
        Status.SELECTED: [],
        Status.REJECTED: [],
    }

    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    resume = models.FileField(upload_to=application_resume_upload_path, validators=[validate_resume_file])
    cover_letter = models.TextField(blank=True, default='')
    additional_information = models.TextField(blank=True, default='')
    status = models.CharField(max_length=40, choices=Status.choices, default=Status.APPLIED, db_index=True)
    match_score = models.IntegerField(default=0, help_text="Calculated match score percentage (0-100)")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('candidate', 'job')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.candidate.name} -> {self.job.title} ({self.status})"

    def can_transition_to(self, target_status):
        if self.status == target_status:
            return True
        allowed = self.VALID_TRANSITIONS.get(self.status, [])
        return target_status in allowed
