# generate-certs.ps1
# Generates a self-signed SSL certificate for local HTTPS development.
# Uses Docker to run OpenSSL -- no local OpenSSL installation required.

$certDir = Join-Path $PSScriptRoot "ssl"
if (-not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
}

Write-Host "Generating self-signed SSL certificate..." -ForegroundColor Cyan

docker run --rm `
    -v "${certDir}:/certs" `
    alpine/openssl req -x509 -nodes -days 365 `
        -newkey rsa:2048 `
        -keyout /certs/privkey.pem `
        -out /certs/fullchain.pem `
        -subj "/C=US/ST=Local/L=Local/O=ClipS Dev/CN=localhost" `
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Certificate generated successfully!" -ForegroundColor Green
    Write-Host "   - Certificate : ssl/fullchain.pem" -ForegroundColor Gray
    Write-Host "   - Private Key : ssl/privkey.pem" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To trust the cert in Chrome/Edge:" -ForegroundColor Yellow
    Write-Host "   Settings > Privacy > Security > Manage Certificates" -ForegroundColor Gray
    Write-Host "   Import ssl/fullchain.pem under Trusted Root Certification Authorities" -ForegroundColor Gray
} else {
    Write-Host "Failed to generate certificate. Is Docker running?" -ForegroundColor Red
    exit 1
}
