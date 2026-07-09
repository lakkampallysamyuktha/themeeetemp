@echo off
echo ==============================================
echo   Initializing Image Downloader and Optimizer
echo ==============================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0optimize_images.ps1"
echo.
echo Process complete. Press any key to exit...
pause > nul
