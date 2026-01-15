@echo off
echo ========================================
echo   Car Rental Application Startup
echo ========================================
echo.

REM Start backend services
echo [1/2] Starting Backend Services...
start "CarRental Backend" cmd /k "cd backend && start-all-services.bat"
timeout /t 5 /nobreak >nul

REM Start frontend
echo [2/2] Starting Frontend...
start "CarRental Frontend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ========================================
echo   Services Starting...
echo ========================================
echo.
echo Backend API Gateway: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Please wait for services to initialize...
echo.

pause
