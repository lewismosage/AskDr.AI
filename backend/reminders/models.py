# reminders/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Reminder(models.Model):
    REMINDER_TYPES = [
        ('medication', 'Medication'),
        ('appointment', 'Appointment'),
    ]
    
    FREQUENCY_CHOICES = [
        ('once', 'Once'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES)
    title = models.CharField(max_length=100)
    notes = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    frequency = models.CharField(max_length=50, choices=FREQUENCY_CHOICES)
    next_trigger = models.DateTimeField(blank=True, null=True)  # calculated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    email_sent = models.BooleanField(default=False)  # Track if email was sent for this trigger

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    def save(self, *args, **kwargs):
        # Calculate next_trigger when saving
        if not self.next_trigger:
            self.next_trigger = self.start_time
        super().save(*args, **kwargs)

    def calculate_next_trigger(self):
        """Calculate the next trigger time based on frequency"""
        if self.frequency == 'daily':
            return self.next_trigger + timedelta(days=1)
        elif self.frequency == 'weekly':
            return self.next_trigger + timedelta(weeks=1)
        elif self.frequency == 'monthly':
            return self.next_trigger + timedelta(days=30)
        else:
            return None  # one-time reminder

    def mark_email_sent(self):
        """Mark that email has been sent for this trigger"""
        self.email_sent = True
        self.save(update_fields=['email_sent'])

    def reset_email_sent(self):
        """Reset email sent flag for next trigger"""
        self.email_sent = False
        self.save(update_fields=['email_sent'])
