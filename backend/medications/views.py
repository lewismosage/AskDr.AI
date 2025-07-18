import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import json
from rest_framework.exceptions import PermissionDenied
from users.models import UserProfile

@api_view(['POST'])
@permission_classes([AllowAny])
def medication_qa(request):
    # For authenticated users, check feature access
    if request.user.is_authenticated:
        profile = request.user.profile
        if not profile.can_use_feature('medication_qa'):
            raise PermissionDenied(
                detail=f"You've used {profile.monthly_medication_questions_used} of "
                      f"{10 if profile.plan == 'free' else 'unlimited'} medication questions this month. "
                      f"{'Upgrade your plan for unlimited questions.' if profile.plan == 'free' else ''}"
            )

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
                {"role": "system", "content": "You are a helpful medical assistant that always responds in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}  # Ensure JSON output
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        data = response.json()

        if response.status_code != 200:
            return Response({"error": data}, status=response.status_code)

        raw_content = data["choices"][0]["message"]["content"]
        
        try:
            # Safely parse JSON response
            structured = json.loads(raw_content)
            
            # Validate the response structure
            if not isinstance(structured, dict) or 'summary' not in structured:
                raise ValueError("Invalid response format from AI model")
            
            # Record usage for authenticated free users
            if request.user.is_authenticated and request.user.profile.plan == 'free':
                request.user.profile.record_feature_usage('medication_qa')
                request.user.profile.save()

            return Response(structured)
            
        except (json.JSONDecodeError, ValueError) as parse_err:
            # Try to extract error message if response isn't valid JSON
            error_msg = str(parse_err)
            if "error" in raw_content:
                try:
                    error_data = json.loads(raw_content)
                    error_msg = error_data.get("error", error_msg)
                except:
                    pass
            
            return Response({
                "error": "Failed to parse model response",
                "details": error_msg,
                "raw_response": raw_content
            }, status=500)

    except PermissionDenied as pe:
        raise  # Re-raise permission denied errors
    except Exception as e:
        return Response({
            "error": "An unexpected error occurred",
            "details": str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_medication_qa_access(request):
    """Endpoint for frontend to check user's access status"""
    try:
        profile = request.user.profile
        return Response({
            "has_access": profile.can_use_feature('medication_qa'),
            "questions_used": profile.monthly_medication_questions_used,
            "questions_allowed": 10 if profile.plan == 'free' else float('inf'),
            "plan": profile.plan
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)