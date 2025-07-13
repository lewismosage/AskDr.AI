# reminders/models.py
from django.db import models
from django.contrib.auth.models import User

class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    remind_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
