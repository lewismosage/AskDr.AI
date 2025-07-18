from django.urls import path
from .views import check_feature_access, record_feature_usage, check_chat_access, check_symptom_access, check_medication_qa_access, check_reminder_access

urlpatterns = [
    path('check/', check_feature_access, name='check-feature-access'),
    path('record-usage/', record_feature_usage, name='record-feature-usage'),
    path('check-chat-access/', check_chat_access, name='check-chat-access'),
    path('check-symptom-access/', check_symptom_access, name='check-symptom-access'),
    path('check-medication-qa-access/', check_medication_qa_access, name='check-medication-qa-access'),
    path('check-reminder-access/', check_reminder_access, name='check-reminder-access'),
]