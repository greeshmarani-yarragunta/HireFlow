from django.db import models
from django.conf import settings
from django.utils import timezone

class Job(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
        ACTIVE = 'ACTIVE', 'Active'
        CLOSED = 'CLOSED', 'Closed'
        REJECTED = 'REJECTED', 'Rejected'
        DISABLED = 'DISABLED', 'Disabled'

    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        REMOTE = 'REMOTE', 'Remote'
        CONTRACT = 'CONTRACT', 'Contract'
        INTERNSHIP = 'INTERNSHIP', 'Internship'

    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField()
    responsibilities = models.TextField(blank=True, default='')
    qualifications = models.TextField(blank=True, default='')
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50, choices=JobType.choices, default=JobType.FULL_TIME)
    experience_min = models.IntegerField(default=0)
    experience_max = models.IntegerField(default=10)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    required_skills = models.TextField(help_text="Comma-separated required skills e.g., Python, Django, SQL")
    openings = models.PositiveIntegerField(default=1)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING_APPROVAL, db_index=True)
    admin_feedback = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company} ({self.status})"

    def get_skills_list(self):
        if not self.required_skills:
            return []
        return [s.strip() for s in self.required_skills.split(',') if s.strip()]

    @property
    def is_expired(self):
        if self.deadline and self.deadline < timezone.now().date():
            return True
        return False


class SavedJob(models.Model):
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saves')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'job')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidate.name} saved {self.job.title}"
