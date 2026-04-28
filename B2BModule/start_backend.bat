@echo off
REM Start B2B Module Backend
REM Port: 8083

cd /d "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"

echo ════════════════════════════════════════════════════════════
echo  B2B MODULE - Starting Backend
echo ════════════════════════════════════════════════════════════
echo.
echo Port: 8083
echo JAR: target/B2BModule-0.0.1-SNAPSHOT.jar
echo Java: %JAVA_HOME%\bin\java.exe
echo.

java -jar target/B2BModule-0.0.1-SNAPSHOT.jar

pause

