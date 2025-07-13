from django.urls import path
from .views import create_reminder, list_reminders, update_reminder, delete_reminder

urlpatterns = [
    path('', list_reminders, name='list_reminders'),
    path('create/', create_reminder, name='create_reminder'),
    path('<int:reminder_id>/update/', update_reminder, name='update_reminder'),
    path('<int:reminder_id>/delete/', delete_reminder, name='delete_reminder'),
]
