@echo off
echo ========================================
echo Creating session_enrollments table
echo ========================================
echo.

REM Check if MySQL is accessible
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not accessible from command line
    echo Please ensure MySQL is installed and added to PATH
    echo.
    echo Alternative: Run this SQL manually in MySQL Workbench or phpMyAdmin
    echo SQL file: create_session_enrollments_table.sql
    pause
    exit /b 1
)

echo MySQL found. Attempting to create table...
echo.
echo Please enter your MySQL root password when prompted:
mysql -u root -p skillsphere < create_session_enrollments_table.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: Table created successfully!
    echo ========================================
    echo.
    echo Verifying table creation...
    mysql -u root -p -e "USE skillsphere; SHOW TABLES LIKE 'session_enrollments'; DESCRIBE session_enrollments;"
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to create table
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database 'skillsphere' exists
    echo 3. You have the correct password
    echo.
    echo You can also run the SQL manually:
    echo - Open MySQL Workbench or phpMyAdmin
    echo - Connect to 'skillsphere' database
    echo - Execute the contents of create_session_enrollments_table.sql
)

echo.
pause
