from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview

User = get_user_model()

class InterviewWorkflowTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            email='recruiter_int_test@example.com',
            password='Password@123',
            name='Recruiter Marcus',
            role=User.Role.RECRUITER
        )
        self.candidate = User.objects.create_user(
            email='candidate_int_test@example.com',
            password='Password@123',
            name='Candidate Maya',
            role=User.Role.CANDIDATE
        )
        self.job = Job.objects.create(
            recruiter=self.recruiter,
            title='Frontend Architect',
            company='WebSys',
            description='Build UI',
            location='Remote',
            status=Job.Status.ACTIVE
        )
        self.resume = SimpleUploadedFile('sample.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        self.application = Application.objects.create(
            candidate=self.candidate,
            job=self.job,
            resume=self.resume,
            status=Application.Status.SHORTLISTED
        )

    def test_schedule_interview_and_complete(self):
        self.client.force_authenticate(user=self.recruiter)
        url = '/api/recruiter/interviews/'
        future_date = (timezone.now() + timedelta(days=2)).date()

        # 1. Schedule Interview
        data = {
            'application_id': self.application.id,
            'date': str(future_date),
            'time': '11:00:00',
            'interview_type': 'TECHNICAL',
            'meeting_link': 'https://meet.google.com/test-link',
            'interviewer': 'Lead Engineer'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        interview_id = res.data['id']

        # Application status should be auto-updated to INTERVIEW_SCHEDULED
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, Application.Status.INTERVIEW_SCHEDULED)

        # 2. Candidate can view interview
        self.client.force_authenticate(user=self.candidate)
        cand_res = self.client.get('/api/candidate/interviews/')
        self.assertEqual(cand_res.status_code, status.HTTP_200_OK)
        int_ids = [i['id'] for i in cand_res.data['results']]
        self.assertIn(interview_id, int_ids)

        # 3. Recruiter completes interview
        self.client.force_authenticate(user=self.recruiter)
        update_url = f'/api/recruiter/interviews/{interview_id}/'
        comp_res = self.client.patch(update_url, {'status': Interview.Status.COMPLETED}, format='json')
        self.assertEqual(comp_res.status_code, status.HTTP_200_OK)

        # Application should now be INTERVIEW_COMPLETED
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, Application.Status.INTERVIEW_COMPLETED)
