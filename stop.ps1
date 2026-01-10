# Yoga RAG App - Stop Script (PowerShell)
# Run with: .\stop.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🛑 Stopping Yoga RAG Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop Node.js processes
Write-Host "Stopping Backend (Node.js)..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Backend stopped" -ForegroundColor Green

# Stop Streamlit processes
Write-Host "Stopping Frontend (Streamlit)..." -ForegroundColor Yellow
Get-Process -Name streamlit -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Frontend stopped" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ All services stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
