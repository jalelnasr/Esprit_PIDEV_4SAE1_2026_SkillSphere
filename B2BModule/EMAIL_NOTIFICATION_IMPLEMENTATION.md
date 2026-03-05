# 📧 Fonctionnalité d'Email Notification - B2B Module

## Vue d'ensemble

Implémentation complète d'une fonctionnalité avancée de notification par email pour les candidatures. Les RH peuvent notifier les candidats de l'acceptation ou du rejet de leur candidature avec un email HTML professionnel.

---

## 📋 Fichiers Créés/Modifiés

### 1. **pom.xml** - ✅ MODIFIÉ
Ajout de la dépendance pour Spring Mail :
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 2. **application.properties** - ✅ MODIFIÉ
Configuration SMTP Gmail :
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

### 3. **EmailNotificationDTO.java** - ✅ CRÉÉ
Nouveau DTO pour les données de notification :
```java
public class EmailNotificationDTO {
    private String candidateEmail;      // Email du candidat
    private String candidateName;       // Nom du candidat
    private String jobTitle;            // Titre du poste
    private String companyName;         // Nom de l'entreprise
    private String status;              // ACCEPTED ou REJECTED
    private String message;             // Message optionnel du RH
}
```

### 4. **EmailService.java** - ✅ CRÉÉ
Service pour envoyer les emails HTML professionnels :
- Injection du `JavaMailSender`
- Méthode `sendApplicationNotification(EmailNotificationDTO dto)`
- Template HTML professionnel avec :
  - **Header** : Gradient bleu-violet avec logo B2B Platform
  - **Bloc Statut** : 
    - ✅ Vert pour ACCEPTED avec message de félicitations
    - 📋 Gris pour REJECTED avec message poli
  - **Bloc HR Message** : Affichage optionnel du message personnalisé du RH (si fourni)
  - **Footer** : Signature avec le nom de l'entreprise

### 5. **ApplicationController.java** - ✅ MODIFIÉ
Ajout de 2 nouveaux endpoints :

#### Endpoint 1 : POST /api/b2b/applications/notify
```
POST /api/b2b/applications/notify
Content-Type: application/json

{
  "candidateEmail": "candidate@email.com",
  "candidateName": "John Doe",
  "jobTitle": "Data Analyst",
  "companyName": "MarketingPro",
  "status": "ACCEPTED",
  "message": "Message personnalisé optionnel du RH"
}

Response: 200 OK
{
  "message": "Email sent successfully"
}
```

#### Endpoint 2 : PUT /api/b2b/applications/{id}/status-notify
```
PUT /api/b2b/applications/5/status-notify?status=ACCEPTED
Content-Type: application/json

{
  "candidateEmail": "candidate@email.com",
  "candidateName": "John Doe",
  "jobTitle": "Data Analyst",
  "companyName": "MarketingPro",
  "status": "ACCEPTED",
  "message": "Optional message"
}

Response: 200 OK
{
  "id": 5,
  "jobOfferId": 1,
  "jobTitle": "Data Analyst",
  "candidateId": 2,
  "candidateTitle": "Développeur",
  "matchScore": 85.5,
  "status": "ACCEPTED",
  "appliedAt": "2026-02-23T10:30:00Z"
}
```

---

## 🎨 Template Email HTML

### Design Professionnel
- **Header coloré** : Gradient bleu-violet avec texte blanc
- **Typography moderne** : Fonts système cross-platform
- **Responsive** : Adapté aux appareils mobiles et desktop
- **Sécurité** : Échappement HTML pour éviter les injections

### Contenu Personnalisé

**Pour ACCEPTED :**
```
✅ Congratulations! Your application for the position of [jobTitle] at [companyName] has been ACCEPTED! We are excited to welcome you to our team.
```

**Pour REJECTED :**
```
📋 Thank you for your interest in our opportunities. After careful review of all applications, we regret to inform you that your application has not been retained at this time. We encourage you to apply for future opportunities that match your profile.
```

**Message HR optionnel :**
```
📌 Message from HR Team:
[message personnalisé du RH avec bordure bleue et fond gris]
```

---

## 🔒 Sécurité

### Configuration SMTP Sécurisée
- ✅ STARTTLS activé (port 587)
- ✅ Authentification SMTP
- ✅ Connexion chiffrée

### Gestion des Erreurs
- Try-catch dans les endpoints
- Messages d'erreur détaillés
- Codes HTTP appropriés (200, 500)

### Validation des Données
- EmailNotificationDTO avec Lombok
- Vérification du message HR (null/empty safe)
- Échappement HTML des données utilisateur

---

## 🧪 Exemples de Test

### Test 1 : Notifier une acceptation
```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "john@example.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "TechCorp",
    "status": "ACCEPTED",
    "message": "We are excited to have you join our data science team!"
  }'
```

### Test 2 : Notifier un rejet avec message
```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "jane@example.com",
    "candidateName": "Jane Smith",
    "jobTitle": "Backend Developer",
    "companyName": "StartupX",
    "status": "REJECTED",
    "message": "Your profile is interesting. We encourage you to apply for our next Frontend role!"
  }'
```

### Test 3 : Mettre à jour le statut et envoyer email
```bash
curl -X PUT http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "bob@example.com",
    "candidateName": "Bob Johnson",
    "jobTitle": "DevOps Engineer",
    "companyName": "CloudPro",
    "status": "ACCEPTED"
  }'
```

---

## ⚙️ Configuration Requise

### 1. Dépendances Maven
- ✅ spring-boot-starter-mail (ajoutée)
- ✅ spring-boot-starter-web (existante)
- ✅ spring-boot-starter-data-jpa (existante)

### 2. Variables d'Environnement (application.properties)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

⚠️ **Important** : Utiliser un mot de passe d'application Google, pas votre mot de passe Gmail principal !

### 3. CORS
- ✅ @CrossOrigin(origins = "*") ajouté au ApplicationController

---

## 📊 Statuts d'Application Supportés

L'enum `Application.ApplicationStatus` supporte :
- `PENDING` - En attente
- `REVIEWED` - Examinée
- `SHORTLISTED` - Sélectionnée
- `ACCEPTED` - Acceptée ✅
- `REJECTED` - Refusée ❌

Les emails peuvent être envoyés pour n'importe quel changement de statut.

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Templates personnalisés** : Utiliser Thymeleaf pour les templates réutilisables
2. **Logging** : Ajouter des logs pour tracker les envois d'emails
3. **Retry** : Implémenter une logique de retry en cas d'échec
4. **Queue** : Utiliser RabbitMQ/Kafka pour les emails asynchrones
5. **Analytics** : Tracker les ouvertures d'emails avec des pixels tracking

---

## 📞 Support

Pour toute question ou problème, consultez :
- Les logs Spring Boot dans `target/` ou la console IDE
- La configuration SMTP dans `application.properties`
- Le client email du destinataire (spam, etc.)

---

**Version** : 1.0  
**Date** : 23 Février 2026  
**Module** : B2B Corporate - Plateforme de Formation  
**Créé par** : GitHub Copilot

