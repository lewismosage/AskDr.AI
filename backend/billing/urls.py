# billing/urls.py
from django.urls import path
from .views import create_checkout_session

urlpatterns = [
    path('checkout/', create_checkout_session),
]
