@echo off
title Fix NexTrade API Endpoints
color 0E
echo ====================================
echo   Fixing API Connection Issues
echo ====================================
echo.

echo [1/3] Stopping any running processes...
FOR /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
FOR /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

echo.
echo [2/3] Starting API server on port 3001...
cd api
start "NexTrade API" cmd /k "npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo [3/3] Starting Frontend on port 3000...
cd ..\frontend
start "NexTrade Frontend" cmd /k "npm run dev"

echo.
echo ====================================
echo   🚀 SERVERS STARTING!
echo ====================================
echo.
echo API Server: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Wait 10-15 seconds for both servers to fully start,
echo then visit: http://localhost:3000
echo.
echo If you still see 404 errors:
echo 1. Make sure both terminal windows show "ready"
echo 2. Check the API terminal for any errors
echo 3. Try refreshing the browser page
echo.
pause