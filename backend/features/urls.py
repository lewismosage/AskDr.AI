from django.urls import path
from .views import check_feature_access, record_feature_usage, check_chat_access 

urlpatterns = [
    path('check/', check_feature_access, name='check-feature-access'),
    path('record-usage/', record_feature_usage, name='record-feature-usage'),
    path('check-chat-access/', check_chat_access, name='check-chat-access'),
]