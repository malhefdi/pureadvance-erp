@echo off
REM Pure Advance ERP — Windows Startup Script
REM Run this from the pureadvance-erp folder

echo.
echo  ============================================
echo   Pure Advance ERP — Offline Startup
echo  ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed.
    echo  Download from: https://nodejs.org
    echo  Install the LTS version, then run this script again.
    pause
    exit /b 1
)

echo  Node.js found: 
node --version
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo  Installing dependencies... (first time only, takes 2-3 min)
    call npm install
    if %errorlevel% neq 0 (
        echo  ERROR: npm install failed
        pause
        exit /b 1
    )
    echo  Done installing.
    echo.
)

REM Build if needed
if not exist ".next" (
    echo  Building production version... (first time only, takes 1-2 min)
    call npm run build
    if %errorlevel% neq 0 (
        echo  ERROR: build failed
        pause
        exit /b 1
    )
    echo  Build complete.
    echo.
)

echo  Starting Pure Advance ERP...
echo  Open http://localhost:3000 in your browser
echo.
echo  Press Ctrl+C to stop the server
echo.

REM Start the production server
call npm start
