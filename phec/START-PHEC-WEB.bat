@echo off
title PHEC Hospital Web Dashboard - Local Server
color 0A

echo ========================================
echo   PHEC Hospital Web Dashboard
echo   Version 1.8.4
echo ========================================
echo.
echo Starting local server...
echo This will open the dashboard in your browser.
echo.
echo IMPORTANT:
echo - The server will run on http://localhost:8080
echo - Keep this window open while using the dashboard
echo - Press Ctrl+C to stop the server when done
echo.
echo ========================================
echo.

REM Check if public folder exists
if not exist "public" (
    echo ERROR: 'public' folder not found!
    echo Please extract the full phec.zip contents first.
    echo.
    pause
    exit /b 1
)

REM Wait 2 seconds then open browser
timeout /t 2 /nobreak >nul
start http://localhost:8080/login-firebase.html

REM Start the web server using Node.js http-server
echo Starting web server...
echo.
cd public
npx --yes http-server -p 8080 -c-1

REM If npx fails, try alternative
if errorlevel 1 (
    echo.
    echo ========================================
    echo Alternative: Using Python HTTP Server
    echo ========================================
    echo.
    python -m http.server 8080
)

pause
