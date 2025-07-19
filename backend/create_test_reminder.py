#!/usr/bin/env python
"""
Script to create a test reminder that's due immediately
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

def create_test_reminder():
    """Create a test reminder that's due immediately"""
    
    # Get the user with email lewismosage@gmail.com
    try:
        user = User.objects.get(email='lewismosage@gmail.com')
        print(f"✅ Found user: {user.email}")
    except User.DoesNotExist:
        print("❌ User with email lewismosage@gmail.com not found")
        return False
    
    # Create a reminder due 1 minute ago (immediately due)
    due_time = timezone.now() - timedelta(minutes=1)
    
    try:
        reminder = Reminder.objects.create(
            user=user,
            title='Test Reminder - Due Now',
            notes='This is a test reminder created via shell to test email notifications',
            reminder_type='medication',
            start_time=due_time,
            frequency='once',
            next_trigger=due_time,  # Due immediately
            is_active=True,
            email_sent=False
        )
        
        print(f"✅ Created test reminder:")
        print(f"   Title: {reminder.title}")
        print(f"   Type: {reminder.reminder_type}")
        print(f"   Due: {reminder.next_trigger}")
        print(f"   Active: {reminder.is_active}")
        print(f"   Email sent: {reminder.email_sent}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating reminder: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔔 Creating Test Reminder...")
    success = create_test_reminder()
    
    if success:
        print("\n✅ Test reminder created successfully!")
        print("Now run: python manage.py process_reminders")
        print("This will send the email notification.")
    else:
        print("\n❌ Failed to create test reminder") 