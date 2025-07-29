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
from .models import ChatSession, ChatMessage, JournalEntry, MoodLog
from .serializers import JournalEntrySerializer, MoodLogSerializer
from django.utils import timezone
from datetime import timedelta, datetime
import re

logger = logging.getLogger(__name__)

# Constants
FREE_UNAUTHENTICATED_LIMIT = 5  # For non-logged in users
FREE_AUTHENTICATED_LIMIT = 10   # For free plan users
UNLIMITED_ACCESS = 999999       # For paid users

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# System prompt template for mental health
MENTAL_HEALTH_PROMPT = """You are a compassionate and supportive mental health assistant. Follow these rules strictly:

1. Respond conversationally (use "you" and "your")
2. Provide responses in this JSON format:
{
  "reply": "Your empathetic response to the user",
  "suggestions": [
    "First supportive suggestion",
    "Second supportive suggestion",
    "Third supportive suggestion"
  ]
}

3. For non-mental health questions, respond politely:
{
  "reply": "I specialize in mental health and emotional support",
  "suggestions": [
    "Please share what's on your mind or how you're feeling"
  ]
}

4. Never provide medical diagnoses or prescriptions
5. Always recommend consulting a professional if the user is in crisis
6. Maintain a warm, non-judgmental tone
7. Return ONLY valid JSON, no additional text"""

# Simple in-memory cache for daily prompts (reset at 8am)
_PROMPT_CACHE = {
    'date': None,
    'prompts': []
}

def check_access_limits(request):
    """Handle access limits for both authenticated and unauthenticated users"""
    if not request.user.is_authenticated:
        session = request.session
        messages_used = session.get('mentalhealth_messages_used', 0)
        
        if messages_used >= FREE_UNAUTHENTICATED_LIMIT:
            return Response({
                'error': 'unauthenticated_limit_reached',
                'message': f'You\'ve used all {FREE_UNAUTHENTICATED_LIMIT} free messages. Sign in to continue.',
                'limit': FREE_UNAUTHENTICATED_LIMIT,
                'used': messages_used,
                'requires_auth': True
            }, status=403)
        
        session['mentalhealth_messages_used'] = messages_used + 1
        session.modified = True
    else:
        try:
            profile = request.user.profile
            # Paid users always have access
            if profile.plan in ['plus', 'pro']:
                return None
                
            # Free users have limited access
            if profile.monthly_mentalhealth_messages_used >= FREE_AUTHENTICATED_LIMIT:
                return Response({
                    'error': 'authenticated_limit_reached',
                    'message': f'You\'ve used all {FREE_AUTHENTICATED_LIMIT} monthly messages. Upgrade to continue.',
                    'limit': FREE_AUTHENTICATED_LIMIT,
                    'used': profile.monthly_mentalhealth_messages_used,
                    'requires_upgrade': True
                }, status=403)
        except ObjectDoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)
    
    return None

def call_gemini_mentalhealth(prompt, chat_history=None):
    """Make the API call to Google Gemini for mental health chat"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare messages with history
        messages = [{"role": "system", "content": MENTAL_HEALTH_PROMPT}]
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

def get_daily_journal_prompts() -> list:
    """
    Call Gemini to get 3 unique, thoughtful journal prompts for today. Cache until next 8am.
    """
    now = timezone.localtime()
    today_8am = now.replace(hour=8, minute=0, second=0, microsecond=0)
    if now < today_8am:
        prompt_date = (now - timedelta(days=1)).date()
    else:
        prompt_date = now.date()

    if _PROMPT_CACHE['date'] == prompt_date and _PROMPT_CACHE['prompts']:
        return _PROMPT_CACHE['prompts']

    try:
        # Use Gemini to generate prompts
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            "Generate 3 unique journal prompts for mental health and self-reflection. "
            "Prompts should encourage gratitude, emotional awareness, and personal growth. "
            "Return them as a JSON array of strings.",
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 300,
                "response_mime_type": "application/json"
            }
        )
        
        # Clean and parse the response
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3].strip()
        
        prompts = json.loads(response_text)
        if isinstance(prompts, list) and all(isinstance(p, str) for p in prompts):
            _PROMPT_CACHE['date'] = prompt_date
            _PROMPT_CACHE['prompts'] = prompts
            return prompts
    except Exception:
        logger.warning("Failed to generate journal prompts with Gemini, using fallback")
    
    # Fallback prompts
    return [
        "What are three things you're grateful for today?",
        "Describe a moment when you felt truly at peace.",
        "What would you tell your younger self about handling difficult emotions?"
    ]

def get_daily_wellness_tip() -> str:
    """Call Gemini to get a daily wellness tip"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            "Generate a short, actionable wellness tip for mental health. "
            "Keep it positive and practical (1-2 sentences max).",
            generation_config={
                "temperature": 0.5,
                "max_output_tokens": 100
            }
        )
        return response.text.strip()
    except Exception:
        return "Take a moment for yourself today. Breathe deeply and do something kind for yourself."

@api_view(['POST'])
@permission_classes([AllowAny])
def anonymous_chat(request):
    """
    Handle mental health chat messages with:
    - Access control
    - Session management
    - API call to Gemini
    - Response processing
    """
    # Check access limits first
    access_check = check_access_limits(request)
    if access_check:
        return access_check

    user_input = request.data.get("message", "").strip()
    session_id = request.data.get("session_id")
    
    if not user_input:
        return Response({"error": "No message provided"}, status=400)

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
            history = ChatMessage.objects.filter(
                session=session
            ).order_by('-timestamp')[:10]  # Last 10 messages
            for entry in reversed(history):  # Oldest first
                chat_history.append({"role": "user", "content": entry.content if entry.role == "user" else ""})
                chat_history.append({"role": "assistant", "content": entry.content if entry.role == "assistant" else ""})

        # Make the API call
        structured_response = call_gemini_mentalhealth(user_input, chat_history)
        
        if not isinstance(structured_response, dict) or 'reply' not in structured_response:
            raise ValueError("Invalid response format from AI model")

        # Ensure suggestions is an array
        if 'suggestions' not in structured_response:
            structured_response['suggestions'] = []
        elif not isinstance(structured_response['suggestions'], list):
            structured_response['suggestions'] = [structured_response['suggestions']]

        # Format the reply with suggestions
        reply = structured_response['reply']
        if structured_response['suggestions']:
            reply += "\n\nSuggestions:\n" + "\n".join(f"- {s}" for s in structured_response['suggestions'])

        # Save to chat log if authenticated
        if request.user.is_authenticated:
            ChatMessage.objects.create(
                session=session,
                role="user",
                content=user_input
            )
            ChatMessage.objects.create(
                session=session,
                role="assistant",
                content=reply
            )
            # Record usage for free users
            profile = request.user.profile
            profile.record_feature_usage('mentalhealth')
            profile.save()

        return Response({
            "session_id": str(session.id),
            "reply": reply
        })
            
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Response parsing error: {str(e)}")
        return Response({
            "error": "Failed to parse response",
            "details": str(e)
        }, status=500)
    except Exception as e:
        logger.error(f"Unexpected error in mental health chat: {str(e)}")
        return Response({
            "error": "Service temporarily unavailable",
            "details": str(e)
        }, status=503)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_mentalhealth_access(request):
    """Check user's mental health chat access status"""
    try:
        profile = request.user.profile
        if profile.plan in ['plus', 'pro']:  # Paid plans
            return Response({
                "has_access": True,
                "messages_used": profile.monthly_mentalhealth_messages_used,
                "messages_allowed": UNLIMITED_ACCESS,
                "is_unlimited": True,
                "plan": profile.plan
            })
        else:  # Free plan
            return Response({
                "has_access": profile.monthly_mentalhealth_messages_used < FREE_AUTHENTICATED_LIMIT,
                "messages_used": profile.monthly_mentalhealth_messages_used,
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

@api_view(["GET"])
@permission_classes([AllowAny])
def daily_journal_prompts(request):
    prompts = get_daily_journal_prompts()
    return Response({"prompts": prompts})

@api_view(["GET"])
@permission_classes([AllowAny])
def daily_wellness_tip(request):
    tip = get_daily_wellness_tip()
    return Response({"tip": tip})

@api_view(["POST"])
@permission_classes([AllowAny])
def log_mood(request):
    mood = request.data.get("mood")
    if not mood:
        return Response({"error": "Mood is required."}, status=400)

    user = request.user if request.user.is_authenticated else None
    today = timezone.now().date()

    # Only one log per day
    existing = MoodLog.objects.filter(user=user, logged_at=today).first()
    if existing:
        return Response({"message": "Mood already logged for today."})

    MoodLog.objects.create(user=user, mood=mood)
    return Response({"message": "Mood logged successfully."})

@api_view(["GET"])
@permission_classes([AllowAny])
def mood_history(request):
    user = request.user if request.user.is_authenticated else None
    today = timezone.now().date()
    past_week = today - timedelta(days=6)

    logs = (
        MoodLog.objects
        .filter(user=user, logged_at__range=(past_week, today))
        .order_by("logged_at")
    )

    data = [
        {"date": log.logged_at.strftime("%Y-%m-%d"), "mood": log.mood}
        for log in logs
    ]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def journal_entries(request):
    if request.method == 'POST':
        serializer = JournalEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET: return all journals for user, newest first
    entries = JournalEntry.objects.filter(user=request.user).order_by('-created_at')
    serializer = JournalEntrySerializer(entries, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([AllowAny])
def nearby_therapists(request):
    lat = request.data.get("latitude")
    lng = request.data.get("longitude")

    if not lat or not lng:
        return Response({"error": "Missing latitude or longitude."}, status=400)

    try:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": 5000,
            "type": "health",
            "keyword": "therapist OR psychologist OR counseling",
            "key": settings.GOOGLE_MAPS_API_KEY
        }

        response = requests.get(url, params=params)
        data = response.json()

        results = []
        for place in data.get("results", []):
            results.append({
                "name": place.get("name"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "vicinity": place.get("vicinity"),
                "open_now": place.get("opening_hours", {}).get("open_now"),
                "location": place.get("geometry", {}).get("location"),
                "place_id": place.get("place_id")
            })

        return Response({"therapists": results}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_check_key(request):
    """Simplified debug endpoint"""
    return Response({
        "key_exists": bool(settings.GEMINI_API_KEY),
        "key_prefix": settings.GEMINI_API_KEY[:5] + "..." if settings.GEMINI_API_KEY else None
    })