@echo off
title NexTrade Quick Start
color 0B
echo ====================================
echo   NexTrade Quick Development Start
echo ====================================
echo.
echo This script starts NexTrade in development mode
echo (SQLite database for quick testing)
echo.

echo [1/3] Installing dependencies...
cd api && npm install
cd ..\frontend && npm install
cd ..\db && npm install

echo.
echo [2/3] Quick database setup (SQLite)...
cd ..\db
echo DATABASE_URL="file:./dev.db" > .env
npx prisma generate
npx prisma db push --accept-data-loss
npm run seed

echo.
echo [3/3] Starting servers...
echo.
echo Starting API server on port 3001...
start cmd /k "cd /d %~dp0api && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend on port 3000...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ====================================
echo   🚀 QUICK START COMPLETE!
echo ====================================
echo.
echo Frontend: http://localhost:3000
echo API: http://localhost:3001
echo Database: SQLite (dev.db)
echo.
echo Demo Login:
echo Email: demo@nextrade.com  
echo Password: demo123
echo.
pause