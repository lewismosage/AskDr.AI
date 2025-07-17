# features/urls.py
from django.urls import path
from .views import check_feature_access, record_feature_usage

urlpatterns = [
    path('check/', check_feature_access, name='check-feature-access'),
    path('record-usage/', record_feature_usage, name='record-feature-usage'),
]