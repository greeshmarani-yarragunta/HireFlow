from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from notifications.models import Notification

User = get_user_model()

class NotificationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(
            email='alice@example.com',
            password='Password@123',
            name='Alice',
            role=User.Role.CANDIDATE
        )
        self.user_b = User.objects.create_user(
            email='bob@example.com',
            password='Password@123',
            name='Bob',
            role=User.Role.CANDIDATE
        )
        self.notif_a = Notification.objects.create(
            recipient=self.user_a,
            title='Interview Scheduled',
            message='Your interview is scheduled for tomorrow.',
            notification_type=Notification.NotificationType.INTERVIEW
        )
        self.notif_b = Notification.objects.create(
            recipient=self.user_b,
            title='Application Received',
            message='Your application was received.',
            notification_type=Notification.NotificationType.APPLICATION
        )

    def test_user_only_sees_own_notifications(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.get('/api/notifications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        notif_ids = [n['id'] for n in res.data['results']]
        self.assertIn(self.notif_a.id, notif_ids)
        self.assertNotIn(self.notif_b.id, notif_ids)

    def test_unread_count(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['unread_count'], 1)

    def test_mark_as_read(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.patch(f'/api/notifications/{self.notif_a.id}/read/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.notif_a.refresh_from_db()
        self.assertTrue(self.notif_a.is_read)

        count_res = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(count_res.data['unread_count'], 0)

    def test_cannot_mark_other_users_notification(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.patch(f'/api/notifications/{self.notif_b.id}/read/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.notif_b.refresh_from_db()
        self.assertFalse(self.notif_b.is_read)
