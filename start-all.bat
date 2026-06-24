@echo off
title Secure MERN Auth Portal Startup
echo ====================================================
echo      Starting MERN Auth & Forgot Password Module
echo ====================================================
echo.
echo Starting Backend Server in a new terminal...
start "Auth Backend Server" cmd /k "npm run backend"
echo.
echo Starting Frontend React Server in a new terminal...
start "Auth Frontend Server" cmd /k "npm run frontend"
echo.
echo ====================================================
echo Both servers are launching. You can close this window.
echo ====================================================
timeout /t 5
