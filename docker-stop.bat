@echo off
echo ========================================
echo Stopping Carbnb Services
echo ========================================
echo.

echo Stopping development services...
docker-compose -f docker-compose.dev.yml down

echo Stopping production services...
docker-compose down

echo.
echo ========================================
echo All services stopped.
echo ========================================
pause

