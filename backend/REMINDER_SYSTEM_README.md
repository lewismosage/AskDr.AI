# 🔔 Reminder Email Notification System

This document explains how to set up and use the reminder email notification system for AskDr.AI.

## 📋 Overview

The reminder system allows users to:

- Create medication and appointment reminders
- Receive email notifications when reminders are due
- Set recurring reminders (daily, weekly, monthly)
- Manage reminder preferences

## 🏗️ System Architecture

### Components

1. **Reminder Model** (`reminders/models.py`)

   - Stores reminder data and metadata
   - Tracks email sent status
   - Calculates next trigger times

2. **Email Service** (`services/email_service.py`)

   - Sends reminder notification emails
   - Uses HTML templates for professional emails
   - Includes retry logic and error handling

3. **Celery Tasks** (`reminders/tasks.py`)

   - `check_due_reminders`: Runs every 5 minutes to check for due reminders
   - `test_reminder_email`: Test task for debugging

4. **Email Templates** (`askdr_core/templates/emails/`)
   - `reminder_notification.html`: Professional email template
   - Includes medication/appointment specific tips

## 🚀 Setup Instructions

### 1. Prerequisites

- Django project with Celery configured
- Redis server running
- SMTP email service (Brevo) configured
- Database migrations applied

### 2. Environment Variables

Ensure these are set in your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_brevo_username
EMAIL_HOST_PASSWORD=your_brevo_password
DEFAULT_FROM_EMAIL=your_verified_email@domain.com
SUPPORT_EMAIL=support@askdrai.com

# Company Settings
COMPANY_NAME=AskDr.AI
FRONTEND_DASHBOARD_URL=http://localhost:5173/dashboard

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
```

### 3. Start Services

```bash
# Terminal 1: Start Redis (if not already running)
redis-server

# Terminal 2: Start Celery Worker
cd backend
celery -A askdr_core worker --loglevel=info

# Terminal 3: Start Celery Beat (scheduler)
cd backend
celery -A askdr_core beat --loglevel=info

# Terminal 4: Start Django Server
cd backend
python manage.py runserver
```

## 🧪 Testing the System

### 1. Quick Email Test

```bash
cd backend
python manage.py test_reminder_email --send-email
```

### 2. Create Test Reminder

```bash
cd backend
python manage.py test_reminder_email --create-reminder
```

### 3. Comprehensive Test

```bash
cd backend
python test_reminder_system.py
```

### 4. Manual Task Testing

```python
# In Django shell
python manage.py shell

from reminders.tasks import check_due_reminders, test_reminder_email
test_reminder_email()  # Send test email
check_due_reminders()  # Check for due reminders
```

## 📧 Email Template Features

### Design Elements

- **Professional Header**: Company branding
- **Reminder Card**: Clear display of reminder details
- **Type Badges**: Color-coded medication/appointment indicators
- **Time Information**: Prominent due time display
- **Contextual Tips**: Medication or appointment specific advice
- **Action Buttons**: Links to manage reminders

### Template Variables

- `user`: User object with name and email
- `title`: Reminder title
- `notes`: Optional reminder notes
- `reminder_type`: 'medication' or 'appointment'
- `reminder_type_display`: Human-readable type name
- `due_time`: Formatted due time
- `frequency`: Reminder frequency
- `frequency_display`: Human-readable frequency
- `COMPANY_NAME`: Company name from settings
- `dashboard_url`: Frontend dashboard URL

## 🔄 How It Works

### 1. Reminder Creation

1. User creates reminder through frontend
2. `next_trigger` is calculated based on frequency
3. Reminder is saved with `email_sent=False`

### 2. Scheduled Checking

1. Celery Beat runs `check_due_reminders` every 5 minutes
2. Task finds reminders where `next_trigger <= now` and `email_sent=False`
3. For each due reminder:
   - Send email notification
   - Mark `email_sent=True`
   - Calculate next trigger for recurring reminders
   - Deactivate one-time reminders

### 3. Email Sending

1. Prepare reminder data
2. Render HTML email template
3. Send via SMTP with retry logic
4. Log success/failure

## 🛠️ Troubleshooting

### Common Issues

#### 1. Emails Not Sending

```bash
# Check SMTP configuration
python manage.py shell
from services.email_service import test_smtp_connection
test_smtp_connection()
```

#### 2. Celery Tasks Not Running

```bash
# Check Celery worker status
celery -A askdr_core inspect active

# Check Celery beat status
celery -A askdr_core inspect scheduled
```

#### 3. Reminders Not Triggering

```python
# Check due reminders manually
python manage.py shell
from reminders.models import Reminder
from django.utils import timezone
due = Reminder.objects.filter(next_trigger__lte=timezone.now(), is_active=True, email_sent=False)
print(f"Due reminders: {due.count()}")
```

### Debug Commands

```bash
# Test email service
python manage.py test_reminder_email --send-email --email your@email.com

# Check reminder status
python manage.py shell
from reminders.models import Reminder
for r in Reminder.objects.all():
    print(f"{r.title}: {r.next_trigger} - Active: {r.is_active} - Email: {r.email_sent}")

# Test Celery task
python manage.py shell
from reminders.tasks import check_due_reminders
check_due_reminders()
```

## 📊 Monitoring

### Logs to Watch

- **Email sending**: Look for `[REMINDER EMAIL]` logs
- **Task execution**: Look for `[REMINDER TASK]` logs
- **SMTP errors**: Authentication or connection issues

### Key Metrics

- Number of due reminders processed
- Email send success rate
- Task execution frequency
- User engagement with reminders

## 🔧 Customization

### Adding New Reminder Types

1. Update `REMINDER_TYPES` in `reminders/models.py`
2. Add corresponding tips in email template
3. Update frontend form options

### Changing Email Schedule

1. Update `CELERY_BEAT_SCHEDULE` in `settings.py`
2. Restart Celery Beat service

### Customizing Email Template

1. Edit `reminder_notification.html`
2. Add new CSS classes for styling
3. Test with different reminder types

## 📝 API Endpoints

### Reminder Management

- `POST /reminders/create/` - Create new reminder
- `GET /reminders/` - List user's reminders
- `PUT /reminders/{id}/update/` - Update reminder
- `DELETE /reminders/{id}/delete/` - Deactivate reminder

### Access Control

- `GET /features/check-reminder-access/` - Check user's reminder access

## 🎯 Best Practices

1. **Testing**: Always test email templates with different reminder types
2. **Monitoring**: Set up logging to track email delivery rates
3. **Error Handling**: Implement retry logic for failed email sends
4. **User Experience**: Provide clear feedback when reminders are created
5. **Performance**: Monitor database queries for large reminder sets

## 🚨 Security Considerations

1. **Email Validation**: Ensure user emails are verified
2. **Rate Limiting**: Prevent spam by limiting reminder creation
3. **Data Privacy**: Don't include sensitive information in emails
4. **Access Control**: Verify user permissions before sending reminders

## 📞 Support

For issues with the reminder system:

1. Check the troubleshooting section above
2. Review Celery and Django logs
3. Test SMTP configuration
4. Verify database migrations are applied
