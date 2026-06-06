@echo off
REM Deploy both frontend and backend to Cloudflare
REM Usage: deploy.bat [environment]

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "!ENVIRONMENT!"=="" set ENVIRONMENT=production

echo 🚀 Starting Warung RMB Deployment to Cloudflare (!ENVIRONMENT!)
echo.

REM Check for required tools
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Wrangler CLI not found. Install it with: npm install -g @cloudflare/wrangler
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)

REM Deploy Backend
echo 📦 Deploying Backend (Workers)...
cd backend
call npm install
call npm run deploy
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend deployment failed
    exit /b 1
)
echo ✅ Backend deployed successfully
echo.

REM Deploy Frontend
echo 📱 Deploying Frontend (Pages)...
cd ..\frontend
call npm install
call npm run deploy
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend deployment failed
    exit /b 1
)
echo ✅ Frontend deployed successfully
echo.

echo ✨ Deployment complete!
echo.
echo Frontend: https://warung-rmb.com
echo Backend:  https://api.warung-rmb.com
echo.
echo Test the API: curl https://api.warung-rmb.com/api/health

cd ..
