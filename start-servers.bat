@echo off
echo Starting Resume Sharing Platform...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm install && npm start"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm install && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:4200
echo.
echo Press any key to close this window...
pause > nul 