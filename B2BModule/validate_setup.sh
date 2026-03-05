#!/bin/bash

# ============================================
# VALIDATION SCRIPT - Email Notification Setup
# ============================================
# This script verifies that all files have been created correctly

echo "============================================"
echo "🔍 VALIDATING EMAIL NOTIFICATION SETUP"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Helper function
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
    else
        echo -e "${RED}❌${NC} $description"
        echo "   File not found: $file"
        ERRORS=$((ERRORS + 1))
    fi
}

check_content() {
    local file=$1
    local pattern=$2
    local description=$3

    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
    else
        echo -e "${RED}❌${NC} $description"
        echo "   Pattern not found in: $file"
        ERRORS=$((ERRORS + 1))
    fi
}

# Base path
BASE_PATH="$(pwd)"

echo "📂 Checking Core Files..."
echo ""

# Check Java files
check_file "$BASE_PATH/src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java" "EmailNotificationDTO.java exists"
check_file "$BASE_PATH/src/main/java/org/example/b2bmodule/service/EmailService.java" "EmailService.java exists"
check_file "$BASE_PATH/src/main/java/org/example/b2bmodule/controller/ApplicationController.java" "ApplicationController.java exists"

echo ""
echo "📝 Checking pom.xml..."
echo ""

check_content "$BASE_PATH/pom.xml" "spring-boot-starter-mail" "Mail dependency in pom.xml"

echo ""
echo "⚙️  Checking application.properties..."
echo ""

check_content "$BASE_PATH/src/main/resources/application.properties" "spring.mail.host" "Mail host configured"
check_content "$BASE_PATH/src/main/resources/application.properties" "smtp.gmail.com" "Gmail SMTP configured"
check_content "$BASE_PATH/src/main/resources/application.properties" "spring.mail.port" "Mail port configured"
check_content "$BASE_PATH/src/main/resources/application.properties" "spring.mail.username" "Mail username configured"
check_content "$BASE_PATH/src/main/resources/application.properties" "spring.mail.password" "Mail password configured"

echo ""
echo "📚 Checking Documentation Files..."
echo ""

check_file "$BASE_PATH/EMAIL_NOTIFICATION_IMPLEMENTATION.md" "Implementation guide"
check_file "$BASE_PATH/IMPLEMENTATION_SUMMARY.md" "Implementation summary"
check_file "$BASE_PATH/ANGULAR_FRONTEND_EXAMPLE.ts" "Angular frontend example"
check_file "$BASE_PATH/SECURITY_CREDENTIALS.md" "Security guide"
check_file "$BASE_PATH/test_email_endpoints.sh" "Test script"
check_file "$BASE_PATH/Postman_Collection.json" "Postman collection"

echo ""
echo "🔍 Checking Code Content..."
echo ""

check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java" "candidateEmail" "EmailNotificationDTO has candidateEmail field"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java" "candidateName" "EmailNotificationDTO has candidateName field"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java" "jobTitle" "EmailNotificationDTO has jobTitle field"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java" "companyName" "EmailNotificationDTO has companyName field"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java" "status" "EmailNotificationDTO has status field"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java" "message" "EmailNotificationDTO has message field"

echo ""
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/service/EmailService.java" "JavaMailSender" "EmailService has JavaMailSender"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/service/EmailService.java" "sendApplicationNotification" "EmailService has sendApplicationNotification method"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/service/EmailService.java" "MimeMessage" "EmailService uses MimeMessage"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/service/EmailService.java" "HTML" "EmailService sends HTML emails"

echo ""
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/controller/ApplicationController.java" "EmailService" "ApplicationController has EmailService"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/controller/ApplicationController.java" "/notify" "ApplicationController has /notify endpoint"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/controller/ApplicationController.java" "/status-notify" "ApplicationController has /status-notify endpoint"
check_content "$BASE_PATH/src/main/java/org/example/b2bmodule/controller/ApplicationController.java" "CrossOrigin" "ApplicationController has CORS enabled"

echo ""
echo "============================================"
echo "📊 VALIDATION SUMMARY"
echo "============================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🎉 Email notification setup is complete and ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Run: mvn clean compile"
    echo "2. Run: mvn spring-boot:run"
    echo "3. Test with: bash test_email_endpoints.sh"
    echo "4. Or import: Postman_Collection.json"
    echo ""
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED!${NC}"
    echo ""
    echo "Errors found: $ERRORS"
    echo ""
    echo "Please check the errors above and ensure all files are in place."
    echo ""
    exit 1
fi

