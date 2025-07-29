from django.urls import path
from .views import ask_ai, check_chat_access, debug_check_key

urlpatterns = [
    path('ask/', ask_ai, name='ask-ai'),
    path('check-access/', check_chat_access, name='check-chat-access'),
    path('debug-check-key/', debug_check_key, name='debug-check-key'),
]