from django.urls import path
from .views import check_symptoms, check_symptom_access, debug_check_key

urlpatterns = [
    path('check/', check_symptoms, name='check-symptoms'),
    path('check-access/', check_symptom_access, name='check-symptom-access'),
    path('debug-check-key/', debug_check_key, name='debug-check-key'),
]