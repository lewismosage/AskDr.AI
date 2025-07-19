@echo off
echo Starting Reminder Processing...
cd /d "%~dp0"
call venv\Scripts\activate.bat
python manage.py process_reminders
pause 