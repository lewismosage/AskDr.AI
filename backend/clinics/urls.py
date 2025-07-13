# clinics/urls.py
from django.urls import path
from .views import get_nearby_clinics

urlpatterns = [
    path('nearby/', get_nearby_clinics, name='get_nearby_clinics'),
]
