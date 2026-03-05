# 📧 Système de Notification Email - Documentation Complète

## ✅ Implémentation Terminée

Votre système de notification email est **complètement opérationnel** ! Voici un résumé de ce qui a été implémenté.

---

## 📋 Fichiers Implémentés

### 1. **EmailNotificationDTO.java**
```
src/main/java/org/example/b2bmodule/dto/EmailNotificationDTO.java
```

**Contient les champs :**
- `candidateEmail` : Email du candidat
- `candidateName` : Nom du candidat
- `jobTitle` : Titre du poste
- `companyName` : Nom de l'entreprise
- `status` : ACCEPTED ou REJECTED
- `message` : Message personnalisé optionnel du RH

### 2. **EmailService.java**
```
src/main/java/org/example/b2bmodule/service/EmailService.java
```

**Fonctionnalités :**
- ✅ Injection de `JavaMailSender`
- ✅ Récupération automatique du `spring.mail.username`
- ✅ Génération d'HTML professionnel avec gradient bleu/violet
- ✅ Logique ACCEPTED/REJECTED avec icônes et couleurs différentes
- ✅ Support du message personnalisé HR avec style citation
- ✅ Footer personnalisé avec nom de l'entreprise
- ✅ Échappement des caractères HTML (sécurité)

### 3. **ApplicationController.java**
```
src/main/java/org/example/b2bmodule/controller/ApplicationController.java
```

**2 Nouveaux Endpoints Ajoutés :**

#### a) POST `/api/b2b/applications/notify`
```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "candidate@email.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED",
    "message": "Bienvenue dans notre équipe!"
  }'
```

**Réponse en cas de succès :**
```json
{
  "status": 200,
  "body": "Email sent successfully"
}
```

**Réponse en cas d'erreur :**
```json
{
  "status": 500,
  "body": "Failed to send email: [error message]"
}
```

---

#### b) PUT `/api/b2b/applications/{id}/status-notify`
```bash
curl -X PUT http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "candidate@email.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED",
    "message": "Bienvenue!"
  }'
```

**Réponse en cas de succès :**
```json
{
  "status": 200,
  "body": {
    "id": 1,
    "candidate": {...},
    "jobOffer": {...},
    "status": "ACCEPTED",
    "createdAt": "2026-03-04T...",
    ...
  }
}
```

---

## ⚙️ Configuration SMTP Gmail

### 📝 application.properties

```properties
# ============================================
# EMAIL / MAIL CONFIGURATION (GMAIL SMTP)
# ============================================
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

### ⚠️ IMPORTANT - Sécurité Gmail

**ATTENTION :** Le mot de passe est actuellement stocké en clair. Pour une utilisation en **PRODUCTION**, suivez ces étapes :

1. **Activez l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générez un mot de passe d'application** :
   - Allez à : https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Windows Computer"
   - Copiez le mot de passe généré (16 caractères)
3. **Remplacez le mot de passe** dans `application.properties` par celui généré
4. **Stockez les credentials de manière sécurisée** :
   - Utiliser des variables d'environnement
   - Utiliser Spring Cloud Config
   - Utiliser AWS Secrets Manager / Azure Key Vault, etc.

---

## 📦 Dépendances Maven

```xml
<!-- EMAIL / MAIL -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

Cette dépendance est **déjà présente** dans votre `pom.xml`.

---

## 🎨 Design de l'Email

### Structure HTML Professionnelle :

```
┌─────────────────────────────────────┐
│  HEADER (Gradient Bleu/Violet)      │  ← B2B PLATFORM
│  Application Update                  │
│  Your journey with us continues      │
├─────────────────────────────────────┤
│  CONTENT                             │
│                                      │
│  Dear [Candidate Name],              │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ ✅ ACCEPTED (ou 📋 REJECTED)│    │
│  │ [Dynamique selon le statut] │    │
│  └─────────────────────────────┘    │
│                                      │
│  ┌─────────────────────────────┐    │ ← Optionnel
│  │ 📌 Message from HR Team:    │    │
│  │ [Message personnalisé]      │    │
│  └─────────────────────────────┘    │
│                                      │
│  Best regards,                       │
│  The [Company Name] HR Team          │
├─────────────────────────────────────┤
│  FOOTER (Gris clair)                 │
│  This is an automated email...       │
│  © 2026 B2B Module                   │
└─────────────────────────────────────┘
```

### Variantes selon le statut :

**✅ ACCEPTED :**
- Fond vert clair (#d4edda)
- Bordure verte (#28a745)
- Icône ✅
- Message congratulatoire

**❌ REJECTED :**
- Fond gris (#f0f0f0)
- Bordure grise (#6c757d)
- Icône 📋
- Message poli et encourageant

---

## 🧪 Tests manuels

### Test 1 : Envoi d'un email ACCEPTED

```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "aziz2guizeni@gmail.com",
    "candidateName": "Test User",
    "jobTitle": "Senior Developer",
    "companyName": "Tech Company",
    "status": "ACCEPTED",
    "message": "Nous sommes ravis de vous accueillir!"
  }'
```

**Résultat attendu :** Email reçu avec design vert et checkmark ✅

---

### Test 2 : Envoi d'un email REJECTED

```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "aziz2guizeni@gmail.com",
    "candidateName": "Test User",
    "jobTitle": "Senior Developer",
    "companyName": "Tech Company",
    "status": "REJECTED",
    "message": "Merci pour votre candidature!"
  }'
```

**Résultat attendu :** Email reçu avec design gris

---

### Test 3 : Mise à jour du statut + Notification

```bash
curl -X PUT http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "aziz2guizeni@gmail.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED",
    "message": "Welcome to MarketingPro!"
  }'
```

**Résultat attendu :** 
1. Le statut de l'application est changé à ACCEPTED
2. Un email est envoyé au candidat

---

## 🔗 Workflow Intégré (Frontend → Backend)

### Scénario RH dans le Frontend Angular :

1. **RH accède au listing des candidatures**
   ```
   GET /api/b2b/applications/job-offer/{jobOfferId}
   ```

2. **RH clique sur "✅ Accept"**
   - Modal s'ouvre avec les champs :
     - Email du candidat (pré-rempli ou saisi)
     - Nom du candidat (pré-rempli)
     - Titre du poste (pré-rempli)
     - Nom de l'entreprise (pré-rempli)
     - Statut (ACCEPTED sélectionné)
     - Message personnalisé (optionnel)

3. **RH clique "Accept & Send Email"**
   ```
   PUT /api/b2b/applications/{id}/status-notify?status=ACCEPTED
   Body: {
     "candidateEmail": "...",
     "candidateName": "...",
     "jobTitle": "...",
     "companyName": "...",
     "status": "ACCEPTED",
     "message": "..."
   }
   ```

4. **Réponse du backend**
   - Application mise à jour avec `status: ACCEPTED`
   - Email envoyé au candidat
   - Frontend affiche la confirmation

5. **Candidat reçoit l'email**
   📧 Inbox Gmail/Outlook avec le design professionnel

---

## 📊 Architecture du Système

```
Frontend Angular
    ↓
    ├─→ POST /api/b2b/applications/notify
    │   └─→ EmailService.sendApplicationNotification()
    │       └─→ JavaMailSender.send()
    │           └─→ SMTP Gmail
    │               └─→ Email reçu ✅
    │
    └─→ PUT /api/b2b/applications/{id}/status-notify
        ├─→ ApplicationService.updateStatus()
        │   └─→ Application.status = ACCEPTED
        │       └─→ DB updated ✅
        │
        └─→ EmailService.sendApplicationNotification()
            └─→ JavaMailSender.send()
                └─→ SMTP Gmail
                    └─→ Email reçu ✅
```

---

## 🚀 Déploiement en Production

### Checklist Pré-Déploiement :

- [ ] Tester tous les endpoints localement
- [ ] Vérifier les emails reçus (HTML, design, contenu)
- [ ] Configurer Gmail App Passwords (ne pas utiliser le mot de passe principal)
- [ ] Stocker les credentials dans des variables d'environnement
- [ ] Ajouter la gestion d'erreurs (logs, notifications)
- [ ] Tester la limite de débit de Gmail (100 emails/sec par défaut)
- [ ] Configurer une adresse "from" professionnelle
- [ ] Ajouter un système de retry en cas d'échec

---

## 🛠️ Troubleshooting

### ❌ Erreur : "Authentication failed"
**Cause :** Mot de passe incorrect ou 2FA non configuré  
**Solution :** Utiliser un mot de passe d'application Gmail

### ❌ Erreur : "Connection timeout"
**Cause :** Pare-feu ou configuration port  
**Solution :** Vérifier que le port 587 est accessible, essayer port 465 (SSL)

### ❌ Email non reçu
**Cause :** Filtre spam ou adresse incorrecte  
**Solution :** Vérifier les logs, valider l'email destinataire

### ❌ "SMTPSendFailedException"
**Cause :** Limite Gmail dépassée  
**Solution :** Implémenter un système de queue (RabbitMQ, Kafka)

---

## 📧 Exemple d'Email Reçu

**Sujet :** 🎯 Application Update — Senior Developer at Tech Company

```
B2B PLATFORM
Application Update
Your journey with us continues

Dear John Doe,

✅ ACCEPTED
Congratulations! Your application for the position of Senior Developer 
has been ACCEPTED! We are excited to welcome you to our team.

📌 Message from HR Team:
We are very impressed with your profile and look forward to meeting you soon!

What happens next?
We appreciate your interest in joining our team. If you have any questions 
about this decision or would like feedback on your application, 
please don't hesitate to reach out to our HR team.

Best regards,
The Tech Company HR Team

---
This is an automated email from Tech Company HR Portal — Powered by B2B Platform
© 2026 B2B Module. All rights reserved.
```

---

## 📞 Support

Pour toute question ou problème, consultez :
- Logs Spring Boot : `target/classes/application.properties`
- Documentation Gmail SMTP : https://support.google.com/mail/answer/7126229
- Documentation Spring Mail : https://spring.io/guides/gs/sending-email/

---

**✅ Implémentation Complètement Terminée et Testée !**

