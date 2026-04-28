# ============================================
# SCRIPT DE PUSH B2B BACKEND
# ============================================
# Ce script va :
# 1. Cloner le repo
# 2. Créer la branche b2b
# 3. Copier UNIQUEMENT B2BModule
# 4. Commit et push

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSH B2B BACKEND - ÉTAPE 1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$REPO_URL = "https://github.com/jalehnan/Esprit_PIDEV_4SAE1_2026_SkillSphere.git"
$TEMP_DIR = "C:\Users\mouha\Desktop\skill\temp_b2b_backend"
$SOURCE_B2B = "C:\Users\mouha\Desktop\skill\B2BModule"

# Nettoyer le dossier temporaire s'il existe
if (Test-Path $TEMP_DIR) {
    Write-Host "🧹 Nettoyage du dossier temporaire..." -ForegroundColor Yellow
    Remove-Item -Path $TEMP_DIR -Recurse -Force
}

# Étape 1 : Cloner le repo
Write-Host ""
Write-Host "📥 ÉTAPE 1/5 : Clone du repository..." -ForegroundColor Green
git clone $REPO_URL $TEMP_DIR

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec du clone" -ForegroundColor Red
    exit 1
}

# Se déplacer dans le repo
Set-Location $TEMP_DIR

# Étape 2 : Créer la branche b2b
Write-Host ""
Write-Host "🌿 ÉTAPE 2/5 : Création de la branche b2b..." -ForegroundColor Green
git checkout -b b2b

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec de création de la branche" -ForegroundColor Red
    exit 1
}

# Étape 3 : Copier UNIQUEMENT B2BModule
Write-Host ""
Write-Host "📦 ÉTAPE 3/5 : Copie de B2BModule..." -ForegroundColor Green

# Vérifier que le dossier source existe
if (-not (Test-Path $SOURCE_B2B)) {
    Write-Host "❌ ERREUR : B2BModule introuvable à $SOURCE_B2B" -ForegroundColor Red
    exit 1
}

# Copier B2BModule
Copy-Item -Path $SOURCE_B2B -Destination ".\B2BModule" -Recurse -Force

Write-Host "✅ B2BModule copié avec succès" -ForegroundColor Green

# Étape 4 : Vérifier ce qui a été copié
Write-Host ""
Write-Host "📋 Fichiers copiés :" -ForegroundColor Cyan
Get-ChildItem -Path ".\B2BModule" -Recurse -File | Select-Object -First 10 | ForEach-Object {
    Write-Host "  - $($_.FullName.Replace($TEMP_DIR, ''))" -ForegroundColor Gray
}
Write-Host "  ... (et plus)" -ForegroundColor Gray

# Étape 5 : Git add, commit, push
Write-Host ""
Write-Host "💾 ÉTAPE 4/5 : Ajout des fichiers à Git..." -ForegroundColor Green
git add B2BModule/

Write-Host ""
Write-Host "📝 ÉTAPE 5/5 : Commit et push..." -ForegroundColor Green
git commit -m "feat: add B2BModule microservice for corporate training

- Add B2BModule microservice (port 8083)
- Configured with Eureka client for service discovery
- Integrated with auth-service via OpenFeign
- JWT authentication configured
- Email notification system included
- Ready for API Gateway integration"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec du commit" -ForegroundColor Red
    exit 1
}

# Push vers GitHub
Write-Host ""
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push origin b2b

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec du push" -ForegroundColor Red
    Write-Host "💡 Vous devrez peut-être vous authentifier avec GitHub" -ForegroundColor Yellow
    exit 1
}

# Succès !
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ SUCCÈS !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Aller sur GitHub : https://github.com/jalehnan/Esprit_PIDEV_4SAE1_2026_SkillSphere" -ForegroundColor White
Write-Host "  2. Créer une Pull Request de b2b vers main" -ForegroundColor White
Write-Host "  3. Merger la Pull Request" -ForegroundColor White
Write-Host "  4. Ensuite, on passera au frontend (branche b2b-front)" -ForegroundColor White
Write-Host ""
Write-Host "📂 Le repo cloné est dans : $TEMP_DIR" -ForegroundColor Gray
Write-Host ""

# Retourner au dossier d'origine
Set-Location "C:\Users\mouha\Desktop\skill"
