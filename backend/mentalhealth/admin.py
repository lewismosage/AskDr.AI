from django.contrib import admin
from .models import JournalEntry, MoodLog, Therapist, ChatSession, ChatMessage

admin.site.register(ChatSession)
admin.site.register(ChatMessage)
admin.site.register(JournalEntry)
admin.site.register(MoodLog)
admin.site.register(Therapist)
