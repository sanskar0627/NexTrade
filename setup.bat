@echo off
title NexTrade Setup
color 0A
echo ====================================
echo   NexTrade Demo Setup Script v2.0
echo ====================================
echo.

echo [1/6] Starting PostgreSQL and Redis...
cd docker
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start Docker services. Please ensure Docker is running.
    pause
    exit /b 1
)
echo Waiting for services to initialize...
timeout /t 15 /nobreak > nul

echo.
echo [2/6] Installing API dependencies...
cd ..\api
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install API dependencies
    pause
    exit /b 1
)

echo.
echo [3/6] Installing DB dependencies...
cd ..\db
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install DB dependencies
    pause
    exit /b 1
)

echo.
echo [4/6] Installing Frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install Frontend dependencies
    pause
    exit /b 1
)

echo.
echo [5/6] Setting up database and seeding demo data...
cd ..\db
call npm run setup
if errorlevel 1 (
    echo ERROR: Database setup failed
    pause
    exit /b 1
)

echo.
echo [6/6] Final verification...
timeout /t 2 /nobreak > nul

echo.
echo ====================================
echo   🚀 SETUP COMPLETE! 
echo ====================================
echo.
echo 📋 QUICK START GUIDE:
echo.
echo 1. Start API Server (Terminal 1):
echo    cd api ^&^& npm run dev
echo.
echo 2. Start Frontend (Terminal 2):
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Open Browser:
echo    http://localhost:3000
echo.
echo 🎮 DEMO CREDENTIALS:
echo    Email: demo@nextrade.com
echo    Password: demo123
echo    Starting Balance: $5000 USDC
echo.
echo 🎯 FEATURES TO TRY:
echo    ✅ Live trading with real balance updates
echo    ✅ Auto-generated demo trades every 2-5 seconds
echo    ✅ Real-time order book and trade history
echo    ✅ Order placement and cancellation
echo    ✅ Portfolio tracking in top bar
echo.
echo Press any key to exit setup...
pause > nul