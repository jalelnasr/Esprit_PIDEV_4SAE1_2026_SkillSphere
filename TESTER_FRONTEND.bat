@echo off
echo ========================================
echo    TESTS FRONTEND ANGULAR
echo ========================================
echo.
echo Choisissez une option:
echo.
echo 1. Tests rapides (headless)
echo 2. Tests avec navigateur (interactif)
echo 3. Tests avec couverture de code
echo 4. Voir le rapport de couverture
echo 5. Quitter
echo.
set /p choice="Votre choix (1-5): "

if "%choice%"=="1" (
    echo.
    echo Execution des tests en mode headless...
    call ng test --watch=false --browsers=ChromeHeadless
    pause
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo Execution des tests avec navigateur...
    call ng test
    goto end
)

if "%choice%"=="3" (
    echo.
    echo Execution des tests avec couverture...
    call ng test --watch=false --code-coverage --browsers=ChromeHeadless
    echo.
    echo Rapport genere dans: coverage/index.html
    pause
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo Ouverture du rapport de couverture...
    start coverage/index.html
    pause
    goto menu
)

if "%choice%"=="5" (
    goto end
)

echo Choix invalide!
pause
goto menu

:menu
cls
goto start

:end
