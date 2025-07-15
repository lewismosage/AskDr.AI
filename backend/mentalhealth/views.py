from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import JournalEntry, MoodLog
from .serializers import JournalEntrySerializer, MoodLogSerializer
import requests
from django.conf import settings
from .models import ChatSession, ChatMessage
import re
from django.utils import timezone
from datetime import timedelta, datetime

# Simple in-memory cache for daily prompts (reset at 8am)
_PROMPT_CACHE = {
    'date': None,
    'prompts': []
}

def get_daily_journal_prompts() -> list:
    """
    Call the LLM to get 3 unique, thoughtful journal prompts for today. Cache until next 8am.
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
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        messages = [
            {"role": "system", "content": (
                "You are a creative, supportive mental health assistant. "
                "Each morning at 8am, generate 3 unique, thoughtful, and empathetic journal prompts for today. "
                "Prompts should encourage self-reflection, gratitude, and emotional awareness. "
                "Do not repeat the same prompts every day. Return only the 3 prompts as a JSON array of strings."
            )},
            {"role": "user", "content": "What are today's 3 journal prompts?"}
        ]
        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": messages
        }
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        data = response.json()
        if response.status_code == 200:
            import json as _json
            # Try to extract JSON array from LLM response
            content = data["choices"][0]["message"]["content"].strip()
            try:
                prompts = _json.loads(content)
                if isinstance(prompts, list) and all(isinstance(p, str) for p in prompts):
                    _PROMPT_CACHE['date'] = prompt_date
                    _PROMPT_CACHE['prompts'] = prompts
                    return prompts
            except Exception:
                # fallback: split by lines if not valid JSON
                prompts = [p.strip('-• ').strip() for p in content.split('\n') if p.strip()]
                prompts = [p for p in prompts if len(p) > 10][:3]
                _PROMPT_CACHE['date'] = prompt_date
                _PROMPT_CACHE['prompts'] = prompts
                return prompts
        # fallback static prompts
        return [
            "What are three things you're grateful for today?",
            "Describe a moment when you felt truly at peace.",
            "What would you tell your younger self about handling difficult emotions?"
        ]
    except Exception:
        return [
            "What are three things you're grateful for today?",
            "Describe a moment when you felt truly at peace.",
            "What would you tell your younger self about handling difficult emotions?"
        ]


# Endpoint to get the daily journal prompts
from rest_framework.decorators import api_view
@api_view(["GET"])
@permission_classes([AllowAny])
def daily_journal_prompts(request):
    prompts = get_daily_journal_prompts()
    return Response({"prompts": prompts})

@api_view(["POST"])
@permission_classes([AllowAny])
def anonymous_chat(request):
    user_input = request.data.get("message", "")
    session_id = request.data.get("session_id") 

    if not user_input:
        return Response({"error": "No message provided."}, status=400)

    try:
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id)
            except ChatSession.DoesNotExist:
                session = ChatSession.objects.create()
        else:
            session = ChatSession.objects.create()

        # Fetch last N messages (limit for token safety)
        history = ChatMessage.objects.filter(session=session).order_by("timestamp")[:20]
        messages = [
            {"role": "system", "content": (
                "You are a compassionate and supportive mental health assistant. "
                "Your tone should be warm, empathetic, and non-judgmental. "
                "Never give medical diagnoses or prescriptions. "
                "Encourage the user to seek professional help if they are in crisis."
            )}
        ]

        for msg in history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # Append new user message
        messages.append({"role": "user", "content": user_input})

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": messages
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        data = response.json()

        if response.status_code != 200:
            return Response({"error": data}, status=response.status_code)

        reply = data["choices"][0]["message"]["content"]

        # Save both messages
        ChatMessage.objects.create(session=session, role="user", content=user_input)
        ChatMessage.objects.create(session=session, role="assistant", content=reply)

        # Format the assistant reply
        formatted = reply.strip()
        formatted = re.sub(r'(?<!\n)\n(?!\n)', '\n\n', formatted)
        formatted = re.sub(r'(\s*[-•]\s*)', r'\n\1', formatted)

        return Response({
            "reply": formatted,
            "session_id": str(session.id)
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)



# GET and POST for /journal/
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




# Daily wellness tip for all users (not mood-dependent)
def get_daily_wellness_tip() -> str:
    """
    Call the LLM to get a daily wellness tip for everyone.
    """
    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        messages = [
            {"role": "system", "content": (
                "You are a helpful, positive, and supportive mental health assistant. "
                "Each morning, generate a short, actionable, and empathetic wellness tip for today. "
                "Do not repeat the same tip every day."
            )},
            {"role": "user", "content": "What is today's wellness tip?"}
        ]
        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": messages
        }
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        data = response.json()
        if response.status_code == 200:
            return data["choices"][0]["message"]["content"].strip()
        else:
            return "Take a moment for yourself today. Breathe deeply and do something kind for yourself."
    except Exception:
        return "Take a moment for yourself today. Breathe deeply and do something kind for yourself."

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

    return Response({
        "message": "Mood logged successfully."
    })


# Endpoint to get the daily wellness tip
@api_view(["GET"])
@permission_classes([AllowAny])
def daily_wellness_tip(request):
    tip = get_daily_wellness_tip()
    return Response({"tip": tip})

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