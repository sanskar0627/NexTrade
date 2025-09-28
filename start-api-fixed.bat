@echo off
title Starting NexTrade API Server
cd /d "V:\NexTrade\api"
echo Starting API server from: %CD%
echo.
npx tsx watch src/index.ts
pause