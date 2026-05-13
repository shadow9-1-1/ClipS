# Quick Start Script for ClipS Docker Environment (Windows PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ClipS Docker Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker installation
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example -Destination .env
    Write-Host "✅ .env file created. Please review and update sensitive values." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to become healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ ClipS is running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend:     http://localhost" -ForegroundColor White
Write-Host "  📡 Backend API:  http://localhost/api" -ForegroundColor White
Write-Host "  📚 API Docs:     http://localhost/api-docs" -ForegroundColor White
Write-Host "  🪣 MinIO:        http://localhost/minio" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "Stop services:" -ForegroundColor Cyan
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
