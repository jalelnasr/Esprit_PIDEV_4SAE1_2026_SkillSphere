@echo off
echo ========================================
echo   DEMARRAGE BACKEND + TEST MAILING
echo ========================================
echo.

echo [1/2] Demarrage du backend...
echo Cela peut prendre 30-60 secondes...
echo.

start "B2B Backend" cmd /k "mvn spring-boot:run"

echo Attente du demarrage du backend (60 secondes)...
timeout /t 60 /nobreak

echo.
echo [2/2] Lancement des tests...
echo.

powershell -ExecutionPolicy Bypass -File "test_mailing_system.ps1"

echo.
echo ========================================
echo   TERMINE!
echo ========================================
echo.
echo Verifiez votre boite mail: aziz2guizeni@gmail.com
echo.
pause
