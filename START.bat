@echo off
setlocal
cd /d "%~dp0"
title ReliefLink - Smart Disaster Relief Coordination

echo.
echo ================================================
echo       RELIEFLINK - PYTHON 3.14 VERSION
echo ================================================
echo.

where py >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python Launcher ^(py^) was not found.
    echo Please make sure Python 3.14 is installed.
    pause
    exit /b 1
)

echo [1/4] Checking Python...
py -3.14 --version
if errorlevel 1 (
    echo [ERROR] Python 3.14 was not found.
    echo This version of ReliefLink is configured for Python 3.14.
    pause
    exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
    echo [2/4] Creating local Python 3.14 environment...
    py -3.14 -m venv .venv
    if errorlevel 1 goto :fail
) else (
    echo [2/4] Local Python environment already exists.
)

echo [3/4] Updating pip and installing compatible packages...
.venv\Scripts\python.exe -m pip install --disable-pip-version-check --upgrade pip setuptools wheel
if errorlevel 1 goto :fail

.venv\Scripts\python.exe -m pip install --disable-pip-version-check --only-binary=:all: -r requirements.txt
if errorlevel 1 goto :fail

echo [4/4] Starting ReliefLink...
echo Browser: http://127.0.0.1:8000
start "ReliefLink Browser" http://127.0.0.1:8000
.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000

:fail
echo.
echo [ERROR] ReliefLink could not start.
echo.
echo If this window shows a package error, copy the LAST 15-20 lines and send them here.
pause
exit /b 1
