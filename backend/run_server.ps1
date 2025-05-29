# PowerShell script to run the FastAPI server

Write-Host "Starting Admin Portal Backend..." -ForegroundColor Green
Write-Host ""

# Set Python path
$env:PYTHONPATH = $PWD
Write-Host "PYTHONPATH set to: $env:PYTHONPATH" -ForegroundColor Yellow
Write-Host ""

# Show current directory and Python version
Write-Host "Current directory: $PWD" -ForegroundColor Cyan
python --version
Write-Host ""

# Run diagnostics
Write-Host "Running diagnostics..." -ForegroundColor Yellow
python diagnose.py
Write-Host ""
Write-Host "Press any key to continue with server startup..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Run the server
Write-Host "Running FastAPI server on http://localhost:8000" -ForegroundColor Green
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000