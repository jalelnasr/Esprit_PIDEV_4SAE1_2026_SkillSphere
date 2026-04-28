# Script complet de test des deux endpoints
# Exécution: powershell -ExecutionPolicy Bypass -File test_both_endpoints.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📧 TEST DES 2 ENDPOINTS - SYSTÈME DE MAILING             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$backendUrl = "http://localhost:8083"
$apiBase = "$backendUrl/api/b2b/applications"

# Fonction pour afficher les résultats
function Show-Result {
    param(
        [string]$title,
        [bool]$success,
        [string]$statusCode = "",
        [string]$message = ""
    )

    if ($success) {
        Write-Host "✅ $title" -ForegroundColor Green
        if ($statusCode) { Write-Host "   Status: $statusCode" -ForegroundColor Gray }
        if ($message) { Write-Host "   Message: $message" -ForegroundColor Gray }
    } else {
        Write-Host "❌ $title" -ForegroundColor Red
        if ($statusCode) { Write-Host "   Error: $statusCode" -ForegroundColor Gray }
        if ($message) { Write-Host "   Details: $message" -ForegroundColor Gray }
    }
}

# ============================================
# TEST 1: ENDPOINT POST /notify
# ============================================
Write-Host "TEST 1️⃣ : POST /api/b2b/applications/notify" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""

# Vérifier le backend
Write-Host "  ✓ Vérification du backend..." -ForegroundColor Gray
try {
    $healthCheck = Invoke-WebRequest -Uri "$backendUrl/api/b2b/applications" -Method GET -ErrorAction SilentlyContinue
    Write-Host "  ✅ Backend actif" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERREUR: Backend non accessible!" -ForegroundColor Red
    Write-Host "  Assurez-vous que le projet est démarré (Shift + F10)" -ForegroundColor Yellow
    exit 1
}

# Préparer le payload
$emailData = @{
    candidateEmail = "aziz2guizeni@gmail.com"
    candidateName = "Ahmed Guizeni"
    jobTitle = "Développeur Full Stack"
    companyName = "MarketingPro"
    status = "ACCEPTED"
    message = "Bienvenue dans notre équipe! Nous avons hâte de vous accueillir."
} | ConvertTo-Json

Write-Host ""
Write-Host "  📝 Envoi d'un email ACCEPTED..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$apiBase/notify" `
        -Method POST `
        -ContentType "application/json" `
        -Body $emailData `
        -ErrorAction SilentlyContinue

    Show-Result "Email ACCEPTED envoyé" $true $response.StatusCode
    Write-Host ""
    Write-Host "  📋 Réponse:" -ForegroundColor Gray
    Write-Host "  $($response.Content)" -ForegroundColor Gray

} catch {
    Show-Result "Email ACCEPTED" $false $($_.Exception.Response.StatusCode) $($_.Exception.Message)
    Write-Host ""
}

Write-Host ""
Write-Host "  📝 Envoi d'un email REJECTED..." -ForegroundColor Gray

# Préparer un email de rejet
$emailDataReject = @{
    candidateEmail = "test.candidate@example.com"
    candidateName = "Marie Martin"
    jobTitle = "Data Scientist"
    companyName = "TechInnovate"
    status = "REJECTED"
    message = "Merci pour votre candidature. Nous vous encourageons à postuler pour d'autres offres."
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$apiBase/notify" `
        -Method POST `
        -ContentType "application/json" `
        -Body $emailDataReject `
        -ErrorAction SilentlyContinue

    Show-Result "Email REJECTED envoyé" $true $response.StatusCode
    Write-Host ""
    Write-Host "  📋 Réponse:" -ForegroundColor Gray
    Write-Host "  $($response.Content)" -ForegroundColor Gray

} catch {
    Show-Result "Email REJECTED" $false $($_.Exception.Response.StatusCode) $($_.Exception.Message)
    Write-Host ""
}

Write-Host ""
Write-Host ""

# ============================================
# TEST 2: ENDPOINT PUT /status-notify
# ============================================
Write-Host "TEST 2️⃣ : PUT /api/b2b/applications/{id}/status-notify" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""

Write-Host "  ℹ️  Note: Cet endpoint met à jour le statut ET envoie un email" -ForegroundColor Gray
Write-Host ""

# Récupérer une application existante
Write-Host "  ✓ Récupération d'une application..." -ForegroundColor Gray

try {
    $appList = Invoke-WebRequest -Uri "$apiBase" -Method GET -ErrorAction SilentlyContinue | ConvertFrom-Json

    if ($appList -and ($appList | Measure-Object).Count -gt 0) {
        $applicationId = $appList[0].id
        Write-Host "  ✅ Application trouvée (ID: $applicationId)" -ForegroundColor Green
        Write-Host ""

        # Préparer l'update
        $updateData = @{
            candidateEmail = "candidate.update@example.com"
            candidateName = "Pierre Dupont"
            jobTitle = "Architecte Logiciel"
            companyName = "GlobalTech"
            status = "ACCEPTED"
            message = "Nous sommes heureux de vous offrir ce poste!"
        } | ConvertTo-Json

        Write-Host "  📝 Mise à jour du statut vers ACCEPTED..." -ForegroundColor Gray

        try {
            $response = Invoke-WebRequest -Uri "$apiBase/$applicationId/status-notify?status=ACCEPTED" `
                -Method PUT `
                -ContentType "application/json" `
                -Body $updateData `
                -ErrorAction SilentlyContinue

            Show-Result "Statut mis à jour et email envoyé" $true $response.StatusCode
            Write-Host ""
            Write-Host "  📋 Application mise à jour:" -ForegroundColor Gray
            $result = $response.Content | ConvertFrom-Json
            Write-Host "  ID: $($result.id), Statut: $($result.status)" -ForegroundColor Gray

        } catch {
            Show-Result "Mise à jour du statut" $false $($_.Exception.Response.StatusCode) $($_.Exception.Message)
        }

    } else {
        Write-Host "  ⚠️  Aucune application trouvée dans la base de données" -ForegroundColor Yellow
        Write-Host "  Créez d'abord une application via l'endpoint POST /api/b2b/applications" -ForegroundColor Gray
    }

} catch {
    Show-Result "Récupération des applications" $false "N/A" $($_.Exception.Message)
}

Write-Host ""
Write-Host ""

# ============================================
# RÉSUMÉ FINAL
# ============================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ TESTS COMPLÉTÉS                                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📧 VÉRIFICATION DES EMAILS REÇUS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Ouvrir Gmail:" -ForegroundColor Gray
Write-Host "     https://mail.google.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Se connecter avec:" -ForegroundColor Gray
Write-Host "     Email: aziz2guizeni@gmail.com" -ForegroundColor Cyan
Write-Host "     Mot de passe: dabwejwnyqaryees" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Chercher les emails avec les sujets:" -ForegroundColor Gray
Write-Host "     • '🎯 Application Update — Développeur Full Stack at MarketingPro'" -ForegroundColor Cyan
Write-Host "     • '🎯 Application Update — Data Scientist at TechInnovate'" -ForegroundColor Cyan
Write-Host "     • '🎯 Application Update — Architecte Logiciel at GlobalTech'" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Vérifier le HTML professionnel de chaque email" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ Les emails peuvent prendre 1-2 minutes pour arriver" -ForegroundColor Yellow
Write-Host ""

