import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def medication_qa(request):
    question = request.data.get("question", "")
    if not question:
        return Response({"error": "No question provided."}, status=400)

    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

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

        content = data["choices"][0]["message"]["content"]
        structured = json.loads(content)

        return Response(structured)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
