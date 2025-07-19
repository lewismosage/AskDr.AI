from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from reminders.models import Reminder
from services.email_service import send_reminder_notification
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test reminder email functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test reminder to (optional)',
        )
        parser.add_argument(
            '--create-reminder',
            action='store_true',
            help='Create a test reminder in the database',
        )
        parser.add_argument(
            '--send-email',
            action='store_true',
            help='Send a test reminder email',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🔔 Reminder Email Testing Tool')
        )
        
        # Get or create a test user
        test_email = options.get('email')
        if test_email:
            user, created = User.objects.get_or_create(
                email=test_email,
                defaults={
                    'username': test_email.split('@')[0],
                    'first_name': 'Test',
                    'last_name': 'User'
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created test user: {user.email}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'Using existing user: {user.email}')
                )
        else:
            user = User.objects.first()
            if not user:
                self.stdout.write(
                    self.style.ERROR('No users found in database. Please create a user first.')
                )
                return
            self.stdout.write(
                self.style.SUCCESS(f'Using first user: {user.email}')
            )

        # Create test reminder if requested
        if options.get('create_reminder'):
            reminder = Reminder.objects.create(
                user=user,
                title='Test Medication Reminder',
                notes='This is a test reminder created by the management command',
                reminder_type='medication',
                start_time=timezone.now() + timedelta(minutes=1),  # Due in 1 minute
                frequency='once',
                next_trigger=timezone.now() + timedelta(minutes=1),
                is_active=True,
                email_sent=False
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created test reminder: {reminder.title} (ID: {reminder.id})')
            )
            self.stdout.write(
                self.style.WARNING(f'Reminder will be due at: {reminder.next_trigger}')
            )

        # Send test email if requested
        if options.get('send_email'):
            reminder_data = {
                'title': 'Test Medication Reminder',
                'notes': 'This is a test reminder email sent by the management command',
                'reminder_type': 'medication',
                'due_time': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
                'frequency': 'once'
            }
            
            self.stdout.write(f'Sending test reminder email to: {user.email}')
            
            try:
                result = send_reminder_notification(user, reminder_data)
                
                if result:
                    self.stdout.write(
                        self.style.SUCCESS('✅ Test reminder email sent successfully!')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR('❌ Failed to send test reminder email!')
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error sending test email: {str(e)}')
                )

        # Show current reminders for the user
        user_reminders = Reminder.objects.filter(user=user, is_active=True)
        if user_reminders.exists():
            self.stdout.write('\n📋 Current active reminders:')
            for reminder in user_reminders:
                status = "📧 Email sent" if reminder.email_sent else "⏰ Pending"
                self.stdout.write(
                    f'  • {reminder.title} ({reminder.reminder_type}) - {reminder.next_trigger} - {status}'
                )
        else:
            self.stdout.write('\n📋 No active reminders found for this user.')

        # Instructions
        self.stdout.write('\n💡 Usage instructions:')
        self.stdout.write('  • python manage.py test_reminder_email --create-reminder')
        self.stdout.write('  • python manage.py test_reminder_email --send-email')
        self.stdout.write('  • python manage.py test_reminder_email --email user@example.com --send-email')
        self.stdout.write('\n🔄 To test the scheduled task:')
        self.stdout.write('  • Start Celery worker: celery -A askdr_core worker --loglevel=info')
        self.stdout.write('  • Start Celery beat: celery -A askdr_core beat --loglevel=info') 