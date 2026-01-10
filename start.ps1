# Yoga RAG App - Start Script (PowerShell)
# Run with: .\start.ps1

Write-Host "========================================"
Write-Host "  Yoga RAG Application Starter"
Write-Host "========================================"
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..."
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoRunning) {
    Write-Host "WARNING: MongoDB is not running. Please start MongoDB first."
}
else {
    Write-Host "MongoDB is running"
}

# Check if Ollama is running
Write-Host "Checking Ollama..."
$ollamaRunning = Get-Process ollama -ErrorAction SilentlyContinue
if (-not $ollamaRunning) {
    Write-Host "WARNING: Ollama is not running. Please start Ollama first."
}
else {
    Write-Host "Ollama is running"
}

Write-Host ""

# Kill existing processes on ports
Write-Host "Cleaning up existing processes..."
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend
Write-Host ""
Write-Host "Starting Backend Server..."
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend (Streamlit)..."
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; streamlit run app.py" -WindowStyle Normal

Write-Host ""
Write-Host "========================================"
Write-Host "  Application Started!"
Write-Host "========================================"
Write-Host ""
Write-Host "  Backend:  http://localhost:3000"
Write-Host "  Frontend: http://localhost:8501"
Write-Host ""
Write-Host "  Close the terminal windows to stop"
Write-Host "========================================"
