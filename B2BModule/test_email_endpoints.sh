#!/bin/bash

# ============================================
# BASH SCRIPT - TEST EMAIL NOTIFICATION ENDPOINTS
# ============================================
# Usage: bash test_email_endpoints.sh

API_URL="http://localhost:8083/api/b2b/applications"

echo "============================================"
echo "TEST 1: Send Notification (ACCEPTED) Only"
echo "============================================"
curl -X POST "${API_URL}/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "john.doe@example.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "TechCorp Inc.",
    "status": "ACCEPTED",
    "message": "Congratulations! We are excited to have you join our data science team. Your onboarding will begin next week."
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo -e "\n"
sleep 2

echo "============================================"
echo "TEST 2: Send Notification (REJECTED) Only"
echo "============================================"
curl -X POST "${API_URL}/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "jane.smith@example.com",
    "candidateName": "Jane Smith",
    "jobTitle": "Backend Developer",
    "companyName": "StartupX Solutions",
    "status": "REJECTED",
    "message": "Your profile is excellent. We encourage you to apply for our Frontend Developer position which better matches your React expertise."
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo -e "\n"
sleep 2

echo "============================================"
echo "TEST 3: Send Notification without HR Message"
echo "============================================"
curl -X POST "${API_URL}/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "bob.wilson@example.com",
    "candidateName": "Bob Wilson",
    "jobTitle": "DevOps Engineer",
    "companyName": "CloudPro Systems",
    "status": "ACCEPTED"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo -e "\n"
sleep 2

echo "============================================"
echo "TEST 4: Update Status & Send Email (ID=1)"
echo "============================================"
curl -X PUT "${API_URL}/1/status-notify?status=ACCEPTED" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "alice.johnson@example.com",
    "candidateName": "Alice Johnson",
    "jobTitle": "Product Manager",
    "companyName": "InnovateTech Ltd",
    "status": "ACCEPTED",
    "message": "We look forward to collaborating with you. Please prepare for your first strategy meeting scheduled for March 5th."
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo -e "\n"
sleep 2

echo "============================================"
echo "TEST 5: Update Status & Send Email (REJECTED)"
echo "============================================"
curl -X PUT "${API_URL}/2/status-notify?status=REJECTED" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "charlie.brown@example.com",
    "candidateName": "Charlie Brown",
    "jobTitle": "QA Engineer",
    "companyName": "TestFirst Solutions",
    "status": "REJECTED"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo -e "\n============================================"
echo "TESTS COMPLETED"
echo "============================================"
echo "Note: Check the candidate emails for the HTML messages!"
echo "Check application logs for any errors:"
echo "tail -f target/logs/spring.log"

