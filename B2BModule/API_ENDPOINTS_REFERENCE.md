# 📧 API Endpoints - Email Notification System

**Backend URL:** `http://localhost:8083`  
**Version:** 1.0  
**Date:** 2026-03-04

---

## 📚 TABLE DES MATIÈRES

1. [Nouveaux Endpoints](#nouveaux-endpoints)
2. [Endpoints Existants](#endpoints-existants)
3. [Tests avec cURL](#tests-avec-curl)
4. [Tests avec PowerShell](#tests-avec-powershell)
5. [Postman Collection](#postman-collection)

---

## 🆕 Nouveaux Endpoints

### 1️⃣ POST /api/b2b/applications/notify

**Description:** Envoie un email de notification au candidat  
**Méthode:** `POST`  
**Port:** `8083`  
**URL complète:** `http://localhost:8083/api/b2b/applications/notify`

**Headers:**
```http
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "candidateEmail": "candidate@example.com",
  "candidateName": "John Doe",
  "jobTitle": "Data Analyst",
  "companyName": "MarketingPro",
  "status": "ACCEPTED",
  "message": "Bienvenue dans l'équipe! Nous attendons votre arrivée."
}
```

**Paramètres:**

| Champ | Type | Requis | Exemple |
|-------|------|--------|---------|
| `candidateEmail` | string | ✅ | `john@example.com` |
| `candidateName` | string | ✅ | `John Doe` |
| `jobTitle` | string | ✅ | `Data Analyst` |
| `companyName` | string | ✅ | `MarketingPro` |
| `status` | enum | ✅ | `ACCEPTED` ou `REJECTED` |
| `message` | string | ❌ | Optional HR message |

**Réponse 200 (Success):**
```json
{
  "message": "Email sent successfully to candidate@example.com"
}
```

**Réponse 500 (Error):**
```json
{
  "message": "Failed to send email: SMTP connection failed"
}
```

---

### 2️⃣ PUT /api/b2b/applications/{id}/status-notify

**Description:** Mettre à jour le statut ET envoyer un email en même temps  
**Méthode:** `PUT`  
**Port:** `8083`  
**URL complète:** `http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED`

**Path Parameters:**
- `id` (Long): ID de la candidature (requis)

**Query Parameters:**
- `status` (String): Nouveau statut `ACCEPTED` ou `REJECTED` (requis)

**Headers:**
```http
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "candidateEmail": "candidate@example.com",
  "candidateName": "John Doe",
  "jobTitle": "Data Analyst",
  "companyName": "MarketingPro",
  "status": "ACCEPTED",
  "message": "Message personnalisé optionnel"
}
```

**Réponse 200 (Success):**
```json
{
  "id": 1,
  "status": "ACCEPTED",
  "candidate": { "id": 5, "name": "John Doe", "email": "john@example.com" },
  "jobOffer": { "id": 3, "title": "Data Analyst" },
  "matchScore": 0.85,
  "appliedAt": "2026-03-04T10:30:00"
}
```

**Réponse 404 (Not Found):**
```json
{
  "message": "Application not found"
}
```

**Réponse 500 (Error):**
```json
{
  "message": "Error: Failed to send email..."
}
```

---

## 📋 Endpoints Existants (à ne pas modifier)

### GET /api/b2b/applications
Lister toutes les candidatures

### GET /api/b2b/applications/{id}
Obtenir une candidature par ID

### GET /api/b2b/applications/job-offer/{jobOfferId}
Candidatures pour une offre spécifique

### GET /api/b2b/applications/candidate/{candidateId}
Candidatures d'un candidat spécifique

### GET /api/b2b/applications/job-offer/{jobOfferId}/top
Top candidats par matchScore pour une offre

### POST /api/b2b/applications
Créer une nouvelle candidature (Apply)

### PUT /api/b2b/applications/{id}/status?status=ACCEPTED
Mettre à jour le statut SANS envoyer d'email

### DELETE /api/b2b/applications/{id}
Supprimer une candidature

---

## 🧪 Tests avec cURL

### Test 1 : Envoyer un email simple (ACCEPTED)

```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "john@example.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED",
    "message": "Welcome to our team!"
  }'
```

**Résultat attendu:**
```
200 OK
{
  "message": "Email sent successfully to john@example.com"
}
```

---

### Test 2 : Envoyer un email REJECTED

```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "jane@example.com",
    "candidateName": "Jane Smith",
    "jobTitle": "Software Engineer",
    "companyName": "TechCorp",
    "status": "REJECTED",
    "message": "Thank you for applying!"
  }'
```

---

### Test 3 : Sans message personnalisé

```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "bob@example.com",
    "candidateName": "Bob Johnson",
    "jobTitle": "Project Manager",
    "companyName": "ManagementCorp",
    "status": "ACCEPTED"
  }'
```

---

### Test 4 : Mettre à jour le statut + Envoyer l'email

```bash
curl -X PUT "http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "candidate@example.com",
    "candidateName": "Test User",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED"
  }'
```

---

### Test 5 : Vérifier que le backend est accessible

```bash
# Test simple GET
curl http://localhost:8083/api/b2b/applications

# Test avec infos détaillées
curl -v http://localhost:8083/api/b2b/applications
```

---

## 🪟 Tests avec PowerShell

### Test 1 : Envoyer un email

```powershell
$url = "http://localhost:8083/api/b2b/applications/notify"
$body = @{
    candidateEmail = "john@example.com"
    candidateName = "John Doe"
    jobTitle = "Data Analyst"
    companyName = "MarketingPro"
    status = "ACCEPTED"
    message = "Welcome to our team!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
Write-Host "✅ Response: $response"
```

### Test 2 : Vérifier la connexion

```powershell
$testUrl = "http://localhost:8083/api/b2b/applications"

try {
    $response = Invoke-RestMethod -Uri $testUrl -Method GET
    Write-Host "✅ Backend is running!"
    Write-Host "✅ Total applications: $($response.Count)"
} catch {
    Write-Host "❌ Backend is not responding"
    Write-Host "Error: $_"
}
```

### Test 3 : Boucle de 5 emails

```powershell
$baseUrl = "http://localhost:8083/api/b2b/applications/notify"
$companies = @("MarketingPro", "TechCorp", "FinanceHub", "LogisticsCo", "RetailMax")
$statuses = @("ACCEPTED", "REJECTED")

for ($i = 1; $i -le 5; $i++) {
    $company = $companies[$i % $companies.Count]
    $status = $statuses[$i % $statuses.Count]
    
    $body = @{
        candidateEmail = "candidate$i@example.com"
        candidateName = "Test Candidate $i"
        jobTitle = "Position Title"
        companyName = $company
        status = $status
        message = "Test email number $i"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Email $i sent to candidate$i@example.com - Status: $status"
}
```

---

## 📮 Postman Collection

### Importer la Collection

1. Ouvrir **Postman**
2. Cliquer **Import**
3. Coller le JSON ci-dessous

```json
{
  "info": {
    "name": "B2B Email Notification System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Send Email - ACCEPTED",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"candidateEmail\":\"john@example.com\",\"candidateName\":\"John Doe\",\"jobTitle\":\"Data Analyst\",\"companyName\":\"MarketingPro\",\"status\":\"ACCEPTED\",\"message\":\"Welcome to our team!\"}"
        },
        "url": {
          "raw": "http://localhost:8083/api/b2b/applications/notify",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8083",
          "path": ["api", "b2b", "applications", "notify"]
        }
      }
    },
    {
      "name": "2. Send Email - REJECTED",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"candidateEmail\":\"jane@example.com\",\"candidateName\":\"Jane Smith\",\"jobTitle\":\"Software Engineer\",\"companyName\":\"TechCorp\",\"status\":\"REJECTED\",\"message\":\"Thank you for applying!\"}"
        },
        "url": {
          "raw": "http://localhost:8083/api/b2b/applications/notify",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8083",
          "path": ["api", "b2b", "applications", "notify"]
        }
      }
    },
    {
      "name": "3. Send Email - Without Message",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"candidateEmail\":\"bob@example.com\",\"candidateName\":\"Bob Johnson\",\"jobTitle\":\"Project Manager\",\"companyName\":\"ManagementCorp\",\"status\":\"ACCEPTED\"}"
        },
        "url": {
          "raw": "http://localhost:8083/api/b2b/applications/notify",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8083",
          "path": ["api", "b2b", "applications", "notify"]
        }
      }
    },
    {
      "name": "4. Update Status & Send Email",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"candidateEmail\":\"candidate@example.com\",\"candidateName\":\"Test User\",\"jobTitle\":\"Data Analyst\",\"companyName\":\"MarketingPro\",\"status\":\"ACCEPTED\",\"message\":\"Great choice!\"}"
        },
        "url": {
          "raw": "http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8083",
          "path": ["api", "b2b", "applications", "1", "status-notify"],
          "query": [
            {
              "key": "status",
              "value": "ACCEPTED"
            }
          ]
        }
      }
    },
    {
      "name": "5. Get All Applications",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8083/api/b2b/applications",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8083",
          "path": ["api", "b2b", "applications"]
        }
      }
    },
    {
      "name": "6. Get Application by ID",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8083/api/b2b/applications/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8083",
          "path": ["api", "b2b", "applications", "1"]
        }
      }
    },
    {
      "name": "7. Test Backend Health",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8083/api/b2b/applications?limit=1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8083",
          "path": ["api", "b2b", "applications"],
          "query": [
            {
              "key": "limit",
              "value": "1"
            }
          ]
        }
      }
    }
  ]
}
```

---

## ✅ Checklist de Test

- [ ] Backend démarré sur port 8083
- [ ] Test 1 : Envoyer email simple (ACCEPTED)
- [ ] Test 2 : Envoyer email (REJECTED)
- [ ] Test 3 : Email sans message personnalisé
- [ ] Test 4 : Mettre à jour statut + email
- [ ] Vérifier que l'email est reçu
- [ ] Test depuis Angular avec le service
- [ ] Modal fonctionne correctement
- [ ] Validation du formulaire OK

---

## 🔍 Diagnostique Rapide

```bash
# 1. Vérifier que le backend tourne
curl http://localhost:8083/api/b2b/applications

# 2. Vérifier la configuration SMTP
# Vérifier dans les logs du backend

# 3. Tester l'envoi d'email simple
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "test@gmail.com",
    "candidateName": "Test",
    "jobTitle": "Test Job",
    "companyName": "Test Company",
    "status": "ACCEPTED"
  }'

# 4. Vérifier votre Gmail
# → Réception de l'email en 30 secondes maximum
```

---

## 📧 Format Email Reçu

### Sujet
```
🎯 Application Update — Data Analyst at MarketingPro
```

### Contenu HTML
```
═════════════════════════════════════════════════════════════

              🎯 B2B PLATFORM

             Application Update
       Your journey with us continues

═════════════════════════════════════════════════════════════

Dear John Doe,

✅ ACCEPTED

Congratulations! Your application for the position of Data 
Analyst at MarketingPro has been ACCEPTED! 

We are excited to welcome you to our team.

┌─────────────────────────────────────────────────────────┐
│ 📌 Message from HR Team:                                │
│                                                         │
│ "Welcome to our team! We look forward to working       │
│  with you. Your start date is March 10, 2026."         │
└─────────────────────────────────────────────────────────┘

What happens next?

We appreciate your interest in joining our team. If you 
have any questions about this decision or would like 
feedback on your application, please don't hesitate to 
reach out to our HR team.

Best regards,
The MarketingPro HR Team

═════════════════════════════════════════════════════════════

This is an automated email from MarketingPro HR Portal
Powered by B2B Platform

© 2026 B2B Module. All rights reserved.
```

---

**Tous les tests sont prêts. À tester ! 🚀**

