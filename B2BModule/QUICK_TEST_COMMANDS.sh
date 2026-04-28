#!/bin/bash

# ============================================
# Script de Test Rapide - Système d'Entretiens
# ============================================

echo "🚀 Démarrage des tests du système d'entretiens..."
echo ""

# Configuration
API_URL="http://localhost:8083/api/interviews"
CANDIDATE_ID=1
RECRUITER_ID=1
JOB_OFFER_ID=1

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Test 1 : Créer un entretien
# ============================================
echo -e "${YELLOW}Test 1 : Créer un entretien${NC}"
echo "POST $API_URL"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": '$CANDIDATE_ID',
    "recruiterId": '$RECRUITER_ID',
    "jobOfferId": '$JOB_OFFER_ID',
    "interviewDateTime": "2026-03-15T14:00:00",
    "location": "Bureau - Salle 101",
    "meetingLink": "https://zoom.us/j/123456789",
    "notes": "Entretien technique"
  }')

echo "$RESPONSE" | jq '.'
INTERVIEW_ID=$(echo "$RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Entretien créé avec l'ID: $INTERVIEW_ID${NC}"
echo ""

# ============================================
# Test 2 : Récupérer un entretien
# ============================================
echo -e "${YELLOW}Test 2 : Récupérer un entretien${NC}"
echo "GET $API_URL/$INTERVIEW_ID"

curl -s -X GET "$API_URL/$INTERVIEW_ID" | jq '.'
echo -e "${GREEN}✓ Entretien récupéré${NC}"
echo ""

# ============================================
# Test 3 : Récupérer les entretiens d'un candidat
# ============================================
echo -e "${YELLOW}Test 3 : Récupérer les entretiens d'un candidat${NC}"
echo "GET $API_URL/candidate/$CANDIDATE_ID"

curl -s -X GET "$API_URL/candidate/$CANDIDATE_ID" | jq '.'
echo -e "${GREEN}✓ Entretiens du candidat récupérés${NC}"
echo ""

# ============================================
# Test 4 : Récupérer les entretiens d'un recruteur
# ============================================
echo -e "${YELLOW}Test 4 : Récupérer les entretiens d'un recruteur${NC}"
echo "GET $API_URL/recruiter/$RECRUITER_ID"

curl -s -X GET "$API_URL/recruiter/$RECRUITER_ID" | jq '.'
echo -e "${GREEN}✓ Entretiens du recruteur récupérés${NC}"
echo ""

# ============================================
# Test 5 : Récupérer les entretiens d'une offre
# ============================================
echo -e "${YELLOW}Test 5 : Récupérer les entretiens d'une offre${NC}"
echo "GET $API_URL/job-offer/$JOB_OFFER_ID"

curl -s -X GET "$API_URL/job-offer/$JOB_OFFER_ID" | jq '.'
echo -e "${GREEN}✓ Entretiens de l'offre récupérés${NC}"
echo ""

# ============================================
# Test 6 : Récupérer les entretiens entre deux dates
# ============================================
echo -e "${YELLOW}Test 6 : Récupérer les entretiens entre deux dates${NC}"
echo "GET $API_URL/calendar?startDate=2026-03-01T00:00:00&endDate=2026-03-31T23:59:59"

curl -s -X GET "$API_URL/calendar?startDate=2026-03-01T00:00:00&endDate=2026-03-31T23:59:59" | jq '.'
echo -e "${GREEN}✓ Entretiens du mois récupérés${NC}"
echo ""

# ============================================
# Test 7 : Modifier un entretien
# ============================================
echo -e "${YELLOW}Test 7 : Modifier un entretien${NC}"
echo "PUT $API_URL/$INTERVIEW_ID"

curl -s -X PUT "$API_URL/$INTERVIEW_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": '$CANDIDATE_ID',
    "recruiterId": '$RECRUITER_ID',
    "jobOfferId": '$JOB_OFFER_ID',
    "interviewDateTime": "2026-03-16T15:00:00",
    "location": "Bureau - Salle 102",
    "meetingLink": "https://zoom.us/j/987654321",
    "notes": "Entretien technique - Modifié"
  }' | jq '.'
echo -e "${GREEN}✓ Entretien modifié${NC}"
echo ""

# ============================================
# Test 8 : Annuler un entretien
# ============================================
echo -e "${YELLOW}Test 8 : Annuler un entretien${NC}"
echo "PUT $API_URL/$INTERVIEW_ID/cancel"

curl -s -X PUT "$API_URL/$INTERVIEW_ID/cancel" | jq '.'
echo -e "${GREEN}✓ Entretien annulé${NC}"
echo ""

# ============================================
# Test 9 : Envoyer les rappels
# ============================================
echo -e "${YELLOW}Test 9 : Envoyer les rappels${NC}"
echo "POST $API_URL/send-reminders"

curl -s -X POST "$API_URL/send-reminders" | jq '.'
echo -e "${GREEN}✓ Rappels envoyés${NC}"
echo ""

# ============================================
# Test 10 : Supprimer un entretien
# ============================================
echo -e "${YELLOW}Test 10 : Supprimer un entretien${NC}"
echo "DELETE $API_URL/$INTERVIEW_ID"

curl -s -X DELETE "$API_URL/$INTERVIEW_ID"
echo -e "${GREEN}✓ Entretien supprimé${NC}"
echo ""

# ============================================
# Résumé
# ============================================
echo -e "${GREEN}✓ Tous les tests sont terminés !${NC}"
echo ""
echo "Résumé des tests :"
echo "  ✓ Créer un entretien"
echo "  ✓ Récupérer un entretien"
echo "  ✓ Récupérer les entretiens d'un candidat"
echo "  ✓ Récupérer les entretiens d'un recruteur"
echo "  ✓ Récupérer les entretiens d'une offre"
echo "  ✓ Récupérer les entretiens entre deux dates"
echo "  ✓ Modifier un entretien"
echo "  ✓ Annuler un entretien"
echo "  ✓ Envoyer les rappels"
echo "  ✓ Supprimer un entretien"
echo ""
echo "Pour plus de détails, consultez INTERVIEW_SYSTEM_TEST_GUIDE.md"
