from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AccountsAuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_candidate_registration(self):
        url = '/api/auth/register/candidate/'
        data = {
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'phone': '1234567890',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='jane@example.com')
        self.assertEqual(user.role, User.Role.CANDIDATE)
        self.assertTrue(hasattr(user, 'candidate_profile'))

    def test_recruiter_registration(self):
        url = '/api/auth/register/recruiter/'
        data = {
            'name': 'Bob Recruiter',
            'email': 'bob@company.com',
            'phone': '0987654321',
            'company_name': 'Acme Corp',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='bob@company.com')
        self.assertEqual(user.role, User.Role.RECRUITER)
        self.assertTrue(hasattr(user, 'recruiter_profile'))
        self.assertEqual(user.recruiter_profile.company_name, 'Acme Corp')

    def test_login_jwt_token(self):
        user = User.objects.create_user(
            email='test@example.com',
            password='Password@123',
            name='Test User',
            role=User.Role.CANDIDATE
        )
        url = '/api/auth/login/'
        response = self.client.post(url, {'email': 'test@example.com', 'password': 'Password@123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')
        self.assertEqual(response.data['user']['role'], 'CANDIDATE')

    def test_password_mismatch_fails(self):
        url = '/api/auth/register/candidate/'
        data = {
            'name': 'Jane Doe',
            'email': 'jane_mismatch@example.com',
            'phone': '1234567890',
            'password': 'Password@123',
            'confirm_password': 'DifferentPassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
