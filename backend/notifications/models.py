# notifications/models.py
from django.db import models
from django.contrib.auth.models import User

class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')

    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    medication_reminders = models.BooleanField(default=True)
    appointment_reminders = models.BooleanField(default=True)
    health_tips = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s notification preferences"
