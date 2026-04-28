#!/bin/bash

# ========================================
# TEST SCRIPT - Email Notification System
# ========================================
# Ce script teste les 2 nouveaux endpoints d'email notification

API_BASE_URL="http://localhost:8083/api/b2b/applications"
CANDIDATE_EMAIL="aziz2guizeni@gmail.com"

echo "=========================================="
echo "📧 Email Notification System - Test Script"
echo "=========================================="
echo ""

# ========================================
# TEST 1: Envoyer un email ACCEPTED
# ========================================
echo "🧪 TEST 1: POST /api/b2b/applications/notify (ACCEPTED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "$API_BASE_URL/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "'$CANDIDATE_EMAIL'",
    "candidateName": "Test User Accepted",
    "jobTitle": "Senior Backend Developer",
    "companyName": "TechCorp International",
    "status": "ACCEPTED",
    "message": "Nous sommes ravis de vous accueillir dans notre équipe! Votre profil nous a beaucoup impressionnés."
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""
echo "✅ Si vous avez reçu un email avec un design VERT et un checkmark ✅, le test 1 a réussi!"
echo ""

# ========================================
# TEST 2: Envoyer un email REJECTED
# ========================================
echo "🧪 TEST 2: POST /api/b2b/applications/notify (REJECTED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "$API_BASE_URL/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "'$CANDIDATE_EMAIL'",
    "candidateName": "Test User Rejected",
    "jobTitle": "Data Scientist",
    "companyName": "DataFlow Solutions",
    "status": "REJECTED",
    "message": "Merci pour votre candidature. Nous vous encourageons à postuler pour les futures opportunités."
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""
echo "✅ Si vous avez reçu un email avec un design GRIS et une icône 📋, le test 2 a réussi!"
echo ""

# ========================================
# TEST 3: Envoyer un email SANS message personnel
# ========================================
echo "🧪 TEST 3: POST /api/b2b/applications/notify (Sans message personnel)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "$API_BASE_URL/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "'$CANDIDATE_EMAIL'",
    "candidateName": "Test User No Message",
    "jobTitle": "Frontend Developer",
    "companyName": "WebStudio Pro",
    "status": "ACCEPTED"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""
echo "✅ Si vous avez reçu un email SANS bloc 'Message from HR Team:', le test 3 a réussi!"
echo ""

# ========================================
# TEST 4: GET toutes les applications (pour obtenir un ID)
# ========================================
echo "🧪 TEST 4: GET /api/b2b/applications (Récupérer les IDs)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Récupération des applications existantes..."
RESPONSE=$(curl -s -X GET "$API_BASE_URL")
echo "$RESPONSE" | head -c 500
echo "..."
echo ""

echo ""
echo "⚠️  IMPORTANT: Pour le TEST 5, vous devez avoir une application dans la base de données."
echo "Utilisez l'ID de l'application pour le test suivant."
echo ""

# ========================================
# TEST 5: PUT /{id}/status-notify (Mettre à jour + Envoyer email)
# ========================================
echo "🧪 TEST 5: PUT /api/b2b/applications/{id}/status-notify"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  INSTRUCTION:"
echo "1. Modifiez le script et remplacez APPLICATION_ID par l'ID d'une vraie application"
echo "2. Remplacez CANDIDATE_EMAIL par un email valide de la base de données"
echo ""
echo "Exemple de commande à exécuter :"
echo ""
echo "curl -X PUT \"http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"candidateEmail\": \"candidate@example.com\","
echo "    \"candidateName\": \"John Doe\","
echo "    \"jobTitle\": \"Senior Developer\","
echo "    \"companyName\": \"TechCorp\","
echo "    \"status\": \"ACCEPTED\","
echo "    \"message\": \"Bienvenue!\""
echo "  }'"
echo ""

# ========================================
# RÉSUMÉ DES TESTS
# ========================================
echo ""
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo ""
echo "✅ TEST 1 - POST /notify (ACCEPTED)"
echo "   Envoie un email vert avec checkmark"
echo ""
echo "✅ TEST 2 - POST /notify (REJECTED)"
echo "   Envoie un email gris avec icône"
echo ""
echo "✅ TEST 3 - POST /notify (Sans message personnel)"
echo "   Bloc HR Message n'apparaît pas"
echo ""
echo "✅ TEST 4 - GET /applications"
echo "   Récupère les applications existantes"
echo ""
echo "✅ TEST 5 - PUT /{id}/status-notify"
echo "   Mettre à jour le statut + envoyer l'email"
echo ""
echo "=========================================="
echo ""
echo "🎉 Si tous les tests passent, le système est opérationnel!"
echo ""

