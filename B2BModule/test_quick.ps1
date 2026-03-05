# Test Quick Email Notification
# PowerShell Script
# Usage: powershell -ExecutionPolicy Bypass -File test_quick.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      B2B MODULE - EMAIL NOTIFICATION QUICK TEST           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BackendUrl = "http://localhost:8083"
$ApiBase = "$BackendUrl/api/b2b/applications"

# Configuration
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Backend URL: $BackendUrl" -ForegroundColor Gray
Write-Host "  API Endpoint: $ApiBase/notify" -ForegroundColor Gray
Write-Host ""

# Step 1: Check Backend Health
Write-Host "▶ STEP 1: Checking backend health..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $ApiBase -Method GET -ErrorAction Stop -TimeoutSec 5
    Write-Host "✅ SUCCESS: Backend is running!" -ForegroundColor Green
    Write-Host "   Total applications: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Backend not responding!" -ForegroundColor Red
    Write-Host "   Make sure the backend is running on port 8083" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Command to start backend:" -ForegroundColor Yellow
    Write-Host "   java -jar target/B2BModule-0.0.1-SNAPSHOT.jar" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 2: Send Email Notification
Write-Host "▶ STEP 2: Sending email notification..." -ForegroundColor Cyan
Write-Host ""

# Email payload
$emailPayload = @{
    candidateEmail = "john.doe@example.com"
    candidateName = "John Doe"
    jobTitle = "Data Analyst"
    companyName = "MarketingPro"
    status = "ACCEPTED"
    message = "Welcome to our team! We're excited to have you."
} | ConvertTo-Json

Write-Host "Email Details:" -ForegroundColor Yellow
Write-Host "  To: john.doe@example.com" -ForegroundColor Gray
Write-Host "  Name: John Doe" -ForegroundColor Gray
Write-Host "  Position: Data Analyst" -ForegroundColor Gray
Write-Host "  Company: MarketingPro" -ForegroundColor Gray
Write-Host "  Status: ACCEPTED ✅" -ForegroundColor Green
Write-Host ""

try {
    $emailResponse = Invoke-RestMethod `
        -Uri "$ApiBase/notify" `
        -Method POST `
        -Body $emailPayload `
        -ContentType "application/json" `
        -ErrorAction Stop -TimeoutSec 10

    Write-Host "✅ SUCCESS: Email sent!" -ForegroundColor Green
    Write-Host "   Response: $emailResponse" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Check your email inbox in 30-60 seconds!" -ForegroundColor Yellow

} catch {
    Write-Host "❌ ERROR: Failed to send email" -ForegroundColor Red
    Write-Host "   Error Details: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    if ($_.Exception.Response) {
        Write-Host "   HTTP Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   TEST COMPLETED! ✨                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check your email (john.doe@example.com is just a test)" -ForegroundColor Gray
Write-Host "  2. For real testing, use your own email in the script" -ForegroundColor Gray
Write-Host "  3. Integrate with Angular (see ANGULAR_EMAIL_SERVICE_GUIDE.md)" -ForegroundColor Gray
Write-Host ""

