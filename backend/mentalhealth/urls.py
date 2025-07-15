from django.urls import path
from .views import anonymous_chat, journal_entries, log_mood, mood_history, nearby_therapists, daily_wellness_tip, daily_journal_prompts

urlpatterns = [
    path("chat/", anonymous_chat),
    path("journal/", journal_entries),
    path("mood/", log_mood),
    path("mood/log/", log_mood),
    path("mood/history/", mood_history),
    path("therapists/", nearby_therapists),
    path("wellness-tip/", daily_wellness_tip),
    path("journal-prompts/", daily_journal_prompts),
]
