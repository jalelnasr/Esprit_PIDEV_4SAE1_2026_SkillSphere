# Script de test rapide pour le système de mailing
# Exécution: powershell -ExecutionPolicy Bypass -File test_email_quick.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📧 TEST RAPIDE - SYSTÈME DE MAILING                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$backendUrl = "http://localhost:8083"
$apiEndpoint = "$backendUrl/api/b2b/applications/notify"

# Couleurs
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"
$infoColor = "Cyan"

# Étape 1 : Vérifier que le backend répond
Write-Host "[1/4] Vérification du backend..." -ForegroundColor $infoColor
try {
    $testResponse = Invoke-WebRequest -Uri "$backendUrl/api/b2b/applications" -Method GET -ErrorAction SilentlyContinue
    Write-Host "✅ Backend actif et répond (Status: $($testResponse.StatusCode))" -ForegroundColor $successColor
} catch {
    Write-Host "❌ ERREUR: Le backend n'est pas accessible!" -ForegroundColor $errorColor
    Write-Host "   Assurez-vous que :" -ForegroundColor $warningColor
    Write-Host "   1. Le projet est démarré dans IntelliJ (Shift + F10)" -ForegroundColor $warningColor
    Write-Host "   2. Les logs montrent 'Started B2bModuleApplication'" -ForegroundColor $warningColor
    Write-Host "   3. Le port 8083 est disponible" -ForegroundColor $warningColor
    Write-Host ""
    exit 1
}
Write-Host ""

# Étape 2 : Préparer les données
Write-Host "[2/4] Préparation du payload email..." -ForegroundColor $infoColor

$payload = @{
    candidateEmail = "aziz2guizeni@gmail.com"
    candidateName = "Ahmed Guizeni"
    jobTitle = "Développeur Senior"
    companyName = "MarketingPro"
    status = "ACCEPTED"
    message = "Bienvenue dans notre équipe! Nous sommes ravis de vous accueillir."
} | ConvertTo-Json

Write-Host "📊 Données à envoyer:" -ForegroundColor $infoColor
Write-Host $payload | Out-String
Write-Host ""

# Étape 3 : Envoyer l'email
Write-Host "[3/4] Envoi de l'email..." -ForegroundColor $infoColor
Write-Host "URL: $apiEndpoint" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $apiEndpoint `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -ErrorAction SilentlyContinue

    Write-Host "✅ EMAIL ENVOYÉ AVEC SUCCÈS!" -ForegroundColor $successColor
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor $successColor
    Write-Host ""
    Write-Host "📨 Réponse du serveur:" -ForegroundColor $infoColor
    Write-Host $response.Content | Out-String

} catch {
    Write-Host "❌ ERREUR lors de l'envoi!" -ForegroundColor $errorColor
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor $errorColor
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor $errorColor

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Détails: $($reader.ReadToEnd())" -ForegroundColor $errorColor
        $reader.Close()
    }
    Write-Host ""
    exit 1
}

# Étape 4 : Instructions de vérification
Write-Host "[4/4] Vérification dans Gmail..." -ForegroundColor $infoColor
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES :" -ForegroundColor $infoColor
Write-Host "  1. Ouvrir Gmail: https://mail.google.com" -ForegroundColor Gray
Write-Host "  2. Se connecter avec:" -ForegroundColor Gray
Write-Host "     Email: aziz2guizeni@gmail.com" -ForegroundColor Gray
Write-Host "     Mot de passe: dabwejwnyqaryees" -ForegroundColor Gray
Write-Host "  3. Chercher un email avec le sujet:" -ForegroundColor Gray
Write-Host "     '🎯 Application Update — Développeur Senior at MarketingPro'" -ForegroundColor Cyan
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ TEST TERMINÉ AVEC SUCCÈS!                             ║" -ForegroundColor Green
Write-Host "║  📧 L'email a été envoyé au serveur SMTP                  ║" -ForegroundColor Green
Write-Host "║  ⏳ Vérifiez Gmail dans 1-2 minutes                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

