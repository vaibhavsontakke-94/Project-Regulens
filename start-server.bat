@echo off
cd "C:\Users\vaibh\Documents\Project Regulens"
echo Starting ReguLens server...
node --env-file=.env server.js
echo.
echo Server running at http://localhost:3000
pause