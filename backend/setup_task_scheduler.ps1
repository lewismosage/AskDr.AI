# PowerShell script to set up Windows Task Scheduler for AskDr.AI reminders
# Run this script as Administrator

param(
    [string]$TaskName = "AskDr.AI Reminder Processing",
    [string]$Interval = "5"  # Minutes
)

Write-Host "🔔 Setting up Windows Task Scheduler for AskDr.AI Reminders..." -ForegroundColor Green

# Get the current directory (where this script is located)
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$BatchFilePath = Join-Path $ScriptPath "run_reminders_scheduled.bat"

# Check if batch file exists
if (-not (Test-Path $BatchFilePath)) {
    Write-Host "❌ Error: Batch file not found at $BatchFilePath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found batch file: $BatchFilePath" -ForegroundColor Green

# Create the trigger (every X minutes)
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes $Interval) -RepetitionDuration (New-TimeSpan -Days 365)

# Create the action
$Action = New-ScheduledTaskAction -Execute $BatchFilePath -WorkingDirectory $ScriptPath

# Create the settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create the principal (run as current user)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

# Register the task
try {
    Register-ScheduledTask -TaskName $TaskName -Trigger $Trigger -Action $Action -Settings $Settings -Principal $Principal -Description "Processes due reminders for AskDr.AI and sends email notifications"
    
    Write-Host "✅ Task '$TaskName' created successfully!" -ForegroundColor Green
    Write-Host "📅 Task will run every $Interval minutes" -ForegroundColor Yellow
    Write-Host "🔄 Task will start automatically when the system starts" -ForegroundColor Yellow
    
    # Show task info
    Write-Host "`n📋 Task Details:" -ForegroundColor Cyan
    Get-ScheduledTask -TaskName $TaskName | Format-List Name, State, LastRunTime, NextRunTime
    
    Write-Host "`n💡 To manage the task:" -ForegroundColor Yellow
    Write-Host "   • Open Task Scheduler (taskschd.msc)" -ForegroundColor White
    Write-Host "   • Look for '$TaskName' in the task list" -ForegroundColor White
    Write-Host "   • Right-click to enable/disable/modify" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error creating task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running this script as Administrator" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🎉 Setup completed! Your reminder system is now production-ready!" -ForegroundColor Green 