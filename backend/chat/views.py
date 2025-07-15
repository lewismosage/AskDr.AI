import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from .models import ChatLog
from .models import ChatLog, ChatSession
import json
import uuid

@api_view(['POST'])
@permission_classes([AllowAny])
def ask_ai(request):
    question = request.data.get("question", "")
    session_id = request.data.get("session_id")

    if not question:
        return Response({"error": "No question provided."}, status=400)

    try:
        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id)
            except ChatSession.DoesNotExist:
                session = ChatSession.objects.create(user=request.user if request.user.is_authenticated else None)
        else:
            session = ChatSession.objects.create(user=request.user if request.user.is_authenticated else None)

        # Fetch history for context
        history = ChatLog.objects.filter(session=session).order_by("created_at")[:10]
        messages = []

        for entry in history:
            messages.append({"role": "user", "content": entry.question})
            messages.append({"role": "assistant", "content": entry.response})

        # Append new question
        messages.append({"role": "user", "content": f"""
You are a helpful medical assistant. The person you are helping asked: "{question}".

Please respond as if you are speaking directly to them, using 'you' and 'your' instead of 'the user'.

Please respond in **this JSON format**:

{{
  "summary": "A short overview (1-2 sentences)",
  "recommendations": [
    "First recommendation",
    "Second recommendation",
    "Third recommendation"
  ]
}}

Only return valid JSON. Do not include explanations or markdown.
"""})

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

        content = data["choices"][0]["message"]["content"]
        structured = json.loads(content)

        # Log the interaction
        ChatLog.objects.create(
            session=session,
            user=request.user if request.user.is_authenticated else None,
            question=question,
            response=content
        )

        return Response({
            "session_id": str(session.id),
            **structured
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)
