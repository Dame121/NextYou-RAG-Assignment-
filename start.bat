@echo off
:: Yoga RAG App - Start Script (Windows Batch)
:: Double-click to run or execute: start.bat

echo ========================================
echo   Yoga RAG Application Starter
echo ========================================
echo.

:: Start Backend in new window
echo Starting Backend Server...
start "Yoga Backend" cmd /k "cd /d %~dp0backend && npm start"

:: Wait for backend to initialize
timeout /t 5 /nobreak > nul

:: Start Frontend in new window
echo Starting Frontend (Streamlit)...
start "Yoga Frontend" cmd /k "cd /d %~dp0frontend && streamlit run app.py"

echo.
echo ========================================
echo   Application Started!
echo ========================================
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:8501
echo.
echo   Close the terminal windows to stop
echo ========================================
pause
