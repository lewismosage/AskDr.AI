# 🚀 Quick Production Setup - AskDr.AI Reminder System

## ✅ Your System is Ready!

Your reminder email system is fully functional. Here's how to make it production-ready:

## 🔧 Option 1: Manual Task Scheduler Setup (Recommended)

### Step 1: Open Task Scheduler

1. Press `Win + R`
2. Type `taskschd.msc`
3. Press Enter

### Step 2: Create the Task

1. Click **"Create Basic Task"** in the right panel
2. **Name**: `AskDr.AI Reminder Processing`
3. **Description**: `Processes due reminders and sends email notifications`
4. Click **Next**

### Step 3: Set Trigger

1. Choose **"Daily"**
2. Set **Start time** to current time
3. Click **Next**
4. Check **"Repeat task every"** → Set to **5 minutes**
5. Set **"for a duration of"** → **1 day**
6. Click **Next**

### Step 4: Set Action

1. Action: **"Start a program"**
2. **Program/script**: `C:\Users\PC\OneDrive\Desktop\AskDr.AI\backend\run_reminders_scheduled.bat`
3. **Start in**: `C:\Users\PC\OneDrive\Desktop\AskDr.AI\backend`
4. Click **Next**

### Step 5: Finish Setup

1. Check **"Open the Properties dialog"**
2. Click **Finish**
3. In Properties dialog:
   - **General tab**: Check "Run with highest privileges"
   - **Conditions tab**: Check "Start the task only if the computer is on AC power"
   - **Settings tab**: Check "Allow task to be run on demand"
4. Click **OK**

## 🔧 Option 2: PowerShell Script (Run as Administrator)

1. **Open PowerShell as Administrator**

   - Press `Win + X` → "Windows PowerShell (Admin)"

2. **Navigate to backend directory**

   ```powershell
   cd "C:\Users\PC\OneDrive\Desktop\AskDr.AI\backend"
   ```

3. **Run setup script**
   ```powershell
   .\setup_task_scheduler.ps1
   ```

## 🧪 Test Your Setup

### Test 1: Create a Test Reminder

```bash
cd backend
.\venv\Scripts\Activate.ps1
python create_test_reminder.py
```

### Test 2: Run Task Manually

1. Open Task Scheduler
2. Find your task "AskDr.AI Reminder Processing"
3. Right-click → "Run"
4. Check your email for the reminder notification

### Test 3: Verify Automatic Processing

1. Create a reminder for 5 minutes from now
2. Wait for the scheduled task to run
3. Check your email

## 📊 Monitor Your System

### Check Task Status

- Open Task Scheduler (`taskschd.msc`)
- Look for your task in the list
- Check "Last Run Result" and "Next Run Time"

### Check Logs

- The task will briefly open a command window
- Watch for any error messages
- Check your email for reminder notifications

## 🚨 Troubleshooting

### Task Not Running

```powershell
# Check if task exists
Get-ScheduledTask -TaskName "AskDr.AI Reminder Processing"

# Enable task if disabled
Enable-ScheduledTask -TaskName "AskDr.AI Reminder Processing"

# Run task manually
Start-ScheduledTask -TaskName "AskDr.AI Reminder Processing"
```

### Email Not Sending

```bash
cd backend
.\venv\Scripts\Activate.ps1

# Test email system
python manage.py test_reminder_email --send-email
```

### Manual Processing

```bash
cd backend
.\venv\Scripts\Activate.ps1
python process_reminders_now.py
```

## 🎯 Success Indicators

- ✅ Task appears in Task Scheduler
- ✅ Task runs every 5 minutes
- ✅ Reminder emails are sent to users
- ✅ No errors in task execution
- ✅ System handles recurring reminders

## 📞 Quick Commands

### Start/Stop Task

```powershell
# Start task
Start-ScheduledTask -TaskName "AskDr.AI Reminder Processing"

# Stop task
Stop-ScheduledTask -TaskName "AskDr.AI Reminder Processing"

# Disable task
Disable-ScheduledTask -TaskName "AskDr.AI Reminder Processing"
```

### Check Reminders

```bash
cd backend
.\venv\Scripts\Activate.ps1

# Check due reminders
python -c "from reminders.models import Reminder; from django.utils import timezone; print('Due reminders:', Reminder.objects.filter(next_trigger__lte=timezone.now(), is_active=True, email_sent=False).count())"

# Process reminders manually
python process_reminders_now.py
```

## 🎉 You're All Set!

Your reminder system is now production-ready and will automatically:

- Check for due reminders every 5 minutes
- Send professional email notifications
- Handle recurring reminders
- Manage reminder lifecycle

The system will start working as soon as you create the Task Scheduler task! 🚀
