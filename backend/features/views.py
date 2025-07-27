from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.models import UserProfile
from rest_framework.permissions import IsAuthenticated
import logging

logger = logging.getLogger(__name__)

# Constants for feature limits
FREE_MEDICATION_QA_LIMIT = 10
FREE_SYMPTOM_CHECK_LIMIT = 5
FREE_CHAT_LIMIT = 10
UNLIMITED_ACCESS = 999999 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_feature_access(request):
    """Check access for any feature with a single endpoint"""
    feature_name = request.GET.get('feature')
    
    if not feature_name:
        return Response({'error': 'Feature parameter is required'}, status=400)
    
    try:
        profile = request.user.profile
        
        # Determine the limits based on feature name
        if feature_name == 'symptom_check':
            used = profile.monthly_symptom_checks_used
            allowed = FREE_SYMPTOM_CHECK_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS
        elif feature_name == 'medication_qa':
            used = profile.monthly_medication_questions_used
            allowed = FREE_MEDICATION_QA_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS
        elif feature_name == 'chat':
            used = profile.monthly_chat_messages_used
            allowed = FREE_CHAT_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS
        else:
            return Response({'error': 'Invalid feature name'}, status=400)
        
        return Response({
            'has_access': profile.can_use_feature(feature_name),
            'used': used,
            'allowed': allowed,
            'is_unlimited': profile.plan != 'free',
            'plan': profile.plan
        })
        
    except UserProfile.DoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        logger.error(f"Error checking feature access: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_feature_usage(request):
    """Record usage of a specific feature"""
    feature_name = request.data.get('feature')
    
    if not feature_name:
        return Response({'error': 'Feature name is required'}, status=400)
    
    try:
        profile = request.user.profile
        profile.record_feature_usage(feature_name)
        return Response({'success': True})
    except UserProfile.DoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        logger.error(f"Error recording feature usage: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_chat_access(request):
    """Check chat feature access"""
    try:
        profile = request.user.profile
        return Response({
            'has_access': profile.can_use_feature('chat'),
            'messages_used': profile.monthly_chat_messages_used,
            'messages_allowed': FREE_CHAT_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS,
            'is_unlimited': profile.plan != 'free',
            'plan': profile.plan
        })
    except UserProfile.DoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        logger.error(f"Error checking chat access: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_symptom_access(request):
    """Check symptom checker feature access"""
    try:
        profile = request.user.profile
        return Response({
            'has_access': profile.can_use_feature('symptom_check'),
            'checks_used': profile.monthly_symptom_checks_used,
            'checks_allowed': FREE_SYMPTOM_CHECK_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS,
            'is_unlimited': profile.plan != 'free',
            'plan': profile.plan
        })
    except UserProfile.DoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        logger.error(f"Error checking symptom access: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_medication_qa_access(request):
    """Check medication QA feature access"""
    try:
        profile = request.user.profile
        return Response({
            'has_access': profile.can_use_feature('medication_qa'),
            'questions_used': profile.monthly_medication_questions_used,
            'questions_allowed': FREE_MEDICATION_QA_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS,
            'is_unlimited': profile.plan != 'free',
            'plan': profile.plan
        })
    except UserProfile.DoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        logger.error(f"Error checking medication QA access: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_reminder_access(request):
    """Check reminder feature access"""
    try:
        profile = request.user.profile
        return Response({
            'has_access': profile.can_use_reminders(),
            'plan': profile.plan
        })
    except UserProfile.DoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        logger.error(f"Error checking reminder access: {str(e)}")
        return Response({'error': str(e)}, status=500)