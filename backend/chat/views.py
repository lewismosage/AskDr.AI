import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import json
import uuid
from users.models import UserProfile
import logging
from django.core.exceptions import ObjectDoesNotExist
from .models import ChatSession, ChatLog

logger = logging.getLogger(__name__)

# Constants
FREE_UNAUTHENTICATED_LIMIT = 5  # For non-logged in users
FREE_AUTHENTICATED_LIMIT = 10   # For free plan users
UNLIMITED_ACCESS = 999999       # For paid users

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# System prompt template
SYSTEM_PROMPT = """You are a helpful medical assistant. Follow these rules strictly:

1. Respond conversationally (use "you" and "your")
2. Provide responses in this JSON format:
{
  "summary": "Brief 1-2 sentence response",
  "recommendations": [
    "First recommendation",
    "Second recommendation",
    "Third recommendation"
  ]
}

3. For non-medical questions, respond politely:
{
  "summary": "I specialize in health-related questions",
  "recommendations": [
    "Please ask about health, medications, or symptoms"
  ]
}

4. Never provide definitive diagnoses - only suggest possibilities
5. Always recommend consulting a healthcare professional
6. Return ONLY valid JSON, no additional text"""

def check_access_limits(request):
    """Handle access limits for both authenticated and unauthenticated users"""
    if not request.user.is_authenticated:
        session = request.session
        messages_used = session.get('unauthenticated_chat_messages_used', 0)
        
        if messages_used >= FREE_UNAUTHENTICATED_LIMIT:
            return Response({
                'error': 'unauthenticated_limit_reached',
                'message': f'You\'ve used all {FREE_UNAUTHENTICATED_LIMIT} free messages. Sign in to continue.',
                'limit': FREE_UNAUTHENTICATED_LIMIT,
                'used': messages_used,
                'requires_auth': True
            }, status=403)
        
        session['unauthenticated_chat_messages_used'] = messages_used + 1
        session.modified = True
    else:
        try:
            profile = request.user.profile
            # Paid users always have access
            if profile.plan in ['plus', 'pro']:
                return None
                
            # Free users have limited access
            if profile.monthly_chat_messages_used >= FREE_AUTHENTICATED_LIMIT:
                return Response({
                    'error': 'authenticated_limit_reached',
                    'message': f'You\'ve used all {FREE_AUTHENTICATED_LIMIT} monthly messages. Upgrade to continue.',
                    'limit': FREE_AUTHENTICATED_LIMIT,
                    'used': profile.monthly_chat_messages_used,
                    'requires_upgrade': True
                }, status=403)
        except ObjectDoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)
    
    return None

def call_gemini(prompt, chat_history=None):
    """Make the API call to Google Gemini for chat"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare messages with history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if chat_history:
            messages.extend(chat_history)
        messages.append({"role": "user", "content": prompt})
        
        response = model.generate_content(
            messages,
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
def ask_ai(request):
    """
    Handle chat messages with:
    - Access control
    - Session management
    - API call to Gemini
    - Response processing
    """
    # Check access limits first
    access_check = check_access_limits(request)
    if access_check:
        return access_check

    # Validate input
    question = request.data.get("question", "").strip()
    session_id = request.data.get("session_id")
    
    if not question:
        return Response({"error": "No question provided"}, status=400)

    try:
        # Verify API key is available
        if not settings.GEMINI_API_KEY:
            logger.error("Gemini API key not configured")
            return Response({"error": "Service configuration error"}, status=500)

        # Get or create chat session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id)
            except ChatSession.DoesNotExist:
                session = ChatSession.objects.create(
                    id=session_id,
                    user=request.user if request.user.is_authenticated else None
                )
        else:
            session = ChatSession.objects.create(
                user=request.user if request.user.is_authenticated else None
            )

        # Get chat history for context
        chat_history = []
        if request.user.is_authenticated:
            history = ChatLog.objects.filter(
                session=session
            ).order_by('-created_at')[:10]  # Last 10 messages
            for entry in reversed(history):  # Oldest first
                chat_history.append({"role": "user", "content": entry.question})
                chat_history.append({"role": "assistant", "content": entry.response})

        # Make the API call
        structured_response = call_gemini(question, chat_history)
        
        if not isinstance(structured_response, dict) or 'summary' not in structured_response:
            raise ValueError("Invalid response format from AI model")

        # Ensure recommendations is an array
        if 'recommendations' not in structured_response:
            structured_response['recommendations'] = []
        elif not isinstance(structured_response['recommendations'], list):
            structured_response['recommendations'] = [structured_response['recommendations']]

        # Save to chat log if authenticated
        if request.user.is_authenticated:
            ChatLog.objects.create(
                session=session,
                user=request.user,
                question=question,
                response=json.dumps(structured_response)
            )
            # Record usage for free users
            profile = request.user.profile
            profile.record_feature_usage('chat')
            profile.save()

        return Response({
            "session_id": str(session.id),
            **structured_response
        })
            
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Response parsing error: {str(e)}")
        return Response({
            "error": "Failed to parse response",
            "details": str(e)
        }, status=500)
    except Exception as e:
        logger.error(f"Unexpected error in chat: {str(e)}")
        return Response({
            "error": "Service temporarily unavailable",
            "details": str(e)
        }, status=503)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_chat_access(request):
    """Check user's chat access status"""
    try:
        profile = request.user.profile
        if profile.plan in ['plus', 'pro']:  # Paid plans
            return Response({
                "has_access": True,
                "messages_used": profile.monthly_chat_messages_used,
                "messages_allowed": UNLIMITED_ACCESS,
                "is_unlimited": True,
                "plan": profile.plan
            })
        else:  # Free plan
            return Response({
                "has_access": profile.monthly_chat_messages_used < FREE_AUTHENTICATED_LIMIT,
                "messages_used": profile.monthly_chat_messages_used,
                "messages_allowed": FREE_AUTHENTICATED_LIMIT,
                "is_unlimited": False,
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