@echo off
echo ========================================
echo Killing processes on port 8002
echo ========================================
echo.

echo Finding processes on port 8002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo   Failed to kill process %%a
    ) else (
        echo   Successfully killed process %%a
    )
)

echo.
echo Done! Port 8002 should now be free.
echo.
pause

