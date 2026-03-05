# Script pour arrêter les processus Java et préparer le redémarrage
# Exécution: powershell -ExecutionPolicy Bypass -File stop_and_clean.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║  🛑 ARRÊT DES PROCESSUS JAVA                              ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

# Étape 1 : Arrêter tous les processus Java
Write-Host "[1/3] Recherche des processus Java..." -ForegroundColor Yellow
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue

if ($javaProcesses) {
    Write-Host "   Processus Java trouvés:" -ForegroundColor Yellow
    $javaProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id), Nom: $($_.ProcessName), Mémoire: $([math]::Round($_.WorkingSet / 1MB, 2)) MB" -ForegroundColor Gray
    }
    Write-Host ""

    Write-Host "[2/3] Arrêt des processus..." -ForegroundColor Yellow
    $javaProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Processus Java arrêtés" -ForegroundColor Green
} else {
    Write-Host "✅ Aucun processus Java en cours d'exécution" -ForegroundColor Green
}
Write-Host ""

# Étape 2 : Attendre que le port se libère
Write-Host "[3/3] Attente de la libération du port 8083..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Vérifier que le port est libre
$portCheck = netstat -ano 2>$null | Select-String ":8083" -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "⚠️  Le port 8083 est encore en cours de libération..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "✅ Port 8083 libéré" -ForegroundColor Green
}
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ NETTOYAGE TERMINÉ!                                    ║" -ForegroundColor Green
Write-Host "║  🚀 Vous pouvez maintenant lancer le backend              ║" -ForegroundColor Green
Write-Host "║  💡 Appuyez sur Shift + F10 dans IntelliJ                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

