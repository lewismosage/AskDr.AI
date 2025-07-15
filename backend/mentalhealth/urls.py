from django.urls import path
from .views import anonymous_chat, save_journal, log_mood, mood_history, nearby_therapists

urlpatterns = [
    path("chat/", anonymous_chat),
    path("journal/", save_journal),
    path("mood/", log_mood),
    path("mood/log/", log_mood),
    path("mood/history/", mood_history),
    path("therapists/", nearby_therapists),
]
