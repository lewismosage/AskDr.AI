from celery import shared_task
from django.utils import timezone
from .models import Reminder

@shared_task
def check_due_reminders():
    now = timezone.now()
    due_reminders = Reminder.objects.filter(next_trigger__lte=now, is_active=True)

    for reminder in due_reminders:
        # For now just log to console, later we’ll email/SMS
        print(f"[Reminder] {reminder.user.username} - {reminder.title} is due!")

        # Reschedule next_trigger if recurring
        if reminder.frequency == 'daily':
            reminder.next_trigger += timedelta(days=1)
        elif reminder.frequency == 'weekly':
            reminder.next_trigger += timedelta(weeks=1)
        elif reminder.frequency == 'monthly':
            reminder.next_trigger += timedelta(days=30)
        else:
            reminder.is_active = False  # one-time reminder

        reminder.save()
