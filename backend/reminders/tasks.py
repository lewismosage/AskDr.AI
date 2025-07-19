from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Reminder
from services.email_service import send_reminder_notification
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_due_reminders():
    """
    Check for due reminders and send email notifications
    """
    now = timezone.now()
    due_reminders = Reminder.objects.filter(
        next_trigger__lte=now, 
        is_active=True,
        email_sent=False
    ).select_related('user')

    print(f"[REMINDER TASK] Found {due_reminders.count()} due reminders")
    logger.info(f"Found {due_reminders.count()} due reminders")

    for reminder in due_reminders:
        try:
            print(f"[REMINDER TASK] Processing reminder: {reminder.user.username} - {reminder.title}")
            logger.info(f"Processing reminder: {reminder.user.username} - {reminder.title}")

            # Prepare reminder data for email
            reminder_data = {
                'title': reminder.title,
                'notes': reminder.notes or '',
                'reminder_type': reminder.reminder_type,
                'due_time': reminder.next_trigger.strftime('%B %d, %Y at %I:%M %p'),
                'frequency': reminder.frequency
            }

            # Send email notification
            email_sent = send_reminder_notification(reminder.user, reminder_data)
            
            if email_sent:
                print(f"[REMINDER TASK] Email sent successfully for reminder: {reminder.title}")
                logger.info(f"Email sent successfully for reminder: {reminder.title}")
                reminder.mark_email_sent()
            else:
                print(f"[REMINDER TASK] Failed to send email for reminder: {reminder.title}")
                logger.error(f"Failed to send email for reminder: {reminder.title}")

            # Calculate next trigger for recurring reminders
            if reminder.frequency != 'once':
                next_trigger = reminder.calculate_next_trigger()
                if next_trigger:
                    reminder.next_trigger = next_trigger
                    reminder.reset_email_sent()  # Reset for next trigger
                    reminder.save()
                    print(f"[REMINDER TASK] Next trigger set to: {next_trigger}")
                    logger.info(f"Next trigger set to: {next_trigger}")
                else:
                    reminder.is_active = False
                    reminder.save()
                    print(f"[REMINDER TASK] Deactivated reminder: {reminder.title}")
                    logger.info(f"Deactivated reminder: {reminder.title}")
            else:
                # One-time reminder - deactivate after sending
                reminder.is_active = False
                reminder.save()
                print(f"[REMINDER TASK] Deactivated one-time reminder: {reminder.title}")
                logger.info(f"Deactivated one-time reminder: {reminder.title}")

        except Exception as e:
            print(f"[REMINDER TASK] Error processing reminder {reminder.id}: {str(e)}")
            logger.error(f"Error processing reminder {reminder.id}: {str(e)}", exc_info=True)
            continue

    print(f"[REMINDER TASK] Completed processing due reminders")
    logger.info("Completed processing due reminders")

@shared_task
def test_reminder_email():
    """
    Test task to send a reminder email (for testing purposes)
    """
    try:
        from django.contrib.auth.models import User
        
        # Get the first user for testing
        user = User.objects.first()
        if not user:
            print("[REMINDER TEST] No users found for testing")
            return False
            
        reminder_data = {
            'title': 'Test Medication Reminder',
            'notes': 'This is a test reminder to verify email functionality',
            'reminder_type': 'medication',
            'due_time': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
            'frequency': 'once'
        }
        
        print(f"[REMINDER TEST] Sending test reminder email to: {user.email}")
        result = send_reminder_notification(user, reminder_data)
        
        if result:
            print(f"[REMINDER TEST] Test reminder email sent successfully!")
        else:
            print(f"[REMINDER TEST] Failed to send test reminder email!")
            
        return result
        
    except Exception as e:
        print(f"[REMINDER TEST] Error: {str(e)}")
        logger.error(f"Test reminder email error: {str(e)}", exc_info=True)
        return False
