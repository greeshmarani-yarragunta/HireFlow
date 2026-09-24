from django.db import models
from django.conf import settings
from applications.models import Application
from jobs.models import Job

class Interview(models.Model):
    class InterviewType(models.TextChoices):
        TECHNICAL = 'TECHNICAL', 'Technical'
        HR = 'HR', 'HR'
        MANAGERIAL = 'MANAGERIAL', 'Managerial'
        FINAL = 'FINAL', 'Final'

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidate_interviews')
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recruiter_interviews')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='interviews')
    date = models.DateField()
    time = models.TimeField()
    interview_type = models.CharField(max_length=40, choices=InterviewType.choices, default=InterviewType.TECHNICAL)
    meeting_link = models.CharField(max_length=500, blank=True, default='')
    interviewer = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.SCHEDULED, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"{self.interview_type} Interview: {self.candidate.name} for {self.job.title} on {self.date}"
