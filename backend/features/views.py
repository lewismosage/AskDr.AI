# features/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.permissions import HasSubscriptionPermission
from users.models import UserProfile
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_feature_access(request):
    feature_name = request.GET.get('feature')
    
    try:
        profile = request.user.profile
        has_access = profile.can_use_feature(feature_name)
        return Response({'has_access': has_access})
    except UserProfile.DoesNotExist:
        return Response({'has_access': False})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_feature_usage(request):
    feature_name = request.data.get('feature')
    
    try:
        profile = request.user.profile
        profile.record_feature_usage(feature_name)
        return Response({'success': True})
    except UserProfile.DoesNotExist:
        return Response({'success': False}, status=400)