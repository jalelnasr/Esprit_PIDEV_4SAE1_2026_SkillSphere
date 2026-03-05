# Test Email Notification System - B2B Module
# PowerShell Script for testing email endpoints
# Author: B2B Team
# Date: 2026-03-04

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  B2B MODULE - EMAIL NOTIFICATION SYSTEM TEST SCRIPT" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BackendUrl = "http://localhost:8083"
$ApiBase = "$BackendUrl/api/b2b/applications"
$ContentType = "application/json"

# Colors
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

# ============================================================================
# FUNCTION: Check Backend Health
# ============================================================================
function Test-BackendHealth {
    Write-Host "🔍 CHECKING BACKEND HEALTH..." -ForegroundColor $InfoColor
    Write-Host "   Endpoint: $ApiBase" -ForegroundColor Gray
    Write-Host ""

    try {
        $response = Invoke-WebRequest -Uri $ApiBase -Method GET -ErrorAction Stop -TimeoutSec 5

        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is RUNNING on port 8083" -ForegroundColor $SuccessColor
            Write-Host "   Status Code: 200 OK" -ForegroundColor $SuccessColor
            return $true
        }
    }
    catch {
        Write-Host "❌ Backend is NOT responding" -ForegroundColor $ErrorColor
        Write-Host "   Error: $_" -ForegroundColor $WarningColor
        Write-Host ""
        Write-Host "   SOLUTION: Start the backend with:" -ForegroundColor $WarningColor
        Write-Host "   java -jar target/B2BModule-0.0.1-SNAPSHOT.jar" -ForegroundColor Gray
        return $false
    }
}

# ============================================================================
# FUNCTION: Send Email Notification
# ============================================================================
function Send-EmailNotification {
    param(
        [string]$Email,
        [string]$Name,
        [string]$JobTitle,
        [string]$Company,
        [string]$Status,
        [string]$Message = ""
    )

    $body = @{
        candidateEmail = $Email
        candidateName = $Name
        jobTitle = $JobTitle
        companyName = $Company
        status = $Status
        message = $Message
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod `
            -Uri "$ApiBase/notify" `
            -Method POST `
            -Body $body `
            -ContentType $ContentType `
            -ErrorAction Stop

        return @{
            Success = $true
            Message = $response
        }
    }
    catch {
        return @{
            Success = $false
            Message = $_.Exception.Message
        }
    }
}

# ============================================================================
# FUNCTION: Update Status and Send Email
# ============================================================================
function Update-StatusAndNotify {
    param(
        [long]$ApplicationId,
        [string]$Status,
        [string]$Email,
        [string]$Name,
        [string]$JobTitle,
        [string]$Company,
        [string]$Message = ""
    )

    $body = @{
        candidateEmail = $Email
        candidateName = $Name
        jobTitle = $JobTitle
        companyName = $Company
        status = $Status
        message = $Message
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod `
            -Uri "$ApiBase/$ApplicationId/status-notify?status=$Status" `
            -Method PUT `
            -Body $body `
            -ContentType $ContentType `
            -ErrorAction Stop

        return @{
            Success = $true
            Message = $response
        }
    }
    catch {
        return @{
            Success = $false
            Message = $_.Exception.Message
        }
    }
}

# ============================================================================
# TEST 1: Simple Email - ACCEPTED
# ============================================================================
function Test-EmailAccepted {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 1: Send Email - APPLICATION ACCEPTED" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    $params = @{
        Email = "john.doe@example.com"
        Name = "John Doe"
        JobTitle = "Data Analyst"
        Company = "MarketingPro"
        Status = "ACCEPTED"
        Message = "Welcome to our team! We're excited to have you on board. Your onboarding starts March 10, 2026."
    }

    Write-Host "Sending email with parameters:"
    Write-Host "  Email: $($params.Email)" -ForegroundColor Gray
    Write-Host "  Name: $($params.Name)" -ForegroundColor Gray
    Write-Host "  Job: $($params.JobTitle)" -ForegroundColor Gray
    Write-Host "  Company: $($params.Company)" -ForegroundColor Gray
    Write-Host "  Status: $($params.Status)" -ForegroundColor Green
    Write-Host ""

    $result = Send-EmailNotification @params

    if ($result.Success) {
        Write-Host "✅ EMAIL SENT SUCCESSFULLY!" -ForegroundColor $SuccessColor
        Write-Host "   Response: $($result.Message)" -ForegroundColor $SuccessColor
    }
    else {
        Write-Host "❌ FAILED TO SEND EMAIL" -ForegroundColor $ErrorColor
        Write-Host "   Error: $($result.Message)" -ForegroundColor $ErrorColor
    }
}

# ============================================================================
# TEST 2: Simple Email - REJECTED
# ============================================================================
function Test-EmailRejected {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 2: Send Email - APPLICATION REJECTED" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    $params = @{
        Email = "jane.smith@example.com"
        Name = "Jane Smith"
        JobTitle = "Software Engineer"
        Company = "TechCorp"
        Status = "REJECTED"
        Message = "Thank you for your interest. We received many applications and unfortunately your profile didn't match our current requirements."
    }

    Write-Host "Sending email with parameters:"
    Write-Host "  Email: $($params.Email)" -ForegroundColor Gray
    Write-Host "  Name: $($params.Name)" -ForegroundColor Gray
    Write-Host "  Job: $($params.JobTitle)" -ForegroundColor Gray
    Write-Host "  Company: $($params.Company)" -ForegroundColor Gray
    Write-Host "  Status: $($params.Status)" -ForegroundColor Red
    Write-Host ""

    $result = Send-EmailNotification @params

    if ($result.Success) {
        Write-Host "✅ EMAIL SENT SUCCESSFULLY!" -ForegroundColor $SuccessColor
        Write-Host "   Response: $($result.Message)" -ForegroundColor $SuccessColor
    }
    else {
        Write-Host "❌ FAILED TO SEND EMAIL" -ForegroundColor $ErrorColor
        Write-Host "   Error: $($result.Message)" -ForegroundColor $ErrorColor
    }
}

# ============================================================================
# TEST 3: Email Without Message
# ============================================================================
function Test-EmailNoMessage {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 3: Send Email - WITHOUT CUSTOM MESSAGE" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    $params = @{
        Email = "bob.wilson@example.com"
        Name = "Bob Wilson"
        JobTitle = "Project Manager"
        Company = "ManagementCorp"
        Status = "ACCEPTED"
    }

    Write-Host "Sending email (no custom message):"
    Write-Host "  Email: $($params.Email)" -ForegroundColor Gray
    Write-Host "  Name: $($params.Name)" -ForegroundColor Gray
    Write-Host "  Job: $($params.JobTitle)" -ForegroundColor Gray
    Write-Host "  Company: $($params.Company)" -ForegroundColor Gray
    Write-Host "  Status: $($params.Status)" -ForegroundColor Green
    Write-Host "  Message: (none)" -ForegroundColor Yellow
    Write-Host ""

    $result = Send-EmailNotification @params

    if ($result.Success) {
        Write-Host "✅ EMAIL SENT SUCCESSFULLY!" -ForegroundColor $SuccessColor
        Write-Host "   Response: $($result.Message)" -ForegroundColor $SuccessColor
    }
    else {
        Write-Host "❌ FAILED TO SEND EMAIL" -ForegroundColor $ErrorColor
        Write-Host "   Error: $($result.Message)" -ForegroundColor $ErrorColor
    }
}

# ============================================================================
# TEST 4: Get All Applications
# ============================================================================
function Test-GetAllApplications {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 4: Get All Applications" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    try {
        $response = Invoke-RestMethod -Uri $ApiBase -Method GET -ErrorAction Stop

        Write-Host "✅ RETRIEVED APPLICATIONS" -ForegroundColor $SuccessColor
        Write-Host "   Total applications: $($response.Count)" -ForegroundColor $SuccessColor

        if ($response.Count -gt 0) {
            Write-Host "   Sample data:"
            $response[0] | ConvertTo-Json | Write-Host -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ FAILED TO GET APPLICATIONS" -ForegroundColor $ErrorColor
        Write-Host "   Error: $_" -ForegroundColor $ErrorColor
    }
}

# ============================================================================
# TEST 5: Batch Email Test (5 emails)
# ============================================================================
function Test-BatchEmails {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 5: BATCH TEST - 5 Emails" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    $candidates = @(
        @{ Email = "alice@example.com"; Name = "Alice Johnson"; Job = "Data Scientist"; Company = "DataCorp"; Status = "ACCEPTED"; Msg = "Welcome!" },
        @{ Email = "bob@example.com"; Name = "Bob Smith"; Job = "DevOps"; Company = "CloudSys"; Status = "REJECTED"; Msg = "" },
        @{ Email = "charlie@example.com"; Name = "Charlie Brown"; Job = "QA Engineer"; Company = "TestWare"; Status = "ACCEPTED"; Msg = "Excited!" },
        @{ Email = "diana@example.com"; Name = "Diana Prince"; Job = "Frontend Dev"; Company = "WebCo"; Status = "ACCEPTED"; Msg = "Start ASAP" },
        @{ Email = "evan@example.com"; Name = "Evan Davis"; Job = "Backend Dev"; Company = "APIHub"; Status = "REJECTED"; Msg = "" }
    )

    $successCount = 0
    $failureCount = 0

    for ($i = 0; $i -lt $candidates.Count; $i++) {
        $candidate = $candidates[$i]
        Write-Host "  Email $($i+1)/5: Sending to $($candidate.Name)..." -ForegroundColor $InfoColor

        $params = @{
            Email = $candidate.Email
            Name = $candidate.Name
            JobTitle = $candidate.Job
            Company = $candidate.Company
            Status = $candidate.Status
            Message = $candidate.Msg
        }

        $result = Send-EmailNotification @params

        if ($result.Success) {
            Write-Host "           ✅ Success" -ForegroundColor $SuccessColor
            $successCount++
        }
        else {
            Write-Host "           ❌ Failed" -ForegroundColor $ErrorColor
            $failureCount++
        }

        Start-Sleep -Milliseconds 500  # Small delay between requests
    }

    Write-Host ""
    Write-Host "BATCH RESULTS:" -ForegroundColor Cyan
    Write-Host "  ✅ Successful: $successCount/5" -ForegroundColor $SuccessColor
    Write-Host "  ❌ Failed: $failureCount/5" -ForegroundColor $ErrorColor
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host ""
Write-Host "PREREQUISITES:" -ForegroundColor $InfoColor
Write-Host "  1. Backend must be running on port 8083" -ForegroundColor Gray
Write-Host "  2. Gmail credentials configured in application.properties" -ForegroundColor Gray
Write-Host "  3. 2FA enabled on Gmail account" -ForegroundColor Gray
Write-Host ""

Write-Host "To start the backend, run:" -ForegroundColor $WarningColor
Write-Host "  java -jar target/B2BModule-0.0.1-SNAPSHOT.jar" -ForegroundColor Gray
Write-Host ""

# Check backend health first
if (-not (Test-BackendHealth)) {
    Write-Host ""
    Write-Host "🛑 TESTS ABORTED - Backend not available" -ForegroundColor $ErrorColor
    exit 1
}

Write-Host ""
Write-Host "Running tests..." -ForegroundColor $InfoColor
Write-Host ""

# Run all tests
Test-EmailAccepted
Test-EmailRejected
Test-EmailNoMessage
Test-GetAllApplications
Test-BatchEmails

# Summary
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETED" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📧 CHECK YOUR INBOX!" -ForegroundColor Green
Write-Host "   All emails should arrive in the next 30-60 seconds." -ForegroundColor Gray
Write-Host ""
Write-Host "💡 NEXT STEPS:" -ForegroundColor $InfoColor
Write-Host "   1. Verify emails received in your inbox" -ForegroundColor Gray
Write-Host "   2. Check email formatting and content" -ForegroundColor Gray
Write-Host "   3. Integrate with Angular (see ANGULAR_EMAIL_SERVICE_GUIDE.md)" -ForegroundColor Gray
Write-Host "   4. Test from the frontend modal" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 DOCUMENTATION:" -ForegroundColor $InfoColor
Write-Host "   • QUICK_START_EMAIL_SYSTEM.md" -ForegroundColor Gray
Write-Host "   • ANGULAR_EMAIL_SERVICE_GUIDE.md" -ForegroundColor Gray
Write-Host "   • API_ENDPOINTS_REFERENCE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Happy testing! 🚀" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

