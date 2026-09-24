import os
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from jobs.models import Job
from applications.models import Application
from accounts.models import CandidateProfile

User = get_user_model()

class ApplicationWorkflowTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            email='recruiter_app_test@example.com',
            password='Password@123',
            name='Recruiter Jane',
            role=User.Role.RECRUITER
        )
        self.candidate = User.objects.create_user(
            email='candidate_app_test@example.com',
            password='Password@123',
            name='Candidate Alex',
            role=User.Role.CANDIDATE
        )
        self.profile = CandidateProfile.objects.create(
            user=self.candidate,
            skills='Python, Django, SQL, Git'
        )
        self.job = Job.objects.create(
            recruiter=self.recruiter,
            title='Backend Developer',
            company='DevCorp',
            description='Build APIs',
            location='Austin, TX',
            required_skills='Python, Django, SQL',
            status=Job.Status.ACTIVE
        )

    def test_candidate_apply_and_duplicate_prevention(self):
        self.client.force_authenticate(user=self.candidate)

        resume_file = SimpleUploadedFile(
            'test_resume.pdf',
            b'%PDF-1.4 test resume content with Python and Django',
            content_type='application/pdf'
        )

        # 1. Successful application
        url = '/api/candidate/applications/'
        data = {
            'job_id': self.job.id,
            'resume': resume_file,
            'cover_letter': 'Excited to apply!'
        }
        res = self.client.post(url, data, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], Application.Status.APPLIED)

        # 2. Duplicate application rejected
        resume_file_dup = SimpleUploadedFile(
            'test_resume2.pdf',
            b'%PDF-1.4 test resume content',
            content_type='application/pdf'
        )
        data['resume'] = resume_file_dup
        dup_res = self.client.post(url, data, format='multipart')
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_transitions_valid_and_invalid(self):
        resume_file = SimpleUploadedFile('test.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        app = Application.objects.create(
            candidate=self.candidate,
            job=self.job,
            resume=resume_file,
            status=Application.Status.APPLIED
        )

        self.client.force_authenticate(user=self.recruiter)
        status_url = f'/api/recruiter/applicants/{app.id}/status/'

        # Valid transition: APPLIED -> UNDER_REVIEW
        res1 = self.client.patch(status_url, {'status': Application.Status.UNDER_REVIEW}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, Application.Status.UNDER_REVIEW)

        # Valid transition: UNDER_REVIEW -> SHORTLISTED
        res2 = self.client.patch(status_url, {'status': Application.Status.SHORTLISTED}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, Application.Status.SHORTLISTED)

        # Invalid transition: SHORTLISTED -> SELECTED directly (cannot skip interview)
        res_invalid = self.client.patch(status_url, {'status': Application.Status.SELECTED}, format='json')
        self.assertEqual(res_invalid.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid transition: APPLIED -> SELECTED directly
        app.status = Application.Status.APPLIED
        app.save()
        res_applied_sel = self.client.patch(status_url, {'status': Application.Status.SELECTED}, format='json')
        self.assertEqual(res_applied_sel.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid transition: APPLIED -> INTERVIEW_COMPLETED directly
        res_applied_comp = self.client.patch(status_url, {'status': Application.Status.INTERVIEW_COMPLETED}, format='json')
        self.assertEqual(res_applied_comp.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid transition: UNDER_REVIEW -> SELECTED directly
        app.status = Application.Status.UNDER_REVIEW
        app.save()
        res_under_sel = self.client.patch(status_url, {'status': Application.Status.SELECTED}, format='json')
        self.assertEqual(res_under_sel.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_resume_file_extension_rejected(self):
        self.client.force_authenticate(user=self.candidate)
        bad_file = SimpleUploadedFile('malicious.exe', b'binarycontent', content_type='application/octet-stream')
        data = {
            'job_id': self.job.id,
            'resume': bad_file,
            'cover_letter': 'Hello'
        }
        res = self.client.post('/api/candidate/applications/', data, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_candidate_cannot_view_other_candidate_application(self):
        other_candidate = User.objects.create_user(
            email='other_cand@example.com',
            password='Password@123',
            name='Other Cand',
            role=User.Role.CANDIDATE
        )
        resume_file = SimpleUploadedFile('test.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        app = Application.objects.create(
            candidate=other_candidate,
            job=self.job,
            resume=resume_file,
            status=Application.Status.APPLIED
        )

        self.client.force_authenticate(user=self.candidate)
        res = self.client.get(f'/api/candidate/applications/{app.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_recruiter_cannot_view_applicants_of_other_recruiter(self):
        other_recruiter = User.objects.create_user(
            email='other_rec@example.com',
            password='Password@123',
            name='Other Recruiter',
            role=User.Role.RECRUITER
        )
        other_job = Job.objects.create(
            recruiter=other_recruiter,
            title='Staff AI Researcher',
            company='AI Labs',
            description='Research',
            location='Remote',
            status=Job.Status.ACTIVE,
            required_skills='PyTorch'
        )
        resume_file = SimpleUploadedFile('test.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        app = Application.objects.create(
            candidate=self.candidate,
            job=other_job,
            resume=resume_file,
            status=Application.Status.APPLIED
        )

        self.client.force_authenticate(user=self.recruiter)
        res = self.client.get(f'/api/recruiter/applicants/{app.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

