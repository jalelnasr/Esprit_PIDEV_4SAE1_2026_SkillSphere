# Script de test du système de mailing
# Usage: .\test_mailing_system.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SYSTEME DE MAILING B2B" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8083/api/b2b/applications"

# Test 1: Vérifier que le backend est accessible
Write-Host "[1/3] Verification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method GET -ErrorAction Stop
    Write-Host "✅ Backend accessible sur port 8083" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible. Assurez-vous qu'il tourne sur port 8083" -ForegroundColor Red
    Write-Host "   Lancez: mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Envoyer un email ACCEPTED
Write-Host "[2/3] Test email ACCEPTED..." -ForegroundColor Yellow
$acceptedBody = @{
    candidateEmail = "aziz2guizeni@gmail.com"
    candidateName = "Jean Dupont"
    jobTitle = "Developpeur Full Stack"
    companyName = "TechCorp"
    status = "ACCEPTED"
    message = "Bienvenue dans notre equipe! Nous sommes ravis de vous accueillir."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/notify" -Method POST -Body $acceptedBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Email ACCEPTED envoye: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'envoi: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Envoyer un email REJECTED
Write-Host "[3/3] Test email REJECTED..." -ForegroundColor Yellow
$rejectedBody = @{
    candidateEmail = "aziz2guizeni@gmail.com"
    candidateName = "Marie Martin"
    jobTitle = "Data Analyst"
    companyName = "DataCorp"
    status = "REJECTED"
    message = "Merci pour votre candidature. Nous vous encourageons a postuler a nouveau."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/notify" -Method POST -Body $rejectedBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Email REJECTED envoye: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'envoi: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS TERMINES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifiez votre boite mail: aziz2guizeni@gmail.com" -ForegroundColor Yellow
Write-Host ""
