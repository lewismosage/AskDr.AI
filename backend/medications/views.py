import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import json
from rest_framework.exceptions import PermissionDenied
from users.models import UserProfile
import logging

logger = logging.getLogger(__name__)

# Constants
FREE_UNAUTHENTICATED_LIMIT = 5
FREE_AUTHENTICATED_LIMIT = 10
UNLIMITED_ACCESS = 999999 

@api_view(['POST'])
@permission_classes([AllowAny])
def medication_qa(request):
    """
    Handle medication questions with tiered access:
    - 5 questions for unauthenticated users
    - 10 questions for free authenticated users
    - Unlimited for paid users
    """
    # Check for unauthenticated access first
    if not request.user.is_authenticated:
        # Implement session-based tracking for unauthenticated users
        session = request.session
        questions_used = session.get('unauthenticated_questions_used', 0)
        
        if questions_used >= FREE_UNAUTHENTICATED_LIMIT:
            return Response({
                'error': 'unauthenticated_limit_reached',
                'message': f'You\'ve used all {FREE_UNAUTHENTICATED_LIMIT} free questions. Sign in to continue.',
                'limit': FREE_UNAUTHENTICATED_LIMIT,
                'used': questions_used,
                'requires_auth': True
            }, status=403)
        
        # Increment counter for unauthenticated users
        session['unauthenticated_questions_used'] = questions_used + 1
        session.modified = True
    else:
        # For authenticated users, check feature access
        try:
            profile = request.user.profile
            if not profile.can_use_feature('medication_qa'):
                return Response({
                    'error': 'authenticated_limit_reached',
                    'message': f'You\'ve used {profile.monthly_medication_questions_used} of your {FREE_AUTHENTICATED_LIMIT} monthly questions.',
                    'limit': FREE_AUTHENTICATED_LIMIT,
                    'used': profile.monthly_medication_questions_used,
                    'requires_upgrade': profile.plan == 'free'
                }, status=403)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)

    question = request.data.get("question", "").strip()
    if not question:
        return Response({"error": "No question provided"}, status=400)

    try:
        # Verify API key is available
        if not settings.OPENROUTER_API_KEY:
            logger.error("OpenRouter API key not configured")
            return Response({"error": "Service configuration error"}, status=500)

        # Prepare the AI prompt
        prompt = f"""
You are a helpful medical assistant. The user asked: "{question}"

Respond with valid JSON using this format:

{{
  "summary": "Brief explanation about the medication.",
  "precautions": [
    "Key precaution 1",
    "Key precaution 2",
    "..."
  ],
  "advice": "Final recommendation, such as consulting a doctor."
}}

Return only valid JSON, no markdown or additional text.
"""

        # Call the AI API with required headers
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://localhost:8000",  # Required by OpenRouter
            "X-Title": "AskDr.AI",  # Required by OpenRouter
            "Content-Type": "application/json"
        }

        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": [
                {"role": "system", "content": "You are a helpful medical assistant that always responds in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )

        if response.status_code != 200:
            logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
            return Response({"error": "AI service unavailable"}, status=503)

        # Parse and validate response
        data = response.json()
        raw_content = data["choices"][0]["message"]["content"]
        
        try:
            structured = json.loads(raw_content)
            if not isinstance(structured, dict) or 'summary' not in structured:
                raise ValueError("Invalid response format from AI model")
            
            # Record usage for authenticated users
            if request.user.is_authenticated:
                profile = request.user.profile
                profile.record_feature_usage('medication_qa')
                profile.save()

            return Response(structured)
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Response parsing error: {str(e)}")
            return Response({
                "error": "Failed to parse model response",
                "details": str(e),
                "raw_response": raw_content
            }, status=500)

    except requests.Timeout:
        logger.error("OpenRouter API request timed out")
        return Response({
            "error": "AI service timeout",
            "details": "The request took too long to complete"
        }, status=504)
    except Exception as e:
        logger.error(f"Unexpected error in medication_qa: {str(e)}")
        return Response({
            "error": "Internal server error",
            "details": str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_medication_qa_access(request):
    """Check user's medication QA access status"""
    try:
        profile = request.user.profile
        return Response({
            "has_access": profile.can_use_feature('medication_qa'),
            "questions_used": profile.monthly_medication_questions_used,
            "questions_allowed": FREE_AUTHENTICATED_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS,
            "is_unlimited": profile.plan != 'free',
            "plan": profile.plan
        })
    except UserProfile.DoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({"error": "User profile not found"}, status=404)
    except Exception as e:
        logger.error(f"Error checking medication QA access: {str(e)}")
        return Response({"error": str(e)}, status=400)