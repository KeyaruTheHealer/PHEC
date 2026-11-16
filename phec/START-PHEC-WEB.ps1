# ========================================
# PHEC Hospital Web Dashboard - Local Server
# Version 1.8.4
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  PHEC Hospital Web Dashboard" -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "  Version 1.8.4 - Local Server" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if public folder exists
if (-not (Test-Path "public")) {
    Write-Host "❌ ERROR: 'public' folder not found!" -ForegroundColor Red
    Write-Host "Please extract the full phec.zip contents first.`n" -ForegroundColor Yellow
    pause
    exit 1
}

$publicDir = Join-Path $PSScriptRoot "public"

Write-Host "📂 Server root: $publicDir" -ForegroundColor Green
Write-Host "🌐 Starting server on: http://localhost:8080`n" -ForegroundColor Green

Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "- Keep this window open while using the dashboard" -ForegroundColor White
Write-Host "- Press Ctrl+C to stop the server when done`n" -ForegroundColor White

Write-Host "========================================`n" -ForegroundColor Cyan

# Wait 2 seconds then open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:8080/login-firebase.html"

Write-Host "⚡ Server is running..." -ForegroundColor Green
Write-Host "   Dashboard: http://localhost:8080/login-firebase.html`n" -ForegroundColor Cyan

# Try to start server with npx http-server first
try {
    Set-Location $PSScriptRoot
    & npx --yes http-server public -p 8080 -c-1
} catch {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "Alternative: Using Python HTTP Server" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
    
    Set-Location $publicDir
    python -m http.server 8080
}
