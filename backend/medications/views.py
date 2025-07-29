import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import json
from users.models import UserProfile
import logging
from django.core.exceptions import ObjectDoesNotExist

logger = logging.getLogger(__name__)

# Constants
FREE_UNAUTHENTICATED_LIMIT = 5
FREE_AUTHENTICATED_LIMIT = 10
UNLIMITED_ACCESS = 999999

# System prompt template
SYSTEM_PROMPT = """
You are a medical assistant specialized in medication-related questions. Follow these rules strictly:

1. Only respond in valid JSON format.
2. If the question is about medications (drugs, prescriptions, side effects, interactions):
{{
    "summary": "Brief explanation",
    "precautions": ["list", "of", "precautions"],
    "advice": "When to consult a doctor"
}}

3. If NOT about medications (diet, exercise, general health):
{{
    "summary": "Sorry, I specialize in medication questions only",
    "precautions": [],
    "advice": "Please ask about drugs, prescriptions, side effects or interactions"
}}

4. Never provide medical advice beyond general information.
5. Always recommend consulting a healthcare professional.
"""

def check_access_limits(request):
    """Handle access limits for both authenticated and unauthenticated users"""
    if not request.user.is_authenticated:
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
        
        session['unauthenticated_questions_used'] = questions_used + 1
        session.modified = True
    else:
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
        except ObjectDoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)
    
    return None

def call_openrouter(prompt):
    """Make the API call to OpenRouter"""
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": settings.FRONTEND_URL or "http://localhost:8000",
        "X-Title": settings.COMPANY_NAME or "AskDr.AI",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "anthropic/claude-3-haiku",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.3,
        "max_tokens": 500
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15  # Increased timeout for medical queries
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenRouter API request failed: {str(e)}")
        raise

@api_view(['POST'])
@permission_classes([AllowAny])
def medication_qa(request):
    """
    Handle medication questions with:
    - Access control
    - Input validation
    - API call to OpenRouter
    - Response processing
    """
    # Check access limits first
    access_check = check_access_limits(request)
    if access_check:
        return access_check

    # Validate input
    question = request.data.get("question", "").strip()
    if not question:
        return Response({"error": "No question provided"}, status=400)

    try:
        # Verify API key is available
        if not settings.OPENROUTER_API_KEY:
            logger.error("OpenRouter API key not configured")
            return Response({"error": "Service configuration error"}, status=500)

        # Make the API call
        response_data = call_openrouter(question)
        raw_content = response_data["choices"][0]["message"]["content"]
        
        # Parse and validate response
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
                "error": "Failed to parse response",
                "details": str(e),
                "raw_response": raw_content
            }, status=500)

    except Exception as e:
        logger.error(f"Unexpected error in medication_qa: {str(e)}")
        return Response({
            "error": "Service temporarily unavailable",
            "details": str(e)
        }, status=503)

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
    except ObjectDoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({"error": "User profile not found"}, status=404)
    except Exception as e:
        logger.error(f"Error checking access: {str(e)}")
        return Response({"error": "Internal server error"}, status=500)