# medications/urls.py
from django.urls import path
from .views import medication_qa
from .views import medication_qa, debug_check_key

urlpatterns = [
    path('ask/', medication_qa),
    path('debug-check-key/', debug_check_key),
]
