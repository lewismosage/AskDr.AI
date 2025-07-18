# reminders/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Reminder
from .serializers import ReminderSerializer
from datetime import timedelta
from users.models import UserProfile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reminder(request):
    try:
        profile = request.user.profile
        if not profile.can_use_reminders():
            return Response(
                {"error": "This feature requires a Plus or Pro subscription"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ReminderSerializer(data=request.data)
        if serializer.is_valid():
            reminder = serializer.save(user=request.user)

            # Calculate next_trigger
            freq = getattr(reminder, 'frequency', None)
            if freq == 'once':
                reminder.next_trigger = reminder.start_time
            elif freq == 'daily':
                reminder.next_trigger = reminder.start_time + timedelta(days=1)
            elif freq == 'weekly':
                reminder.next_trigger = reminder.start_time + timedelta(weeks=1)
            elif freq == 'monthly':
                reminder.next_trigger = reminder.start_time + timedelta(days=30)  # simple approx

            reminder.save()
            return Response(ReminderSerializer(reminder).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_reminders(request):
    try:
        profile = request.user.profile
        if not profile.can_use_reminders():
            return Response(
                {"error": "This feature requires a Plus or Pro subscription"},
                status=status.HTTP_403_FORBIDDEN
            )
        reminders = Reminder.objects.filter(user=request.user, is_active=True)
        serializer = ReminderSerializer(reminders, many=True)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_reminder(request, reminder_id):
    try:
        profile = request.user.profile
        if not profile.can_use_reminders():
            return Response(
                {"error": "This feature requires a Plus or Pro subscription"},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            reminder = Reminder.objects.get(id=reminder_id, user=request.user)
        except Reminder.DoesNotExist:
            return Response({"error": "Reminder not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReminderSerializer(reminder, data=request.data, partial=True)
        if serializer.is_valid():
            updated_reminder = serializer.save()

            # Recalculate next_trigger if frequency or start_time changed
            freq = updated_reminder.frequency
            if freq == 'once':
                updated_reminder.next_trigger = updated_reminder.start_time
            elif freq == 'daily':
                updated_reminder.next_trigger = updated_reminder.start_time + timedelta(days=1)
            elif freq == 'weekly':
                updated_reminder.next_trigger = updated_reminder.start_time + timedelta(weeks=1)
            elif freq == 'monthly':
                updated_reminder.next_trigger = updated_reminder.start_time + timedelta(days=30)

            updated_reminder.save()
            return Response(ReminderSerializer(updated_reminder).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_reminder(request, reminder_id):
    try:
        profile = request.user.profile
        if not profile.can_use_reminders():
            return Response(
                {"error": "This feature requires a Plus or Pro subscription"},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            reminder = Reminder.objects.get(id=reminder_id, user=request.user)
        except Reminder.DoesNotExist:
            return Response({"error": "Reminder not found."}, status=status.HTTP_404_NOT_FOUND)

        reminder.is_active = False
        reminder.save()
        return Response({"message": "Reminder deactivated."}, status=status.HTTP_204_NO_CONTENT)
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST
        )