@echo off
REM ============================================================
REM   MXP Projektmanagement - Start
REM   Startet den lokalen Server und oeffnet die Web-App.
REM ============================================================
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py tools\server.py %*
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python tools\server.py %*
  goto :eof
)

echo.
echo   FEHLER: Python wurde nicht gefunden.
echo   Bitte installiere Python 3 von https://www.python.org/downloads/
echo   und aktiviere beim Setup die Option "Add Python to PATH".
echo.
pause
