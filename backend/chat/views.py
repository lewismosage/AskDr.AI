import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from .models import ChatLog

@api_view(['POST'])
@permission_classes([AllowAny])
def ask_ai(request):
    question = request.data.get("question", "")
    if not question:
        return Response({"error": "No question provided."}, status=400)

    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

        # Instruct Claude to respond with a structured format
        prompt = f"""
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
"""

        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        data = response.json()

        if response.status_code != 200:
            return Response({"error": data}, status=response.status_code)

        # Parse response content as JSON
        import json
        content = data["choices"][0]["message"]["content"]
        structured = json.loads(content)

        # Log only if the user is authenticated
        if request.user.is_authenticated:
            ChatLog.objects.create(user=request.user, question=question, response=content)

        return Response(structured)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
