import google.generativeai as genai
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
FREE_UNAUTHENTICATED_LIMIT = 5  # For non-logged in users
FREE_AUTHENTICATED_LIMIT = 10   # For free plan users
UNLIMITED_ACCESS = 999999       # For paid users

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# System prompt template
SYSTEM_PROMPT = """You are a medical assistant specialized in symptom analysis. Follow these rules strictly:

1. Only respond in valid JSON format.
2. Analyze the symptoms and return exactly 3 possible conditions in this format:
{
  "conditions": [
    {
      "name": "<Condition Name>",
      "probability": "<Low/Medium/High or percentage>",
      "severity": "<Mild/Moderate/Severe>",
      "advice": "<Clear and safe advice>"
    },
    ...
  ],
  "note": "<General advice if symptoms persist>"
}

3. Never provide definitive diagnoses - only suggest possible conditions.
4. Always recommend consulting a healthcare professional.
5. For non-medical queries, respond with:
{
  "conditions": [],
  "note": "Please describe medical symptoms for analysis"
}

Return ONLY the JSON object, no additional text or markdown."""

def check_access_limits(request):
    """Handle access limits for both authenticated and unauthenticated users"""
    if not request.user.is_authenticated:
        session = request.session
        checks_used = session.get('unauthenticated_symptom_checks_used', 0)
        
        if checks_used >= FREE_UNAUTHENTICATED_LIMIT:
            return Response({
                'error': 'unauthenticated_limit_reached',
                'message': f'You\'ve used all {FREE_UNAUTHENTICATED_LIMIT} free symptom checks. Sign in to continue.',
                'limit': FREE_UNAUTHENTICATED_LIMIT,
                'used': checks_used,
                'requires_auth': True
            }, status=403)
        
        session['unauthenticated_symptom_checks_used'] = checks_used + 1
        session.modified = True
    else:
        try:
            profile = request.user.profile
            if not profile.can_use_feature('symptom_check'):
                return Response({
                    'error': 'authenticated_limit_reached',
                    'message': f'You\'ve used {profile.monthly_symptom_checks_used} of your {FREE_AUTHENTICATED_LIMIT} monthly checks.',
                    'limit': FREE_AUTHENTICATED_LIMIT,
                    'used': profile.monthly_symptom_checks_used,
                    'requires_upgrade': profile.plan == 'free'
                }, status=403)
        except ObjectDoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)
    
    return None

def call_gemini(prompt):
    """Make the API call to Google Gemini for symptom analysis"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        full_prompt = f"{SYSTEM_PROMPT}\n\nSymptoms to analyze: {prompt}"
        
        response = model.generate_content(
            full_prompt,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 500,
                "response_mime_type": "application/json"
            }
        )
        
        # Clean the response
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3].strip()
        
        return json.loads(response_text)
        
    except Exception as e:
        logger.error(f"Gemini API request failed: {str(e)}")
        raise

@api_view(['POST'])
@permission_classes([AllowAny])
def check_symptoms(request):
    """
    Handle symptom analysis with:
    - Access control
    - Input validation
    - API call to Gemini
    - Response processing
    """
    # Check access limits first
    access_check = check_access_limits(request)
    if access_check:
        return access_check

    # Validate input
    symptoms = request.data.get("symptoms", "").strip()
    if not symptoms:
        return Response({"error": "No symptoms provided"}, status=400)

    try:
        # Verify API key is available
        if not settings.GEMINI_API_KEY:
            logger.error("Gemini API key not configured")
            return Response({"error": "Service configuration error"}, status=500)

        # Make the API call
        structured_response = call_gemini(symptoms)
        
        if not isinstance(structured_response, dict) or 'conditions' not in structured_response:
            raise ValueError("Invalid response format from AI model")
        
        # Record usage for authenticated users
        if request.user.is_authenticated:
            profile = request.user.profile
            profile.record_feature_usage('symptom_check')
            profile.save()

        return Response(structured_response)
            
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Response parsing error: {str(e)}")
        return Response({
            "error": "Failed to parse response",
            "details": str(e)
        }, status=500)
    except Exception as e:
        logger.error(f"Unexpected error in symptom check: {str(e)}")
        return Response({
            "error": "Service temporarily unavailable",
            "details": str(e)
        }, status=503)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_symptom_access(request):
    """Check user's symptom check access status"""
    try:
        profile = request.user.profile
        return Response({
            "has_access": profile.can_use_feature('symptom_check'),
            "checks_used": profile.monthly_symptom_checks_used,
            "checks_allowed": FREE_AUTHENTICATED_LIMIT if profile.plan == 'free' else UNLIMITED_ACCESS,
            "is_unlimited": profile.plan != 'free',
            "plan": profile.plan
        })
    except ObjectDoesNotExist:
        logger.error(f"Profile not found for user {request.user.id}")
        return Response({"error": "User profile not found"}, status=404)
    except Exception as e:
        logger.error(f"Error checking access: {str(e)}")
        return Response({"error": "Internal server error"}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_check_key(request):
    """Simplified debug endpoint"""
    return Response({
        "key_exists": bool(settings.GEMINI_API_KEY),
        "key_prefix": settings.GEMINI_API_KEY[:5] + "..." if settings.GEMINI_API_KEY else None
    })