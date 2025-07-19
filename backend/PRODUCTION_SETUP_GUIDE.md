# 🚀 Production Setup Guide - AskDr.AI Reminder System

This guide will help you set up the reminder email notification system for production use.

## 📋 Prerequisites

- Windows 10/11 with PowerShell
- Python 3.8+ installed
- AskDr.AI backend configured and working
- Brevo SMTP credentials configured
- Redis server running (optional, for future Celery setup)

## 🔧 Step 1: Verify Current Setup

First, ensure your reminder system is working:

```bash
cd backend
.\venv\Scripts\Activate.ps1

# Test email sending
python manage.py test_reminder_email --send-email

# Test reminder processing
python process_reminders_now.py
```

## 🔧 Step 2: Automatic Setup (Recommended)

### Option A: PowerShell Script (Easiest)

1. **Open PowerShell as Administrator**

   - Press `Win + X` → "Windows PowerShell (Admin)"

2. **Navigate to your backend directory**

   ```powershell
   cd "C:\Users\PC\OneDrive\Desktop\AskDr.AI\backend"
   ```

3. **Run the setup script**

   ```powershell
   .\setup_task_scheduler.ps1
   ```

4. **Customize interval (optional)**
   ```powershell
   .\setup_task_scheduler.ps1 -Interval 10  # Run every 10 minutes
   ```

### Option B: Manual Task Scheduler Setup

1. **Open Task Scheduler**

   - Press `Win + R` → Type `taskschd.msc` → Press Enter

2. **Create Basic Task**

   - Click "Create Basic Task" in the right panel
   - Name: `AskDr.AI Reminder Processing`
   - Description: `Processes due reminders and sends email notifications`

3. **Set Trigger**

   - Choose "Daily"
   - Set start time to current time
   - Check "Repeat task every" → Set to 5 minutes
   - Set "for a duration of" → 1 day

4. **Set Action**

   - Action: "Start a program"
   - Program/script: `C:\Users\PC\OneDrive\Desktop\AskDr.AI\backend\run_reminders_scheduled.bat`
   - Start in: `C:\Users\PC\OneDrive\Desktop\AskDr.AI\backend`

5. **Advanced Settings**
   - Check "Open the Properties dialog"
   - In Properties:
     - General tab: Check "Run with highest privileges"
     - Conditions tab: Check "Start the task only if the computer is on AC power"
     - Settings tab: Check "Allow task to be run on demand"

## 🔧 Step 3: Verify Production Setup

### Test the Scheduled Task

1. **Run task manually**

   - In Task Scheduler, right-click your task → "Run"

2. **Check logs**

   - Look for the command window that opens briefly
   - Check your email for reminder notifications

3. **Monitor task status**
   - In Task Scheduler, check "Last Run Result" and "Next Run Time"

### Create a Test Reminder

```bash
cd backend
.\venv\Scripts\Activate.ps1
python create_test_reminder.py
```

Wait for the scheduled task to run (or run it manually), then check your email.

## 🔧 Step 4: Monitoring and Maintenance

### Daily Monitoring

1. **Check Task Scheduler**

   - Open `taskschd.msc`
   - Verify task is running and no errors

2. **Check Email Delivery**

   - Monitor your email for reminder notifications
   - Check spam folder if needed

3. **Check Logs**
   - Look for any error messages in the command window
   - Check Django logs for email sending issues

### Troubleshooting

#### Task Not Running

```powershell
# Check task status
Get-ScheduledTask -TaskName "AskDr.AI Reminder Processing"

# Enable task if disabled
Enable-ScheduledTask -TaskName "AskDr.AI Reminder Processing"

# Run task manually
Start-ScheduledTask -TaskName "AskDr.AI Reminder Processing"
```

#### Email Not Sending

```bash
cd backend
.\venv\Scripts\Activate.ps1

# Test SMTP connection
python -c "from services.email_service import test_smtp_connection; test_smtp_connection()"

# Test email sending
python manage.py test_reminder_email --send-email
```

#### Reminders Not Processing

```bash
cd backend
.\venv\Scripts\Activate.ps1

# Check for due reminders
python -c "from reminders.models import Reminder; from django.utils import timezone; print(Reminder.objects.filter(next_trigger__lte=timezone.now(), is_active=True, email_sent=False).count())"

# Process reminders manually
python process_reminders_now.py
```

## 🔧 Step 5: Advanced Configuration

### Customize Check Interval

To change how often reminders are checked:

```powershell
# Remove existing task
Unregister-ScheduledTask -TaskName "AskDr.AI Reminder Processing" -Confirm:$false

# Create new task with different interval
.\setup_task_scheduler.ps1 -Interval 15  # Check every 15 minutes
```

### Multiple Environments

For different environments (dev/staging/prod), create separate tasks:

```powershell
.\setup_task_scheduler.ps1 -TaskName "AskDr.AI Reminders - Production" -Interval 5
.\setup_task_scheduler.ps1 -TaskName "AskDr.AI Reminders - Staging" -Interval 10
```

### Logging and Monitoring

Add logging to track reminder processing:

```bash
# Create a log directory
mkdir logs

# Modify run_reminders_scheduled.bat to include logging
echo [%date% %time%] Starting reminder processing... >> logs\reminders.log
python process_reminders_now.py >> logs\reminders.log 2>&1
echo [%date% %time%] Completed reminder processing. >> logs\reminders.log
```

## 🔧 Step 6: Security Considerations

### File Permissions

- Ensure only authorized users can access the backend directory
- Restrict access to `.env` file containing SMTP credentials

### Network Security

- Ensure SMTP credentials are secure
- Consider using environment variables for sensitive data

### Backup Strategy

- Regularly backup your database
- Keep copies of reminder configurations

## 📊 Performance Optimization

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_reminder_next_trigger ON reminders_reminder(next_trigger);
CREATE INDEX idx_reminder_active_email ON reminders_reminder(is_active, email_sent);
```

### Memory Usage

- Monitor memory usage during reminder processing
- Consider processing reminders in batches for large datasets

## 🚨 Emergency Procedures

### Stop Reminder Processing

```powershell
# Disable the task
Disable-ScheduledTask -TaskName "AskDr.AI Reminder Processing"

# Or delete the task
Unregister-ScheduledTask -TaskName "AskDr.AI Reminder Processing" -Confirm:$false
```

### Manual Processing

```bash
cd backend
.\venv\Scripts\Activate.ps1
python process_reminders_now.py
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Task Scheduler logs
3. Check Django and email service logs
4. Verify SMTP credentials and network connectivity

## 🎉 Success Checklist

- [ ] Task Scheduler task created and running
- [ ] Test reminders are being sent via email
- [ ] Reminders created through frontend are processed
- [ ] No errors in Task Scheduler logs
- [ ] Email delivery is consistent
- [ ] System handles recurring reminders correctly

Your reminder system is now production-ready! 🚀
