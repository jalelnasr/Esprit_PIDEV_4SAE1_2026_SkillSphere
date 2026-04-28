# 🎨 ARCHITECTURE COMPLÈTE - SYSTÈME DE MAILING

## 📊 DIAGRAMME COMPLET

```
╔════════════════════════════════════════════════════════════════════════╗
║                    SYSTÈME DE MAILING COMPLET                          ║
╚════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND ANGULAR                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Page: Application List                                          │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │  Table des candidatures                                    │  │   │
│  │  │  ┌─────────────────────────────────────────────────────┐   │  │   │
│  │  │  │ Candidat │ Poste │ Entreprise │ Statut │ Actions  │   │  │   │
│  │  │  ├─────────────────────────────────────────────────────┤   │  │   │
│  │  │  │ John     │ Dev   │ TechCorp   │PENDING │ ✅ ❌    │   │  │   │
│  │  │  │ Jane     │ PM    │ DataPro    │PENDING │ ✅ ❌    │   │  │   │
│  │  │  └─────────────────────────────────────────────────────┘   │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│           │                                                              │
│           │ Clic sur ✅ ou ❌                                            │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Modal: Envoyer notification                                    │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ 👤 Candidat: John Doe                                      │ │   │
│  │  │ 💼 Poste: Developpeur Senior                               │ │   │
│  │  │ 🏢 Entreprise: TechCorp                                    │ │   │
│  │  │                                                             │ │   │
│  │  │ 📧 Email du candidat: [john@email.com]                    │ │   │
│  │  │                                                             │ │   │
│  │  │ 📌 Statut:                                                 │ │   │
│  │  │    [✅ Accepté ▼]                                          │ │   │
│  │  │                                                             │ │   │
│  │  │ 💬 Message personalisé:                                    │ │   │
│  │  │    [Welcome to our team!                                   │ │   │
│  │  │     We are excited...]                                     │ │   │
│  │  │                                                             │ │   │
│  │  │         [Annuler]    [📧 Envoyer l'email]                 │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               │ POST /notify
                               │ EmailNotification JSON
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND SPRING BOOT                                 │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ApplicationController                                           │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ @RestController                                             │ │  │
│  │  │ @RequestMapping("/api/b2b/applications")                   │ │  │
│  │  │ @CrossOrigin(origins = "*")                                │ │  │
│  │  │                                                              │ │  │
│  │  │ @PostMapping("/notify")                                     │ │  │
│  │  │ sendNotification(EmailNotificationDTO dto) {                │ │  │
│  │  │   emailService.sendApplicationNotification(dto);            │ │  │
│  │  │   return ResponseEntity.ok("Email sent successfully");      │ │  │
│  │  │ }                                                            │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                              │
│           │ Appel                                                        │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  EmailService                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ @Service                                                    │ │  │
│  │  │                                                              │ │  │
│  │  │ public void sendApplicationNotification(              │ │  │
│  │  │     EmailNotificationDTO dto) throws Exception {     │ │  │
│  │  │                                                        │ │  │
│  │  │   // 1. Crée MimeMessage                              │ │  │
│  │  │   MimeMessage msg = mailSender.createMimeMessage();  │ │  │
│  │  │                                                        │ │  │
│  │  │   // 2. Configure le message                          │ │  │
│  │  │   helper.setTo(dto.getCandidateEmail());              │ │  │
│  │  │   helper.setFrom(senderEmail);                        │ │  │
│  │  │   helper.setSubject("🎯 Application Update");         │ │  │
│  │  │                                                        │ │  │
│  │  │   // 3. Construit le HTML                             │ │  │
│  │  │   String html = buildEmailContent(dto);              │ │  │
│  │  │   helper.setText(html, true);                         │ │  │
│  │  │                                                        │ │  │
│  │  │   // 4. Envoie via SMTP                               │ │  │
│  │  │   mailSender.send(msg);                               │ │  │
│  │  │ }                                                       │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                              │
│           │ SMTP (port 587)                                             │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Configuration SMTP                                              │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ spring.mail.host=smtp.gmail.com                            │ │  │
│  │  │ spring.mail.port=587                                       │ │  │
│  │  │ spring.mail.username=aziz2guizeni@gmail.com                │ │  │
│  │  │ spring.mail.password=dabwejwnyqaryees                      │ │  │
│  │  │ spring.mail.properties.mail.smtp.auth=true                 │ │  │
│  │  │ spring.mail.properties.mail.smtp.starttls.enable=true      │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               │ SMTP Send
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          GMAIL SERVER                                    │
│  smtp.gmail.com:587                                                      │
│  ├─ TLS: Enabled                                                         │
│  ├─ Auth: aziz2guizeni@gmail.com                                         │
│  └─ Status: 250 OK (Message sent)                                        │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               │ Email acheminé
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      INBOX DU CANDIDAT                                   │
│                                                                           │
│  From: aziz2guizeni@gmail.com                                            │
│  Subject: 🎯 Application Update — Senior Developer at TechCorp          │
│  Date: Today                                                             │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              ╔═══════════════════════════════════════╗           │   │
│  │              ║        TechCorp                       ║           │   │
│  │              ║   HR Portal — Application Update      ║           │   │
│  │              ╚═══════════════════════════════════════╝           │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  ✅ ACCEPTED                                           │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                   │   │
│  │  Dear John Doe,                                                 │   │
│  │                                                                   │   │
│  │  We are delighted to inform you that your application for the   │   │
│  │  position of Senior Developer at TechCorp has been ACCEPTED! 🎉 │   │
│  │                                                                   │   │
│  │  We are excited to welcome you to our team. Our HR department   │   │
│  │  will contact you shortly with the next steps.                  │   │
│  │                                                                   │   │
│  │  Message from HR Team:                                          │   │
│  │  ═══════════════════════════════════════════════════════════   │   │
│  │  Welcome to our team! We are excited to have you on board.     │   │
│  │  Let's build something great together!                          │   │
│  │  ═══════════════════════════════════════════════════════════   │   │
│  │                                                                   │   │
│  │  Position: Senior Developer                                     │   │
│  │  Company: TechCorp                                              │   │
│  │  Status: ✅ ACCEPTED                                            │   │
│  │                                                                   │   │
│  │  Best regards,                                                  │   │
│  │  TechCorp HR Team                                               │   │
│  │                                                                   │   │
│  │  ───────────────────────────────────────────────────────────── │   │
│  │  This is an automated email from TechCorp HR Portal             │   │
│  │  Powered by B2B Platform                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 FLUX DE DONNÉES

```
ANGULAR FRONTEND
       │
       │ JSON: EmailNotification
       │ {
       │   candidateEmail: "john@example.com",
       │   candidateName: "John Doe",
       │   jobTitle: "Senior Developer",
       │   companyName: "TechCorp",
       │   status: "ACCEPTED",
       │   message: "Welcome to the team!"
       │ }
       │
       ▼
HTTP POST http://localhost:8083/api/b2b/applications/notify
       │
       ▼
SPRING BOOT
   ApplicationController.sendNotification()
       │
       ▼
   EmailService.sendApplicationNotification()
       │
       ├─ Crée MimeMessage
       ├─ Définit Subject: "🎯 Application Update — ..."
       ├─ Construit HTML professionnel
       │  ├─ Header avec gradient
       │  ├─ Badge ACCEPTED/REJECTED
       │  ├─ Message du HR
       │  └─ Footer
       │
       ▼
   javaMailSender.send(mimeMessage)
       │
       ▼
SMTP GMAIL SERVER (port 587)
   Authentification: aziz2guizeni@gmail.com
       │
       ▼
EMAIL ENVOYÉ ✅
       │
       ▼
CANDIDAT REÇOIT L'EMAIL DANS GMAIL ✅
```

---

## 🎯 INTERACTIONS

### 1️⃣ Utilisateur clique sur un bouton
```
Angular Component → openModal(application, 'ACCEPTED')
```

### 2️⃣ Modale s'ouvre avec les données
```
ApplicationResponseModalComponent reçoit les données via @Inject(MAT_DIALOG_DATA)
```

### 3️⃣ Utilisateur remplit le formulaire
```
Email du candidat (obligatoire)
Statut (Accepté ou Refusé)
Message HR (optionnel)
```

### 4️⃣ Utilisateur clique "Envoyer l'email"
```
Angular → EmailNotificationService.sendNotification()
```

### 5️⃣ Requête HTTP
```
POST http://localhost:8083/api/b2b/applications/notify
Content-Type: application/json
Body: EmailNotification (JSON)
```

### 6️⃣ Backend traite la requête
```
ApplicationController reçoit la requête
→ EmailService construit l'email HTML
→ JavaMailSender envoie via SMTP
```

### 7️⃣ Email reçu par le candidat
```
Gmail reçoit le message
→ Candidat voit l'email dans sa boîte
```

---

## 🔄 CYCLE DE VIE COMPLET

```
1. RH clique "✅ Accepter" ou "❌ Refuser"
   └─ Event: ApplicationListComponent.openModal()

2. Modale s'ouvre
   └─ Component: ApplicationResponseModalComponent

3. RH remplit le formulaire
   └─ Email, Statut, Message

4. RH clique "Envoyer l'email"
   └─ Validation du formulaire

5. Angular envoie la requête
   └─ POST /api/b2b/applications/notify

6. Backend reçoit la requête
   └─ ApplicationController.sendNotification()

7. EmailService construit l'email
   └─ HTML professionnel avec status + message

8. Email envoyé via SMTP
   └─ JavaMailSender.send()

9. SMTP Gmail envoie le message
   └─ Port 587, TLS activé

10. Candidat reçoit l'email
    └─ Dans Gmail après 1-2 minutes

11. Modale affiche "Succès" et se ferme
    └─ Angular met à jour la liste
```

---

## 📁 ARCHITECTURE DES FICHIERS

```
FRONTEND (Angular)
├── services/
│   └── email-notification.service.ts
│       ├── sendNotification(data)
│       └── updateStatusAndNotify(id, status, data)
│
├── components/
│   ├── application-list/
│   │   ├── application-list.component.ts
│   │   ├── application-list.component.html
│   │   └── application-list.component.css
│   │
│   └── application-response-modal/
│       ├── application-response-modal.component.ts
│       ├── application-response-modal.component.html
│       └── application-response-modal.component.css
│
└── app.module.ts (ajouter les imports)

BACKEND (Spring Boot)
├── src/main/java/org/example/b2bmodule/
│   ├── dto/
│   │   └── EmailNotificationDTO.java ✅ CRÉÉ
│   │
│   ├── service/
│   │   └── EmailService.java ✅ CRÉÉ
│   │
│   ├── controller/
│   │   └── ApplicationController.java ✅ MODIFIÉ
│   │       ├── @PostMapping("/notify")
│   │       └── @PutMapping("/{id}/status-notify")
│   │
│   └── config/
│       └── Inclut les imports nécessaires
│
└── src/main/resources/
    └── application.properties ✅ MODIFIÉ
        ├── spring.mail.host
        ├── spring.mail.port
        ├── spring.mail.username
        ├── spring.mail.password
        └── SMTP configuration
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Backend (DÉJÀ FAIT ✅)
- [x] Créer EmailNotificationDTO
- [x] Créer EmailService avec HTML professionnel
- [x] Ajouter 2 endpoints dans ApplicationController
- [x] Configurer SMTP Gmail dans application.properties
- [x] Activer CORS avec @CrossOrigin

### Frontend (À FAIRE)
- [ ] Créer EmailNotificationService
- [ ] Créer ApplicationResponseModalComponent
- [ ] Modifier ApplicationListComponent
- [ ] Ajouter imports dans AppModule
- [ ] Importer Angular Material modules
- [ ] Tester avec le backend

---

## 🎨 INTERFACE UTILISATEUR

### État NORMAL
```
┌─────────────────────────────────────┐
│ Candidat │ Poste │ Entreprise │ ✅ ❌ │
├─────────────────────────────────────┤
│ John     │ Dev   │ TechCorp   │ ○  ○  │
│ Jane     │ PM    │ DataPro    │ ○  ○  │
└─────────────────────────────────────┘
(Boutons actifs pour les candidatures PENDING)
```

### État LOADING
```
┌─────────────────────────────────────┐
│ ... Envoi en cours ...              │
│ ◐ (spinner)                         │
│ [Annuler] [Envoi...]                │
└─────────────────────────────────────┘
(Boutons désactivés)
```

### État SUCCESS
```
┌─────────────────────────────────────┐
│ ✅ Email envoyé avec succès!        │
│ (Auto-fermeture après 2 secondes)   │
└─────────────────────────────────────┘
```

### État ERROR
```
┌─────────────────────────────────────┐
│ ❌ Erreur: Email invalide           │
│ [Annuler] [Réessayer]               │
└─────────────────────────────────────┘
```

---

**C'est l'architecture complète du système! 🚀📧✨**

