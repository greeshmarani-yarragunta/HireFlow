import os
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from accounts.validators import validate_resume_file, validate_image_file

def candidate_resume_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    user_id = instance.user_id if hasattr(instance, 'user_id') else 'anonymous'
    return f'resumes/user_{user_id}_{uuid.uuid4().hex[:8]}{ext}'

def profile_image_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f'profiles/user_{instance.id}_{uuid.uuid4().hex[:8]}{ext}'

def company_logo_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f'company_logos/user_{instance.user_id}_{uuid.uuid4().hex[:8]}{ext}'

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CANDIDATE = 'CANDIDATE', 'Candidate'
        RECRUITER = 'RECRUITER', 'Recruiter'
        ADMIN = 'ADMIN', 'Admin'

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE)
    profile_image = models.ImageField(upload_to=profile_image_upload_path, null=True, blank=True, validators=[validate_image_file])
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"

    @property
    def is_candidate(self):
        return self.role == self.Role.CANDIDATE

    @property
    def is_recruiter(self):
        return self.role == self.Role.RECRUITER

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN or self.is_superuser


class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    location = models.CharField(max_length=255, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    education = models.CharField(max_length=255, blank=True, default='')
    degree = models.CharField(max_length=255, blank=True, default='')
    institution = models.CharField(max_length=255, blank=True, default='')
    graduation_year = models.IntegerField(null=True, blank=True)
    experience = models.IntegerField(default=0, help_text="Years of total experience")
    skills = models.TextField(blank=True, default='', help_text="Comma-separated skills list")
    projects = models.TextField(blank=True, default='')
    resume = models.FileField(upload_to=candidate_resume_upload_path, null=True, blank=True, validators=[validate_resume_file])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CandidateProfile: {self.user.name}"

    def get_skills_list(self):
        if not self.skills:
            return []
        return [s.strip() for s in self.skills.split(',') if s.strip()]


class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=255, blank=True, default='')
    company_logo = models.ImageField(upload_to=company_logo_upload_path, null=True, blank=True, validators=[validate_image_file])
    company_description = models.TextField(blank=True, default='')
    website = models.URLField(max_length=255, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    industry = models.CharField(max_length=255, blank=True, default='')
    company_size = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"RecruiterProfile: {self.company_name or self.user.name}"
