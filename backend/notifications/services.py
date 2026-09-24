from notifications.models import Notification

def send_notification(recipient, title, message, notification_type=Notification.NotificationType.SYSTEM):
    """
    Utility function to create and persist a notification safely.
    """
    if not recipient:
        return None
    try:
        return Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type
        )
    except Exception as e:
        print(f"Error sending notification to {recipient}: {e}")
        return None
