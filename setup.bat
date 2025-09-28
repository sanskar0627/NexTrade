@echo off
echo ====================================
echo   NexTrade Demo Setup Script
echo ====================================
echo.

echo Step 1: Starting PostgreSQL and Redis...
cd docker
docker-compose up -d
echo Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo Step 2: Installing API dependencies...
cd ..\api
npm install

echo.
echo Step 3: Installing DB dependencies...
cd ..\db
npm install

echo.
echo Step 4: Installing Frontend dependencies...
cd ..\frontend
npm install

echo.
echo Step 5: Setting up database...
cd ..\db
npx prisma generate
npx prisma db push
npm run db:seed

echo.
echo ====================================
echo   Setup Complete!
echo ====================================
echo.
echo To start the demo platform:
echo.
echo 1. Start API server:
echo    cd api && npm run dev
echo.
echo 2. Start Frontend (in new terminal):
echo    cd frontend && npm run dev
echo.
echo 3. Open browser to: http://localhost:3000
echo.
echo Demo login: demo@nextrade.com / demo123
echo Or create a new account with $5000 demo balance!
echo.
echo Press any key to exit...
pause > nul