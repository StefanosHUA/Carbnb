@echo off
echo Starting Backend...
cd /d "e:\car-rental-backend-v2"
if not exist "package.json" (
    echo Backend repository not found at e:\car-rental-backend-v2
    echo Please clone it first:
    echo git clone https://github.com/Moirotsos/car-rental-backend-v2.git e:\car-rental-backend-v2
    pause
    exit /b 1
)
npm start
pause
