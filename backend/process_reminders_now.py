#!/usr/bin/env python
"""
Script to process due reminders and send email notifications
Run this to test the reminder email system
"""

import os
import sys
import django
from datetime import timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'askdr_core.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from reminders.models import Reminder
from services.email_service import send_reminder_notification
import logging

logger = logging.getLogger(__name__)

def process_due_reminders():
    """Process due reminders and send email notifications"""
    
    print("🔔 Processing Due Reminders...")
    
    try:
        now = timezone.now()
        due_reminders = Reminder.objects.filter(
            next_trigger__lte=now, 
            is_active=True,
            email_sent=False
        ).select_related('user')
        
        print(f"Found {due_reminders.count()} due reminders")
        
        if due_reminders.count() == 0:
            print("✅ No due reminders found!")
            return
        
        for reminder in due_reminders:
            print(f"  • {reminder.user.email} - {reminder.title} (Due: {reminder.next_trigger})")
        
        print('\nProcessing reminders...')
        
        for reminder in due_reminders:
            try:
                print(f"Processing: {reminder.title}")
                
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
                    print(f"✅ Email sent for: {reminder.title}")
                    reminder.mark_email_sent()
                else:
                    print(f"❌ Failed to send email for: {reminder.title}")

                # Calculate next trigger for recurring reminders
                if reminder.frequency != 'once':
                    next_trigger = reminder.calculate_next_trigger()
                    if next_trigger:
                        reminder.next_trigger = next_trigger
                        reminder.reset_email_sent()  # Reset for next trigger
                        reminder.save()
                        print(f"   Next trigger: {next_trigger}")
                    else:
                        reminder.is_active = False
                        reminder.save()
                        print("   Deactivated reminder")
                else:
                    # One-time reminder - deactivate after sending
                    reminder.is_active = False
                    reminder.save()
                    print("   Deactivated one-time reminder")

            except Exception as e:
                print(f"❌ Error processing reminder {reminder.id}: {str(e)}")
                logger.error(f"Error processing reminder {reminder.id}: {str(e)}", exc_info=True)
                continue
        
        print("✅ Reminder processing completed!")
        
    except Exception as e:
        print(f'❌ Error processing reminders: {str(e)}')
        logger.error(f"Error processing reminders: {str(e)}", exc_info=True)

if __name__ == "__main__":
    process_due_reminders() 