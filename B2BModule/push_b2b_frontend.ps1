# ============================================
# SCRIPT DE PUSH B2B FRONTEND
# ============================================
# Ce script va :
# 1. Mettre à jour le repo local avec le main
# 2. Créer la branche b2b-front
# 3. Copier le frontend avec la structure correcte
# 4. Commit et push

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSH B2B FRONTEND - ÉTAPE 2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$TEMP_DIR = "C:\Users\mouha\Desktop\skill\temp_b2b_backend"
$SOURCE_FRONTEND = "C:\Users\mouha\Desktop\skill\PI_4eme-Template"

# Vérifier que le repo existe
if (-not (Test-Path $TEMP_DIR)) {
    Write-Host "❌ ERREUR : Le repo n'existe pas à $TEMP_DIR" -ForegroundColor Red
    Write-Host "💡 Exécutez d'abord push_b2b_backend.ps1" -ForegroundColor Yellow
    exit 1
}

# Se déplacer dans le repo
Set-Location $TEMP_DIR

# Étape 1 : Mettre à jour avec le main
Write-Host ""
Write-Host "🔄 ÉTAPE 1/6 : Mise à jour avec le main..." -ForegroundColor Green
git checkout main
git pull origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec de la mise à jour" -ForegroundColor Red
    exit 1
}

# Étape 2 : Créer la branche b2b-front
Write-Host ""
Write-Host "🌿 ÉTAPE 2/6 : Création de la branche b2b-front..." -ForegroundColor Green
git checkout -b b2b-front

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec de création de la branche" -ForegroundColor Red
    exit 1
}

# Étape 3 : Vérifier la structure actuelle dans main
Write-Host ""
Write-Host "📋 ÉTAPE 3/6 : Vérification de la structure existante..." -ForegroundColor Green

if (Test-Path ".\PI_4eme-Template") {
    Write-Host "✅ Dossier PI_4eme-Template existe déjà dans le repo" -ForegroundColor Green
    
    if (Test-Path ".\PI_4eme-Template\Platforme") {
        Write-Host "✅ Structure correcte : PI_4eme-Template/Platforme/" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Attention : Platforme/ n'existe pas encore" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  PI_4eme-Template n'existe pas encore, on va le créer" -ForegroundColor Yellow
}

# Étape 4 : Copier le frontend avec la structure correcte
Write-Host ""
Write-Host "📦 ÉTAPE 4/6 : Copie du frontend..." -ForegroundColor Green

# Vérifier que le dossier source existe
if (-not (Test-Path $SOURCE_FRONTEND)) {
    Write-Host "❌ ERREUR : Frontend introuvable à $SOURCE_FRONTEND" -ForegroundColor Red
    exit 1
}

# Vérifier la structure du source
Write-Host "📂 Structure du source :" -ForegroundColor Cyan
Get-ChildItem -Path $SOURCE_FRONTEND -Directory | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

# Créer le dossier PI_4eme-Template s'il n'existe pas
if (-not (Test-Path ".\PI_4eme-Template")) {
    New-Item -ItemType Directory -Path ".\PI_4eme-Template" -Force | Out-Null
}

# Copier le contenu
# Si le source a déjà Platforme/, on copie tout
# Sinon, on copie le contenu dans Platforme/
if (Test-Path "$SOURCE_FRONTEND\Platforme") {
    Write-Host "✅ Copie de $SOURCE_FRONTEND\Platforme vers .\PI_4eme-Template\Platforme" -ForegroundColor Green
    Copy-Item -Path "$SOURCE_FRONTEND\Platforme" -Destination ".\PI_4eme-Template\Platforme" -Recurse -Force
} elseif (Test-Path "$SOURCE_FRONTEND\PI_4eme-Template\Platforme") {
    Write-Host "✅ Copie de $SOURCE_FRONTEND\PI_4eme-Template\Platforme vers .\PI_4eme-Template\Platforme" -ForegroundColor Green
    Copy-Item -Path "$SOURCE_FRONTEND\PI_4eme-Template\Platforme" -Destination ".\PI_4eme-Template\Platforme" -Recurse -Force
} else {
    Write-Host "⚠️  Structure non standard détectée, copie du contenu complet" -ForegroundColor Yellow
    Copy-Item -Path "$SOURCE_FRONTEND\*" -Destination ".\PI_4eme-Template\" -Recurse -Force
}

Write-Host "✅ Frontend copié avec succès" -ForegroundColor Green

# Étape 5 : Vérifier la structure finale
Write-Host ""
Write-Host "📋 ÉTAPE 5/6 : Vérification de la structure finale..." -ForegroundColor Green
Write-Host "Structure créée :" -ForegroundColor Cyan

if (Test-Path ".\PI_4eme-Template\Platforme") {
    Write-Host "  ✅ PI_4eme-Template/Platforme/ (CORRECT)" -ForegroundColor Green
    Get-ChildItem -Path ".\PI_4eme-Template\Platforme" -Directory | Select-Object -First 5 | ForEach-Object {
        Write-Host "     - $($_.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ Structure incorrecte détectée !" -ForegroundColor Red
    Write-Host "  Structure actuelle :" -ForegroundColor Yellow
    Get-ChildItem -Path ".\PI_4eme-Template" -Directory | ForEach-Object {
        Write-Host "     - $($_.Name)" -ForegroundColor Gray
    }
}

# Étape 6 : Git add, commit, push
Write-Host ""
Write-Host "💾 ÉTAPE 6/6 : Ajout des fichiers à Git..." -ForegroundColor Green
git add PI_4eme-Template/

Write-Host ""
Write-Host "📝 Commit..." -ForegroundColor Green
git commit -m "feat: add B2B frontend integration

- Add B2B corporate training frontend
- Integrated with B2BModule backend
- Company management interface
- Training request system
- Mission and candidate management
- Ready for merge with team's frontend"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec du commit" -ForegroundColor Red
    exit 1
}

# Push vers GitHub
Write-Host ""
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push origin b2b-front

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Échec du push" -ForegroundColor Red
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
Write-Host "  2. Créer une Pull Request de b2b-front vers main" -ForegroundColor White
Write-Host "  3. Résoudre les conflits avec le frontend de vos amis" -ForegroundColor White
Write-Host "  4. Merger la Pull Request" -ForegroundColor White
Write-Host ""
Write-Host "🎉 INTÉGRATION COMPLÈTE !" -ForegroundColor Green
Write-Host ""

# Retourner au dossier d'origine
Set-Location "C:\Users\mouha\Desktop\skill"
