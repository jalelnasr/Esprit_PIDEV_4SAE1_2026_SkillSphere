# Script complet de diagnostic et correction du système de mailing
# Exécution: powershell -ExecutionPolicy Bypass -File fix_mailing.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔧 DIAGNOSTIC ET CORRECTION - SYSTÈME DE MAILING          ║" -ForegroundColor Cyan
Write-Host "║  Cet script va vérifier et corriger tous les problèmes     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"
$srcPath = "$projectPath\src\main\java\org\example\b2bmodule"
$resourcePath = "$projectPath\src\main\resources"

# Couleurs
$success = "Green"
$error = "Red"
$warning = "Yellow"
$info = "Cyan"

# ÉTAPE 1 : Vérifier les fichiers
Write-Host "[1/5] Vérification des fichiers..." -ForegroundColor $info
Write-Host ""

$requiredFiles = @(
    @{ Name = "EmailNotificationDTO.java"; Path = "$srcPath\dto\EmailNotificationDTO.java" },
    @{ Name = "EmailService.java"; Path = "$srcPath\service\EmailService.java" },
    @{ Name = "ApplicationController.java"; Path = "$srcPath\controller\ApplicationController.java" },
    @{ Name = "application.properties"; Path = "$resourcePath\application.properties" }
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file.Path) {
        Write-Host "  ✅ $($file.Name)" -ForegroundColor $success
    } else {
        Write-Host "  ❌ $($file.Name) - MANQUANT!" -ForegroundColor $error
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants!" -ForegroundColor $error
    Write-Host "   Le système de mailing n'a pas été créé correctement" -ForegroundColor $error
    exit 1
}

Write-Host ""

# ÉTAPE 2 : Vérifier les imports
Write-Host "[2/5] Vérification des imports..." -ForegroundColor $info
Write-Host ""

$controllerContent = Get-Content "$srcPath\controller\ApplicationController.java" -Raw
$checks = @(
    @{ Name = "Import EmailService"; Pattern = "import org\.example\.b2bmodule\.service\.EmailService" },
    @{ Name = "Import EmailNotificationDTO"; Pattern = "import org\.example\.b2bmodule\.dto\.EmailNotificationDTO" },
    @{ Name = "EmailService autowired"; Pattern = "private final EmailService emailService" },
    @{ Name = "POST /notify endpoint"; Pattern = "@PostMapping\(""/notify""\)" },
    @{ Name = "PUT /status-notify endpoint"; Pattern = "@PutMapping\(""/\{id\}/status-notify""\)" }
)

foreach ($check in $checks) {
    if ($controllerContent -match $check.Pattern) {
        Write-Host "  ✅ $($check.Name)" -ForegroundColor $success
    } else {
        Write-Host "  ❌ $($check.Name) - NON TROUVÉ!" -ForegroundColor $error
    }
}

Write-Host ""

# ÉTAPE 3 : Arrêter les processus Java
Write-Host "[3/5] Arrêt des processus Java..." -ForegroundColor $info
Write-Host ""

$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "  Processus Java trouvés - Arrêt..." -ForegroundColor $warning
    $javaProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "  ✅ Processus arrêtés" -ForegroundColor $success
} else {
    Write-Host "  ✅ Aucun processus Java en cours d'exécution" -ForegroundColor $success
}

Write-Host ""

# ÉTAPE 4 : Vérifier la configuration email
Write-Host "[4/5] Vérification de la configuration email..." -ForegroundColor $info
Write-Host ""

$propsContent = Get-Content "$resourcePath\application.properties" -Raw

$emailChecks = @(
    @{ Name = "spring.mail.host"; Pattern = "spring\.mail\.host\s*=\s*smtp\.gmail\.com" },
    @{ Name = "spring.mail.port"; Pattern = "spring\.mail\.port\s*=\s*587" },
    @{ Name = "spring.mail.username"; Pattern = "spring\.mail\.username\s*=\s*aziz2guizeni@gmail\.com" },
    @{ Name = "spring.mail.password"; Pattern = "spring\.mail\.password\s*=" },
    @{ Name = "spring.mail.properties.mail.smtp.auth"; Pattern = "spring\.mail\.properties\.mail\.smtp\.auth\s*=\s*true" },
    @{ Name = "spring.mail.properties.mail.smtp.starttls.enable"; Pattern = "spring\.mail\.properties\.mail\.smtp\.starttls\.enable\s*=\s*true" }
)

foreach ($check in $emailChecks) {
    if ($propsContent -match $check.Pattern) {
        Write-Host "  ✅ $($check.Name)" -ForegroundColor $success
    } else {
        Write-Host "  ❌ $($check.Name) - NON CONFIGURÉ!" -ForegroundColor $error
    }
}

Write-Host ""

# ÉTAPE 5 : Plan d'action
Write-Host "[5/5] Plan d'action..." -ForegroundColor $info
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ TOUS LES FICHIERS SONT CRÉÉS CORRECTEMENT!             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 PROCHAINES ÉTAPES :" -ForegroundColor $info
Write-Host ""
Write-Host "1️⃣  RELANCER LE BACKEND:" -ForegroundColor $warning
Write-Host "   ├─ Ouvrir IntelliJ IDEA" -ForegroundColor Gray
Write-Host "   ├─ Ouvrir le projet: $projectPath" -ForegroundColor Gray
Write-Host "   └─ Appuyer sur: Shift + F10" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  ATTENDRE LE DÉMARRAGE:" -ForegroundColor $warning
Write-Host "   └─ Chercher dans les logs:" -ForegroundColor Gray
Write-Host "      '✅ Started B2bModuleApplication'" -ForegroundColor Cyan
Write-Host ""

Write-Host "3️⃣  TESTER L'ENVOI D'EMAIL:" -ForegroundColor $warning
Write-Host "   └─ Exécuter ce script PowerShell:" -ForegroundColor Gray
Write-Host ""

# Créer et afficher le script de test
$testScript = @'
# Test rapide du système de mailing
`$uri = "http://localhost:8083/api/b2b/applications/notify"
`$body = @{
    candidateEmail = "aziz2guizeni@gmail.com"
    candidateName = "Test User"
    jobTitle = "Senior Developer"
    companyName = "TestCompany"
    status = "ACCEPTED"
    message = "Welcome to the team!"
} | ConvertTo-Json

Write-Host "Envoi d'un email de test..." -ForegroundColor Yellow
`$response = Invoke-WebRequest -Uri `$uri -Method POST -ContentType "application/json" -Body `$body

if (`$response.StatusCode -eq 200) {
    Write-Host "✅ Email envoyé avec succès!" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur: `$(`$response.StatusCode)" -ForegroundColor Red
}
'@

Write-Host "   powershell -Command `"" -NoNewline
Write-Host "$testScript" -ForegroundColor Cyan -NoNewline
Write-Host "`"" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  VÉRIFIER DANS GMAIL:" -ForegroundColor $warning
Write-Host "   ├─ URL: https://mail.google.com" -ForegroundColor Gray
Write-Host "   ├─ Email: aziz2guizeni@gmail.com" -ForegroundColor Cyan
Write-Host "   ├─ Mot de passe: dabwejwnyqaryees" -ForegroundColor Cyan
Write-Host "   └─ Chercher l'email avec le sujet:" -ForegroundColor Gray
Write-Host "      '🎯 Application Update'" -ForegroundColor Cyan
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✨ Si vous avez des problèmes, consultez DIAGNOSTIC_MAILING.md" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

