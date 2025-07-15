# symptoms/views.py
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def check_symptoms(request):
    symptoms = request.data.get("symptoms", "")
    if not symptoms:
        return Response({"error": "No symptoms provided."}, status=400)

    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        prompt = (
            f"The user reports the following symptoms: {symptoms}. "
            "Return exactly 3 possible medical conditions in structured JSON with the format:\n"
            "{\n"
            "  \"conditions\": [\n"
            "    {\n"
            "      \"name\": \"<Condition Name>\",\n"
            "      \"probability\": \"<Probability as a percentage or qualitative (e.g., High, Medium, Low)>\",\n"
            "      \"severity\": \"<Severity as Mild, Moderate, or Severe>\",\n"
            "      \"advice\": \"<Clear and safe advice for the user>\"\n"
            "    },\n"
            "    ...\n"
            "  ],\n"
            "  \"note\": \"<General note if symptoms worsen or persist>\"\n"
            "}"
        )

        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": [
                {"role": "system", "content": "You are a helpful medical assistant that always responds in JSON."},
                {"role": "user", "content": prompt}
            ]
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        data = response.json()

        if response.status_code != 200:
            return Response({"error": data}, status=response.status_code)

        raw_content = data["choices"][0]["message"]["content"]

        try:
            structured = eval(raw_content) if isinstance(raw_content, str) else raw_content
            return Response(structured)
        except Exception as parse_err:
            return Response({
                "error": "Failed to parse model response.",
                "raw": raw_content,
                "details": str(parse_err)
            }, status=500)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
