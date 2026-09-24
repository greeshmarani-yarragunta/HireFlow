from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from jobs.models import Job, SavedJob

User = get_user_model()

class JobWorkflowTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            email='recruiter_test@example.com',
            password='Password@123',
            name='Test Recruiter',
            role=User.Role.RECRUITER
        )
        self.admin = User.objects.create_user(
            email='admin_test@example.com',
            password='Password@123',
            name='Test Admin',
            role=User.Role.ADMIN,
            is_staff=True
        )
        self.candidate = User.objects.create_user(
            email='candidate_test@example.com',
            password='Password@123',
            name='Test Candidate',
            role=User.Role.CANDIDATE
        )

    def test_recruiter_create_job_and_admin_approval(self):
        # 1. Recruiter creates job
        self.client.force_authenticate(user=self.recruiter)
        url = '/api/recruiter/jobs/'
        data = {
            'title': 'Full Stack Developer',
            'company': 'Tech Corp',
            'department': 'Engineering',
            'description': 'Building next-gen systems',
            'location': 'New York, NY',
            'job_type': 'FULL_TIME',
            'experience_min': 2,
            'experience_max': 5,
            'salary_min': 80000,
            'salary_max': 120000,
            'required_skills': 'Python, Django, React, SQL',
            'openings': 2,
            'status': 'PENDING_APPROVAL'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        job_id = res.data['id']
        job = Job.objects.get(id=job_id)
        self.assertEqual(job.status, Job.Status.PENDING_APPROVAL)

        # 2. Public list should NOT include pending job
        self.client.force_authenticate(user=None)
        pub_res = self.client.get('/api/jobs/')
        self.assertEqual(pub_res.status_code, status.HTTP_200_OK)
        job_ids = [j['id'] for j in pub_res.data['results']]
        self.assertNotIn(job_id, job_ids)

        # 3. Admin approves job
        self.client.force_authenticate(user=self.admin)
        review_url = f'/api/admin/jobs/{job_id}/review/'
        approve_res = self.client.patch(review_url, {'action': 'APPROVE'}, format='json')
        self.assertEqual(approve_res.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, Job.Status.ACTIVE)

        # 4. Now public list includes active job
        self.client.force_authenticate(user=None)
        pub_res = self.client.get('/api/jobs/')
        job_ids = [j['id'] for j in pub_res.data['results']]
        self.assertIn(job_id, job_ids)

    def test_job_search_and_filter(self):
        Job.objects.create(
            recruiter=self.recruiter,
            title='Django Backend Lead',
            company='Alpha Solutions',
            description='Django backend developer',
            location='Austin, TX',
            job_type=Job.JobType.FULL_TIME,
            experience_min=3,
            experience_max=7,
            salary_min=100000,
            salary_max=130000,
            required_skills='Python, Django, PostgreSQL',
            status=Job.Status.ACTIVE
        )

        # Search by title
        res = self.client.get('/api/jobs/?search=Django')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data['results']), 1)

        # Filter by location
        res = self.client.get('/api/jobs/?location=Austin')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data['results']), 1)

        # Filter by skill
        res = self.client.get('/api/jobs/?skill=PostgreSQL')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data['results']), 1)

    def test_candidate_save_job(self):
        job = Job.objects.create(
            recruiter=self.recruiter,
            title='React Frontend Dev',
            company='Beta Systems',
            description='Frontend developer',
            location='Remote',
            status=Job.Status.ACTIVE,
            required_skills='React, JavaScript'
        )

        self.client.force_authenticate(user=self.candidate)
        res = self.client.post('/api/candidate/saved-jobs/', {'job_id': job.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SavedJob.objects.filter(candidate=self.candidate, job=job).exists())

    def test_job_state_machine_invalid_transitions(self):
        job = Job.objects.create(
            recruiter=self.recruiter,
            title='Staff Security Engineer',
            company='CyberSafe',
            description='Security lead',
            location='Remote',
            status=Job.Status.ACTIVE,
            required_skills='Python, Security'
        )

        self.client.force_authenticate(user=self.recruiter)
        # Attempt invalid transition: ACTIVE -> DRAFT
        res_invalid = self.client.patch(f'/api/recruiter/jobs/{job.id}/', {'status': Job.Status.DRAFT}, format='json')
        self.assertEqual(res_invalid.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid transition: ACTIVE -> CLOSED
        res_close = self.client.patch(f'/api/recruiter/jobs/{job.id}/', {'status': Job.Status.CLOSED}, format='json')
        self.assertEqual(res_close.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, Job.Status.CLOSED)

        # Attempt invalid transition: CLOSED -> ACTIVE via admin review
        self.client.force_authenticate(user=self.admin)
        res_closed_approve = self.client.patch(f'/api/admin/jobs/{job.id}/review/', {'action': 'APPROVE'}, format='json')
        self.assertEqual(res_closed_approve.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recruiter_cannot_edit_other_recruiter_job(self):
        other_recruiter = User.objects.create_user(
            email='other_recruiter@example.com',
            password='Password@123',
            name='Other Recruiter',
            role=User.Role.RECRUITER
        )
        job = Job.objects.create(
            recruiter=other_recruiter,
            title='DevOps Specialist',
            company='CloudNet',
            description='Terraform and AWS',
            location='Remote',
            status=Job.Status.ACTIVE,
            required_skills='Terraform, AWS'
        )

        self.client.force_authenticate(user=self.recruiter)
        # Recruiter tries to edit other recruiter's job -> 404
        res = self.client.patch(f'/api/recruiter/jobs/{job.id}/', {'title': 'Hacked Title'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_candidate_cannot_modify_jobs(self):
        job = Job.objects.create(
            recruiter=self.recruiter,
            title='QA Engineer',
            company='QualityFirst',
            description='Test automation',
            location='Remote',
            status=Job.Status.ACTIVE,
            required_skills='Python, PyTest'
        )

        self.client.force_authenticate(user=self.candidate)
        res = self.client.patch(f'/api/recruiter/jobs/{job.id}/', {'status': Job.Status.CLOSED}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

