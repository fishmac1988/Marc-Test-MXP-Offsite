@echo off
REM Erzeugt die read-only Offline-HTML der Prozesslandkarte und legt sie im
REM Teams-Ordner ab. Einfach doppelklicken, wenn ein aktueller Stand als
REM Offline-Kopie geteilt werden soll.
cd /d "%~dp0.."
py tools\export_html.py
if errorlevel 1 python tools\export_html.py
echo.
pause
