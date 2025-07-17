# users/permissions.py
from rest_framework import permissions
from users.models import UserProfile

class HasSubscriptionPermission(permissions.BasePermission):
    """
    Check if user has active subscription for specific feature
    """
    def __init__(self, feature_name):
        self.feature_name = feature_name

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.profile
            return profile.can_use_feature(self.feature_name)
        except UserProfile.DoesNotExist:
            return False

class IsSubscribed(permissions.BasePermission):
    """
    Check if user has any paid subscription
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            return request.user.profile.plan in ['plus', 'pro']
        except UserProfile.DoesNotExist:
            return False