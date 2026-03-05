# ========================================
# TEST SCRIPT - Email Notification System
# ========================================
# PowerShell version pour Windows
# Ce script teste les 2 nouveaux endpoints d'email notification

$API_BASE_URL = "http://localhost:8083/api/b2b/applications"
$CANDIDATE_EMAIL = "aziz2guizeni@gmail.com"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📧 Email Notification System - Test Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# TEST 1: Envoyer un email ACCEPTED
# ========================================
Write-Host "🧪 TEST 1: POST /api/b2b/applications/notify (ACCEPTED)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$body1 = @{
    candidateEmail = $CANDIDATE_EMAIL
    candidateName = "Test User Accepted"
    jobTitle = "Senior Backend Developer"
    companyName = "TechCorp International"
    status = "ACCEPTED"
    message = "Nous sommes ravis de vous accueillir dans notre équipe! Votre profil nous a beaucoup impressionnés."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/notify" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body1 `
        -TimeoutSec 10

    Write-Host "✅ Succès!" -ForegroundColor Green
    Write-Host "Réponse: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Si vous avez reçu un email avec un design VERT et un checkmark ✅, le test 1 a réussi!" -ForegroundColor Green
Write-Host ""

# ========================================
# TEST 2: Envoyer un email REJECTED
# ========================================
Write-Host "🧪 TEST 2: POST /api/b2b/applications/notify (REJECTED)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$body2 = @{
    candidateEmail = $CANDIDATE_EMAIL
    candidateName = "Test User Rejected"
    jobTitle = "Data Scientist"
    companyName = "DataFlow Solutions"
    status = "REJECTED"
    message = "Merci pour votre candidature. Nous vous encourageons à postuler pour les futures opportunités."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/notify" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body2 `
        -TimeoutSec 10

    Write-Host "✅ Succès!" -ForegroundColor Green
    Write-Host "Réponse: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Si vous avez reçu un email avec un design GRIS et une icône 📋, le test 2 a réussi!" -ForegroundColor Green
Write-Host ""

# ========================================
# TEST 3: Envoyer un email SANS message personnel
# ========================================
Write-Host "🧪 TEST 3: POST /api/b2b/applications/notify (Sans message personnel)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$body3 = @{
    candidateEmail = $CANDIDATE_EMAIL
    candidateName = "Test User No Message"
    jobTitle = "Frontend Developer"
    companyName = "WebStudio Pro"
    status = "ACCEPTED"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/notify" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body3 `
        -TimeoutSec 10

    Write-Host "✅ Succès!" -ForegroundColor Green
    Write-Host "Réponse: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Si vous avez reçu un email SANS bloc 'Message from HR Team:', le test 3 a réussi!" -ForegroundColor Green
Write-Host ""

# ========================================
# TEST 4: GET toutes les applications
# ========================================
Write-Host "🧪 TEST 4: GET /api/b2b/applications (Récupérer les IDs)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$API_BASE_URL" `
        -Method GET `
        -ContentType "application/json" `
        -TimeoutSec 10

    Write-Host "✅ Succès! Nombre d'applications: $($response.Count)" -ForegroundColor Green

    if ($response.Count -gt 0) {
        Write-Host "Première application:" -ForegroundColor Green
        Write-Host "ID: $($response[0].id)" -ForegroundColor Green
        Write-Host "Candidate: $($response[0].candidate.name)" -ForegroundColor Green
        Write-Host "Job: $($response[0].jobOffer.title)" -ForegroundColor Green
        Write-Host "Status: $($response[0].status)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "⚠️  IMPORTANT: Pour le TEST 5, vous devez avoir une application dans la base de données." -ForegroundColor Yellow
Write-Host "Utilisez l'ID de l'application pour le test suivant." -ForegroundColor Yellow
Write-Host ""

# ========================================
# TEST 5: PUT /{id}/status-notify
# ========================================
Write-Host "🧪 TEST 5: PUT /api/b2b/applications/{id}/status-notify" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  INSTRUCTION:" -ForegroundColor Yellow
Write-Host "1. Modifiez le script et remplacez APPLICATION_ID par l'ID d'une vraie application" -ForegroundColor Yellow
Write-Host "2. Remplacez CANDIDATE_EMAIL par un email valide de la base de données" -ForegroundColor Yellow
Write-Host ""

$body5 = @{
    candidateEmail = "candidate@example.com"
    candidateName = "John Doe"
    jobTitle = "Senior Developer"
    companyName = "TechCorp"
    status = "ACCEPTED"
    message = "Bienvenue!"
} | ConvertTo-Json

Write-Host "Exemple de commande à exécuter (modifiez l'ID) :" -ForegroundColor Cyan
Write-Host ""
Write-Host '$body = @{' -ForegroundColor Cyan
Write-Host '    candidateEmail = "candidate@example.com"' -ForegroundColor Cyan
Write-Host '    candidateName = "John Doe"' -ForegroundColor Cyan
Write-Host '    jobTitle = "Senior Developer"' -ForegroundColor Cyan
Write-Host '    companyName = "TechCorp"' -ForegroundColor Cyan
Write-Host '    status = "ACCEPTED"' -ForegroundColor Cyan
Write-Host '    message = "Bienvenue!"' -ForegroundColor Cyan
Write-Host '} | ConvertTo-Json' -ForegroundColor Cyan
Write-Host ""
Write-Host 'Invoke-RestMethod -Uri "http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED" -Method PUT -ContentType "application/json" -Body $body' -ForegroundColor Cyan
Write-Host ""

# ========================================
# RÉSUMÉ DES TESTS
# ========================================
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ TEST 1 - POST /notify (ACCEPTED)" -ForegroundColor Green
Write-Host "   Envoie un email vert avec checkmark" -ForegroundColor Green
Write-Host ""
Write-Host "✅ TEST 2 - POST /notify (REJECTED)" -ForegroundColor Green
Write-Host "   Envoie un email gris avec icône" -ForegroundColor Green
Write-Host ""
Write-Host "✅ TEST 3 - POST /notify (Sans message personnel)" -ForegroundColor Green
Write-Host "   Bloc HR Message n'apparaît pas" -ForegroundColor Green
Write-Host ""
Write-Host "✅ TEST 4 - GET /applications" -ForegroundColor Green
Write-Host "   Récupère les applications existantes" -ForegroundColor Green
Write-Host ""
Write-Host "✅ TEST 5 - PUT /{id}/status-notify" -ForegroundColor Green
Write-Host "   Mettre à jour le statut + envoyer l'email" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Si tous les tests passent, le système est opérationnel!" -ForegroundColor Green
Write-Host ""


