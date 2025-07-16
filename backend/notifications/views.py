# notifications/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import NotificationPreference
from .serializers import NotificationPreferenceSerializer

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def notification_preferences(request):
    try:
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
    except NotificationPreference.DoesNotExist:
        return Response({"error": "Preferences not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NotificationPreferenceSerializer(prefs)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = NotificationPreferenceSerializer(prefs, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
