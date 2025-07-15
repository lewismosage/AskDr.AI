from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    # If user auth is added later, add a user ForeignKey here

class ChatMessage(models.Model):
    ROLE_CHOICES = (
        ("user", "User"),
        ("assistant", "Assistant")
    )
    session = models.ForeignKey(ChatSession, related_name="messages", on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"


class MoodLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mood = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 - 5
    logged_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Mood: {self.mood}"


class Therapist(models.Model):
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    rating = models.FloatField()
    reviews = models.IntegerField()
    location = models.CharField(max_length=100)
    distance = models.CharField(max_length=50)
    price = models.CharField(max_length=50)
    availability = models.CharField(max_length=100)
    image = models.URLField()
    verified = models.BooleanField(default=False)
    languages = models.JSONField()
    approaches = models.JSONField()

    def __str__(self):
        return self.name
