@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "out\index.html" (
  echo Building the static website...
  call npm run build:static
  if errorlevel 1 (
    echo Static build failed.
    pause
    exit /b 1
  )
)

start "" "http://127.0.0.1:4187"
call npm run serve:static
