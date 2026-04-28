#!/usr/bin/env pwsh
# Script pour relancer le backend après le nettoyage

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   RELANCEMENT DU BACKEND B2B (Port 8083)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Arrêter tout processus Java existant
Write-Host "[1/4] Arrêt des processus Java existants..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      ✅ Processus arrêtés" -ForegroundColor Green
Write-Host ""

# 2. Nettoyer les caches Maven
Write-Host "[2/4] Nettoyage des caches Maven..." -ForegroundColor Yellow
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"
mvn clean -q
Write-Host "      ✅ Caches nettoyés" -ForegroundColor Green
Write-Host ""

# 3. Compiler le projet
Write-Host "[3/4] Compilation du projet..." -ForegroundColor Yellow
mvn compile -DskipTests -q
Write-Host "      ✅ Projet compilé avec succès" -ForegroundColor Green
Write-Host ""

# 4. Lancer le projet (en arrière-plan)
Write-Host "[4/4] Lancement du serveur Spring Boot..." -ForegroundColor Yellow
Write-Host "      (Attendez 2-3 minutes pour la démarrage complète)" -ForegroundColor Cyan
Write-Host ""

# Lancer Maven en mode background
Start-Process cmd.exe -ArgumentList "/c cd `"C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule`" && mvn spring-boot:run -q" -NoNewWindow

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ✅ SERVEUR EN COURS DE DÉMARRAGE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 URL: http://localhost:8083" -ForegroundColor Cyan
Write-Host "📚 Swagger UI: http://localhost:8083/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test rapide (après 2-3 minutes):" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File test_email_quick.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Attendez que le serveur soit complètement démarré avant de tester!" -ForegroundColor Cyan

