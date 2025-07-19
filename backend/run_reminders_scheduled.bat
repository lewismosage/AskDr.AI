@echo off
REM ========================================
REM AskDr.AI Reminder Processing Script
REM Run by Windows Task Scheduler
REM ========================================

echo [%date% %time%] Starting reminder processing...

REM Set the working directory to the script location
cd /d "%~dp0"

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run the reminder processing script
python process_reminders_now.py

REM Log completion
echo [%date% %time%] Reminder processing completed.

REM Keep window open for 5 seconds to see any errors
timeout /t 5 /nobreak > nul

REM Deactivate virtual environment
deactivate 