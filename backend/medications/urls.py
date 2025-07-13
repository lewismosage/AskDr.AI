# medications/urls.py
from django.urls import path
from .views import medication_qa

urlpatterns = [
    path('ask/', medication_qa),
]
