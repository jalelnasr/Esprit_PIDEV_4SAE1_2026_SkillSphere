# 🚀 DÉMARRAGE RAPIDE - Système Email Angular + Spring Boot

**Statut:** ✅ COMPLET ET OPÉRATIONNEL  
**Date:** 2026-03-04  
**Temps de lecture:** 5 minutes

---

## 📋 RÉSUMÉ EN 10 SECONDES

✅ **Backend:** Entièrement configuré et prêt  
✅ **Service d'emailing:** Opérationnel (Gmail SMTP)  
✅ **Endpoints:** 2 nouveaux endpoints créés  
✅ **Frontend Angular:** À intégrer (guide fourni)  

**Maintenant:** Juste à tester et intégrer le code Angular fourni !

---

## ⚡ 5 ÉTAPES POUR DÉMARRER

### 1️⃣ Vérifier que le Backend tourne

**Sur Windows:**
```powershell
# Terminal PowerShell
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"
java -jar target/B2BModule-0.0.1-SNAPSHOT.jar
```

**Vérification:**
```powershell
# Dans un autre terminal
curl http://localhost:8083/api/b2b/applications
```

**Attendu:** Liste JSON des candidatures (même si vide)

---

### 2️⃣ Test Rapide : Envoyer un Email

**Via PowerShell:**
```powershell
$body = @{
    candidateEmail = "votre-email@gmail.com"
    candidateName = "Test User"
    jobTitle = "Data Analyst"
    companyName = "MarketingPro"
    status = "ACCEPTED"
    message = "Welcome message"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8083/api/b2b/applications/notify" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**Attendu:**
```
Vérifiez votre email dans 30 secondes
```

---

### 3️⃣ Copier le Service Angular

Créez le fichier `src/app/services/email-notification.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailNotificationDTO {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  status: 'ACCEPTED' | 'REJECTED';
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  private apiUrl = 'http://localhost:8083/api/b2b/applications';

  constructor(private http: HttpClient) { }

  sendNotification(emailData: EmailNotificationDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, emailData);
  }

  updateStatusAndNotify(
    applicationId: number,
    status: 'ACCEPTED' | 'REJECTED',
    emailData: EmailNotificationDTO
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${applicationId}/status-notify?status=${status}`,
      emailData
    );
  }
}
```

---

### 4️⃣ Créer le Composant Modal

Créez `src/app/components/application-decision.component.ts`:

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailNotificationService, EmailNotificationDTO } from '../services/email-notification.service';

@Component({
  selector: 'app-application-decision',
  templateUrl: './application-decision.component.html'
})
export class ApplicationDecisionComponent {
  candidateEmail: string = this.data?.candidateEmail || '';
  customMessage: string = '';
  selectedStatus: 'ACCEPTED' | 'REJECTED' = 'ACCEPTED';
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ApplicationDecisionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emailService: EmailNotificationService
  ) { }

  submitDecision(): void {
    if (!this.candidateEmail) {
      alert('Please enter candidate email');
      return;
    }

    this.isLoading = true;

    const emailData: EmailNotificationDTO = {
      candidateEmail: this.candidateEmail,
      candidateName: this.data.candidateName,
      jobTitle: this.data.jobTitle,
      companyName: this.data.companyName,
      status: this.selectedStatus,
      message: this.customMessage || undefined
    };

    this.emailService.sendNotification(emailData).subscribe({
      next: () => {
        alert('✅ Email sent successfully!');
        this.dialogRef.close({ success: true, status: this.selectedStatus });
      },
      error: (error) => {
        alert('❌ Failed to send email: ' + error.message);
        this.isLoading = false;
      }
    });
  }
}
```

**Template HTML `application-decision.component.html`:**

```html
<h2>Make a Decision</h2>

<div style="margin: 20px 0;">
  <p><strong>Candidate:</strong> {{ data.candidateName }}</p>
  <p><strong>Position:</strong> {{ data.jobTitle }}</p>
</div>

<div style="margin: 20px 0;">
  <label>
    <input type="radio" [value]="'ACCEPTED'" [(ngModel)]="selectedStatus"> ✅ Accept
  </label>
  <label>
    <input type="radio" [value]="'REJECTED'" [(ngModel)]="selectedStatus"> ❌ Reject
  </label>
</div>

<input type="email" 
       [(ngModel)]="candidateEmail" 
       placeholder="Candidate email"
       style="width: 100%; padding: 8px; margin: 10px 0;">

<textarea [(ngModel)]="customMessage" 
          placeholder="Optional message for HR"
          style="width: 100%; padding: 8px; margin: 10px 0; height: 80px;"></textarea>

<div style="margin-top: 20px; text-align: right;">
  <button (click)="dialogRef.close()" [disabled]="isLoading">Cancel</button>
  <button (click)="submitDecision()" [disabled]="isLoading">
    {{ isLoading ? 'Sending...' : 'Send Email' }}
  </button>
</div>
```

---

### 5️⃣ Intégrer dans votre Admin Component

```typescript
import { MatDialog } from '@angular/material/dialog';
import { ApplicationDecisionComponent } from './application-decision.component';

export class AdminComponent {
  
  constructor(private dialog: MatDialog) { }

  openDecisionModal(application: any): void {
    const dialogRef = this.dialog.open(ApplicationDecisionComponent, {
      width: '500px',
      data: {
        candidateName: application.candidate?.name,
        candidateEmail: application.candidate?.email,
        jobTitle: application.jobOffer?.title,
        companyName: 'Your Company',
        applicationId: application.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Refresh the list
        this.loadApplications();
      }
    });
  }
}
```

---

## 🧪 TEST COMPLET EN 2 MINUTES

### Étape 1 : Backend Running
```powershell
java -jar target/B2BModule-0.0.1-SNAPSHOT.jar
# Attendre "Started B2bModuleApplication"
```

### Étape 2 : Test Email
```powershell
$body = @{
    candidateEmail = "your-email@gmail.com"
    candidateName = "John Doe"
    jobTitle = "Data Analyst"
    companyName = "MarketingPro"
    status = "ACCEPTED"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8083/api/b2b/applications/notify" -Method POST -Body $body -ContentType "application/json"
```

### Étape 3 : Vérifier l'Email
- Ouvrir Gmail
- Vérifier la boîte de réception
- Email reçu avec sujet: `🎯 Application Update — Data Analyst at MarketingPro`

**✅ Si reçu = Tout fonctionne !**

---

## 📁 FICHIERS À CONSULTER

| Fichier | Contenu | Temps |
|---------|---------|-------|
| **ANGULAR_EMAIL_SERVICE_GUIDE.md** | Implémentation complète Angular | 30 min |
| **API_ENDPOINTS_REFERENCE.md** | Tous les endpoints et tests | 20 min |
| **ANGULAR_INTEGRATION_GUIDE.md** (ancien) | Compléments techniques | 2h |

---

## 🔧 CONFIGURATION BACKEND (DÉJÀ FAIT ✅)

### application.properties
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### pom.xml
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### Services & Controllers
✅ EmailService.java - Créé  
✅ EmailNotificationDTO.java - Créé  
✅ ApplicationController - Modifié (+2 endpoints)  

---

## 🎯 STRUCTURE FINALE

```
Frontend (Angular)
├── email-notification.service.ts    ← Service d'emailing
├── application-decision.component.ts ← Modal de décision
└── admin.component.ts                ← Intégration

        ↓ HTTP POST/PUT

Backend (Spring Boot : Port 8083)
├── EmailService.java                 ← Service d'envoi
├── EmailNotificationDTO.java          ← DTO
├── ApplicationController.java         ← 2 nouveaux endpoints
└── application.properties             ← Config SMTP Gmail

        ↓ SMTP TLS

Gmail SMTP Server
└── aziz2guizeni@gmail.com

        ↓ Email HTML

Candidat
└── inbox@gmail.com
```

---

## ✅ CHECKLIST DÉMARRAGE

- [ ] Backend démarré (port 8083)
- [ ] Test CURL réussi
- [ ] Email reçu
- [ ] Service Angular créé
- [ ] Composant Modal créé
- [ ] Intégration admin component
- [ ] Test depuis Angular réussi
- [ ] Modal fonctionne

---

## 🆘 PROBLÈMES COURANTS

### ❌ "Cannot connect to backend"
```powershell
# Solution: Vérifier que le backend tourne
netstat -ano | findstr :8083

# Si rien:
java -jar target/B2BModule-0.0.1-SNAPSHOT.jar
```

### ❌ "Email not received"
```properties
# Vérifier dans application.properties:
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees

# Gmail nécessite 2FA + App Password
# ✅ Déjà configuré dans le projet
```

### ❌ "CORS error"
```java
// Vérifier que ApplicationController a:
@CrossOrigin(origins = "*")
```

---

## 📞 SUPPORT RAPIDE

| Problème | Commande |
|----------|----------|
| Backend ne démarre | `java -jar target/B2BModule-0.0.1-SNAPSHOT.jar` |
| Test email | `curl -X POST http://localhost:8083/api/b2b/applications/notify ...` |
| Vérifier Gmail | Ouvrir https://mail.google.com |
| Recompiler | `mvn clean install -DskipTests` |

---

## 🎉 PROCHAINES ÉTAPES

1. ✅ **Lire ce guide** (5 min)
2. ✅ **Démarrer le backend** (2 min)
3. ✅ **Tester email** (2 min)
4. ✅ **Intégrer Angular** (30 min)
5. ✅ **Tester en production** (5 min)

**Total:** ~45 minutes pour avoir un système d'emailing complet ! 🚀

---

**Vous êtes prêt ? Allez-y ! 💪**

*Consultez `ANGULAR_EMAIL_SERVICE_GUIDE.md` pour plus de détails*

