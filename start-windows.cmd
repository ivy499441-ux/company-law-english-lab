@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Company Law Lab v3.1.4

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-local.ps1"
set "SITE_EXIT=%errorlevel%"

if not "%SITE_EXIT%"=="0" (
  echo.
  echo Startup did not complete. See startup-log.txt in this folder.
  echo Please send that file if the message there is not clear.
  pause
)

exit /b %SITE_EXIT%
