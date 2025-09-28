@echo off
title NexTrade Complete Setup & Start
color 0A
cls

echo =====================================
echo     NexTrade Complete Setup v3.0
echo =====================================
echo.
echo This script will:
echo 1. Install all dependencies
echo 2. Setup database with demo data
echo 3. Start API server (port 3001)
echo 4. Start Frontend (port 3000)
echo 5. Open browser automatically
echo.
pause

echo [1/8] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo [2/8] Installing API dependencies...
cd api
call npm install
if errorlevel 1 (
    echo ❌ ERROR: Failed to install API dependencies
    pause
    exit /b 1
)
echo ✅ API dependencies installed

echo.
echo [3/8] Installing Frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ ERROR: Failed to install Frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo [4/8] Installing Database utilities...
cd ..\db
call npm install
if errorlevel 1 (
    echo ❌ ERROR: Failed to install Database dependencies
    pause
    exit /b 1
)
echo ✅ Database utilities installed

echo.
echo [5/8] Setting up database with demo data...
call npx prisma generate
call npx prisma db push --force-reset
call npm run db:seed
if errorlevel 1 (
    echo ❌ ERROR: Database setup failed
    pause
    exit /b 1
)
echo ✅ Database setup complete

echo.
echo [6/8] Copying database to API directory...
cd ..
copy db\prisma\dev.db api\dev.db
copy db\prisma\schema.prisma api\prisma\schema.prisma
cd api
call npx prisma generate
echo ✅ API database setup complete

echo.
echo [7/8] Starting servers...
echo.
echo Starting API server on http://localhost:3001...
start "NexTrade API" cmd /k "echo 🚀 NexTrade API Server && echo. && npm run dev"

timeout /t 5 /nobreak > nul

echo Starting Frontend on http://localhost:3000...
cd ..\frontend
start "NexTrade Frontend" cmd /k "echo 🎯 NexTrade Frontend && echo. && npm run dev"

echo.
echo [8/8] Opening browser...
timeout /t 8 /nobreak > nul
start http://localhost:3000

echo.
echo =====================================
echo      🎉 SETUP COMPLETE! 
echo =====================================
echo.
echo Your NexTrade platform is now running:
echo.
echo 🌐 Frontend:  http://localhost:3000
echo 🚀 API:       http://localhost:3001
echo 🏥 Health:    http://localhost:3001/health
echo 📊 Tickers:   http://localhost:3001/api/v1/tickers
echo.
echo 🎮 Demo Login Credentials:
echo    Email:    demo@nextrade.com
echo    Password: demo123
echo    Balance:  $5000 USDC
echo.
echo 📋 Features Available:
echo    ✅ Real-time market data updates
echo    ✅ Live order book and trade history  
echo    ✅ Order placement and cancellation
echo    ✅ Portfolio tracking and balance updates
echo    ✅ Demo trade generator (auto-creates trades)
echo.
echo Both servers are running in separate windows.
echo Close this window or press Ctrl+C to exit setup.
echo.
pause
