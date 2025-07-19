#!/usr/bin/env python
"""
Test script for the reminder email system
Run this script to test the reminder functionality
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
from reminders.tasks import check_due_reminders, test_reminder_email

def test_email_service():
    """Test the email service directly"""
    print("🔔 Testing Email Service...")
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if created:
        print(f"✅ Created test user: {user.email}")
    else:
        print(f"✅ Using existing user: {user.email}")
    
    # Test reminder data
    reminder_data = {
        'title': 'Test Medication Reminder',
        'notes': 'This is a test reminder to verify email functionality',
        'reminder_type': 'medication',
        'due_time': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
        'frequency': 'once'
    }
    
    print(f"📧 Sending test reminder email to: {user.email}")
    
    try:
        result = send_reminder_notification(user, reminder_data)
        
        if result:
            print("✅ Email service test PASSED!")
            return True
        else:
            print("❌ Email service test FAILED!")
            return False
            
    except Exception as e:
        print(f"❌ Email service test ERROR: {str(e)}")
        return False

def test_reminder_creation():
    """Test creating a reminder in the database"""
    print("\n📝 Testing Reminder Creation...")
    
    user = User.objects.first()
    if not user:
        print("❌ No users found in database")
        return False
    
    try:
        # Create a reminder due in 1 minute
        reminder = Reminder.objects.create(
            user=user,
            title='Test Reminder Creation',
            notes='Testing reminder creation functionality',
            reminder_type='appointment',
            start_time=timezone.now() + timedelta(minutes=1),
            frequency='once',
            next_trigger=timezone.now() + timedelta(minutes=1),
            is_active=True,
            email_sent=False
        )
        
        print(f"✅ Created reminder: {reminder.title} (ID: {reminder.id})")
        print(f"   Due at: {reminder.next_trigger}")
        print(f"   Active: {reminder.is_active}")
        print(f"   Email sent: {reminder.email_sent}")
        
        return True
        
    except Exception as e:
        print(f"❌ Reminder creation test ERROR: {str(e)}")
        return False

def test_celery_task():
    """Test the Celery task"""
    print("\n🔄 Testing Celery Task...")
    
    try:
        # Test the task function directly
        print("Running check_due_reminders task...")
        check_due_reminders()
        print("✅ Celery task test completed")
        return True
        
    except Exception as e:
        print(f"❌ Celery task test ERROR: {str(e)}")
        return False

def test_reminder_model():
    """Test the Reminder model methods"""
    print("\n🏗️ Testing Reminder Model...")
    
    try:
        # Test model methods
        reminder = Reminder.objects.first()
        if not reminder:
            print("❌ No reminders found to test")
            return False
        
        print(f"✅ Testing reminder: {reminder.title}")
        
        # Test next trigger calculation
        next_trigger = reminder.calculate_next_trigger()
        print(f"   Next trigger calculation: {next_trigger}")
        
        # Test email sent marking
        original_email_sent = reminder.email_sent
        reminder.mark_email_sent()
        print(f"   Email sent marked: {reminder.email_sent}")
        
        # Reset for next test
        reminder.reset_email_sent()
        print(f"   Email sent reset: {reminder.email_sent}")
        
        return True
        
    except Exception as e:
        print(f"❌ Reminder model test ERROR: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Reminder System Tests...\n")
    
    tests = [
        ("Email Service", test_email_service),
        ("Reminder Creation", test_reminder_creation),
        ("Reminder Model", test_reminder_model),
        ("Celery Task", test_celery_task),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test CRASHED: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST RESULTS SUMMARY")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Reminder system is working correctly.")
    else:
        print("⚠️ Some tests failed. Please check the errors above.")
    
    print("\n💡 Next steps:")
    print("1. Start Celery worker: celery -A askdr_core worker --loglevel=info")
    print("2. Start Celery beat: celery -A askdr_core beat --loglevel=info")
    print("3. Create reminders through the frontend")
    print("4. Monitor logs for email notifications")

if __name__ == "__main__":
    main() 