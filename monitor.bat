@echo off
title NexTrade Status Monitor
color 0E

:monitor_loop
cls
echo ====================================
echo   NexTrade Performance Monitor
echo ====================================
echo.

echo Checking API Server (Port 3000)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/v1/tickers' -TimeoutSec 5; Write-Host '✅ API Server: ONLINE' -ForegroundColor Green; $response.StatusCode } catch { Write-Host '❌ API Server: OFFLINE' -ForegroundColor Red }"

echo.
echo Checking Frontend (Port 3000)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5; Write-Host '✅ Frontend: ONLINE' -ForegroundColor Green; $response.StatusCode } catch { Write-Host '❌ Frontend: OFFLINE' -ForegroundColor Red }"

echo.
echo Checking Database Connection...
docker ps --filter "name=docker_postgres_1" --format "table {{.Names}}\t{{.Status}}" 2>nul || echo ❌ PostgreSQL: Not running

echo.
echo Checking Redis Connection...
docker ps --filter "name=docker_redis_1" --format "table {{.Names}}\t{{.Status}}" 2>nul || echo ❌ Redis: Not running

echo.
echo ====================================
echo Press 'R' to refresh or 'Q' to quit
echo Auto-refresh in 10 seconds...
echo ====================================

timeout /t 10 >nul 2>&1
if errorlevel 1 (
    choice /c RQ /n /t 1 /d R > nul
    if errorlevel 2 goto :eof
)

goto monitor_loop