@echo off
echo ========================================
echo Starting Carbnb Production Environment
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
docker-compose up --build -d

echo.
echo ========================================
echo All services started in background.
echo ========================================
echo.
echo Access the application:
echo   Frontend: http://localhost
echo   API Gateway: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo To view logs: docker-compose logs -f
echo To stop all services: docker-compose down
echo.
pause

