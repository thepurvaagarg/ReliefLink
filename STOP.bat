@echo off
taskkill /FI "WINDOWTITLE eq ReliefLink - Smart Disaster Relief Coordination*" /T /F >nul 2>nul
taskkill /IM python.exe /FI "WINDOWTITLE eq ReliefLink - Smart Disaster Relief Coordination*" /T /F >nul 2>nul
echo ReliefLink server stopped (if it was running).
pause
