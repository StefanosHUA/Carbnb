@echo off
echo ========================================
echo Starting Carbnb Development Environment
echo ========================================
echo.

echo Checking if Docker is running...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running. Starting services...
echo.

echo Building and starting all services...
docker-compose -f docker-compose.dev.yml up --build

echo.
echo ========================================
echo All services stopped.
echo ========================================
pause

