# notifications/urls.py
from django.urls import path
from .views import notification_preferences

urlpatterns = [
    path('', notification_preferences, name='notification_preferences'),
]
