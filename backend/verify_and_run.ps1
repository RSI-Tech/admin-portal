# PowerShell script to verify files and run server

Write-Host "=== Verifying Backend Setup ===" -ForegroundColor Green
Write-Host ""

# Navigate to backend
Set-Location -Path "backend"

# Check files
Write-Host "Checking required files..." -ForegroundColor Yellow
python check_files.py

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Run the server
Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Green
.\run_server.ps1