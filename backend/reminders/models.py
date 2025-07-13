# reminders/models.py
from django.db import models
from django.contrib.auth.models import User

class Reminder(models.Model):
    REMINDER_TYPES = [
        ('medication', 'Medication'),
        ('appointment', 'Appointment'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES)
    title = models.CharField(max_length=100)
    notes = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    frequency = models.CharField(max_length=50, choices=[
        ('once', 'Once'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ])
    next_trigger = models.DateTimeField(blank=True, null=True)  # calculated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"
