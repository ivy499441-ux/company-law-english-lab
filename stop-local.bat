@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Stop Company Law Lab

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-local.ps1"
set "SITE_EXIT=%errorlevel%"
echo.
if "%SITE_EXIT%"=="0" (
  echo Done. You may close this window.
) else (
  echo The stop command could not finish safely.
)
pause
exit /b %SITE_EXIT%
