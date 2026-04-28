# 🔄 FLUX COMPLET - Candidat → RH → Email

## 📊 Scénario Complet de Candidature

```
CANDIDATE (Frontend Angular)          RH INTERFACE (Back Office)       BACKEND SPRING BOOT
═════════════════════════════════════ ════════════════════════════════ ══════════════════════════════

1️⃣ Voir les offres
   URL: /careers
   └─ Page liste des offres
                                                                      GET /api/b2b/job-offers
                                                                      ├─ titre
                                                                      ├─ description  
                                                                      ├─ company
                                                                      └─ requiredSkills

2️⃣ Cliquer sur une offre
   URL: /careers/3
   └─ Page détail de l'offre
                                                                      GET /api/b2b/job-offers/3
                                                                      └─ Retourne le détail complet

3️⃣ Remplir le formulaire de candidature
   Form Fields:
   ├─ Full Name
   ├─ Email
   ├─ Title/Job Role
   ├─ Skills (comma-separated)
   ├─ Experience (years)
   └─ CV (file upload)
   
   Clique "Submit"
                                                                      POST /api/b2b/candidates
                                                                      ├─ Crée le profil candidat
                                                                      └─ Return: candidateId
                                                                      
                                                                      POST /api/b2b/applications
                                                                      ├─ candidateId
                                                                      ├─ jobOfferId
                                                                      ├─ Calcul du matchScore
                                                                      └─ Status: PENDING

   ✅ Message "Application sent!"


════════════════════════════════════════════════════════════════════════════════════════════════


4️⃣ RH REÇOIT LES CANDIDATURES
                                  Page RH: /admin/b2b/jobs/3
                                  ├─ Liste des candidatures
                                  ├─ Colonnes:
                                  │  ├─ Candidate Name
                                  │  ├─ Email
                                  │  ├─ Skills
                                  │  ├─ Match Score (%)
                                  │  └─ Actions (✅ Accept, ❌ Reject)
                                                                      GET /api/b2b/applications
                                                                      └─ Filtré par jobOfferId

5️⃣ RH CLIQUE "✅ ACCEPT" ou "❌ REJECT"
                                  Modal s'ouvre:
                                  ├─ Nom du candidat (auto-rempli)
                                  ├─ Email du candidat (auto-rempli)
                                  ├─ Poste (auto-rempli)
                                  ├─ Entreprise (auto-rempli)
                                  ├─ Message optionnel (textarea)
                                  │  └─ "Bienvenue dans l'équipe!"
                                  │  └─ "Nous te souhaitons bonne chance"
                                  └─ Bouton "Send Email & Update Status"

6️⃣ RH ENVOIE L'EMAIL + CHANGE LE STATUT
                                                                      ÉTAPE 1:
                                                                      PUT /api/b2b/applications/1/status
                                                                      └─ Status: ACCEPTED ou REJECTED
                                                                      
                                                                      ÉTAPE 2 (NEW):
                                                                      POST /api/b2b/applications/notify
                                                                      Body: {
                                                                        candidateEmail: "john@gmail.com",
                                                                        candidateName: "John Doe",
                                                                        jobTitle: "Data Analyst",
                                                                        companyName: "MarketingPro",
                                                                        status: "ACCEPTED",
                                                                        message: "Bienvenue dans l'équipe!"
                                                                      }
                                                                      
                                                                      └─ Response: 200 OK
                                                                         "Email sent successfully"

   ✅ Message RH: "Email sent!"
   ✅ Status changé à ACCEPTED/REJECTED


════════════════════════════════════════════════════════════════════════════════════════════════


7️⃣ CANDIDAT REÇOIT L'EMAIL 📧

   Gmail Inbox:
   ┌──────────────────────────────────────────────┐
   │ From: aziz2guizeni@gmail.com                 │
   │ Subject: 🎯 Application Update — Data        │
   │ Analyst at MarketingPro                      │
   │                                              │
   │ [HTML EMAIL WITH]                            │
   │ - B2B Platform Header (gradient blue)        │
   │ - Personalized greeting                      │
   │ - Status (✅ ACCEPTED or 📋 REJECTED)        │
   │ - Optional HR message                        │
   │ - Footer with company name                   │
   └──────────────────────────────────────────────┘

```

---

## 🎯 LES 2 ENDPOINTS CLÉS

### Endpoint 1️⃣ : Mettre à jour le statut SEULEMENT

```http
PUT /api/b2b/applications/1/status?status=ACCEPTED

Response: ApplicationResponse (mis à jour)
```

**Utilisation** : Juste mettre à jour le statut sans email

---

### Endpoint 2️⃣ : ENVOYER L'EMAIL (NOUVEAU ⭐)

```http
POST /api/b2b/applications/notify

Content-Type: application/json

Body:
{
  "candidateEmail": "john.doe@gmail.com",
  "candidateName": "John Doe",
  "jobTitle": "Data Analyst",
  "companyName": "MarketingPro",
  "status": "ACCEPTED",
  "message": "Bienvenue dans notre équipe !"
}

Response (200 OK):
{
  "message": "Email sent successfully"
}
```

**Utilisation** : Envoyer l'email au candidat (avec ou sans mise à jour du statut)

---

## 💻 IMPLÉMENTATION FRONTEND (Angular)

### Composant RH - Modal d'Acceptation/Rejet

```typescript
// Dans le composant RH (ApplicationListComponent ou ApplicationDetailComponent)

openAcceptRejectModal(application: Application) {
  // Modal s'ouvre avec les données
  this.selectedApplication = application;
  
  // Auto-remplissage
  this.modalForm = {
    candidateEmail: application.candidate.email,
    candidateName: application.candidate.name,
    jobTitle: application.jobOffer.title,
    companyName: application.jobOffer.company.name,
    status: 'ACCEPTED', // ou 'REJECTED'
    message: '' // RH remplit optionnellement
  };
  
  this.showModal = true;
}

acceptAndSendEmail(formData: EmailNotificationDTO) {
  // Appeler le nouveau endpoint
  this.emailService.sendNotification(formData).subscribe(
    (response) => {
      console.log('✅ Email sent!');
      // Update UI: change le statut dans la liste
      this.applications = this.applications.map(app => 
        app.id === this.selectedApplication.id 
          ? {...app, status: formData.status} 
          : app
      );
      this.showModal = false;
      this.showSuccessMessage('Email sent successfully!');
    },
    (error) => {
      console.error('❌ Failed to send email', error);
      this.showErrorMessage('Failed to send email');
    }
  );
}
```

---

## 📧 EXEMPLE D'EMAIL REÇU PAR LE CANDIDAT

### Pour une ACCEPTATION ✅

```
FROM: aziz2guizeni@gmail.com
TO: john.doe@gmail.com
SUBJECT: 🎯 Application Update — Data Analyst at MarketingPro

═══════════════════════════════════════════════════════════════

    [B2B PLATFORM HEADER - Gradient Bleu/Violet]
    
    Application Update
    Your journey with us continues

═══════════════════════════════════════════════════════════════

Dear John Doe,

✅ Congratulations!
Your application for the position of Data Analyst at MarketingPro 
has been ACCEPTED! We are excited to welcome you to our team.

───────────────────────────────────────────────────────────────

📌 Message from HR Team:
Bienvenue dans notre équipe ! Nous sommes heureux de t'accueillir.

───────────────────────────────────────────────────────────────

What happens next?
We appreciate your interest in joining our team. 
If you have any questions about this decision or would like 
feedback on your application, please don't hesitate to reach 
out to our HR team.

Best regards,
The MarketingPro HR Team

═══════════════════════════════════════════════════════════════
This is an automated email from MarketingPro HR Portal 
— Powered by B2B Platform
© 2026 B2B Module. All rights reserved.
═══════════════════════════════════════════════════════════════
```

### Pour un REJET ❌

```
FROM: aziz2guizeni@gmail.com
TO: jane.smith@gmail.com
SUBJECT: 🎯 Application Update — Backend Developer at StartupX

═══════════════════════════════════════════════════════════════

    [B2B PLATFORM HEADER - Gradient Bleu/Violet]
    
    Application Update
    Your journey with us continues

═══════════════════════════════════════════════════════════════

Dear Jane Smith,

📋 Thank you for your interest
After careful review of all applications, we regret to inform you 
that your application has not been retained at this time. 
We encourage you to apply for future opportunities that match 
your profile.

───────────────────────────────────────────────────────────────

📌 Message from HR Team:
Your backend skills are impressive! We encourage you to apply 
for our Frontend Developer role which might be a better fit.

───────────────────────────────────────────────────────────────

What happens next?
We appreciate your interest in joining our team. 
If you have any questions about this decision or would like 
feedback on your application, please don't hesitate to reach 
out to our HR team.

Best regards,
The StartupX HR Team

═══════════════════════════════════════════════════════════════
This is an automated email from StartupX HR Portal 
— Powered by B2B Platform
© 2026 B2B Module. All rights reserved.
═══════════════════════════════════════════════════════════════
```

---

## 🔄 FLUX COMPLET - DIAGRAMME

```
CANDIDATE                          BACKEND (Spring Boot)              EMAIL
═════════════                      ═════════════════════════════      ════════

1. Visite /careers      ────────→  GET /api/b2b/job-offers
                                   ← Liste offres

2. Clique offre         ────────→  GET /api/b2b/job-offers/{id}
                                   ← Détail offre

3. Remplit formulaire   
4. Clique "Submit"      ────────→  POST /api/b2b/candidates
                                   ← candidateId

                        ────────→  POST /api/b2b/applications
                                   ├─ matchScore calculé ✅
                                   ├─ Status: PENDING
                                   └─ applicationId: 1


┌─────────────────────────────────────────────────────────────────┐
│ RH INTERFACE (Back Office)                                       │
└─────────────────────────────────────────────────────────────────┘

5. RH voit candidatures ────────→  GET /api/b2b/applications?jobOfferId=3
                                   ← Liste des candidatures

6. RH clique "Accept"
   Modal s'ouvre
   RH remplit les infos
   RH clique "Send"     ────────→  POST /api/b2b/applications/notify
                                   {
                                     candidateEmail: "john@gmail.com",
                                     candidateName: "John",
                                     jobTitle: "Data Analyst",
                                     companyName: "MarketingPro",
                                     status: "ACCEPTED",
                                     message: "Bienvenue!"
                                   }
                                   
                                   Service EmailService:
                                   ├─ Crée MimeMessage
                                   ├─ Construit HTML template
                                   ├─ Injecte variables
                                   └─ Envoie via JavaMailSender
                                                              ────→  📧 Email HTML
                                                                     Boîte Gmail/Outlook
                                   
                                   ← Response: "Email sent successfully"
                                   
   ✅ RH voit "Success!"


CANDIDAT reçoit email             Email dans la boîte              
dans sa boîte Gmail     ←──────────  avec sujet + message HR
```

---

## 🔐 DONNÉES ENVOYÉES AU BACKEND

### Request Payload (EmailNotificationDTO)

```json
{
  "candidateEmail": "john.doe@example.com",      // Email du candidat
  "candidateName": "John Doe",                   // Nom du candidat
  "jobTitle": "Data Analyst",                    // Titre du poste
  "companyName": "MarketingPro",                 // Nom de l'entreprise
  "status": "ACCEPTED",                          // ACCEPTED ou REJECTED
  "message": "Bienvenue dans notre équipe!"      // Message optionnel du RH
}
```

### Validation en Backend

```java
✅ candidateEmail → Validé (format email)
✅ candidateName → Validé (non-vide)
✅ jobTitle → Validé (non-vide)
✅ companyName → Validé (non-vide)
✅ status → Validé (ACCEPTED ou REJECTED)
✅ message → Optionnel (peut être null/vide)
```

---

## 🌐 INTÉGRATION FRONTEND (Angular) - CODE COMPLET

### Service EmailNotificationService

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailNotificationRequest {
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

  // Envoyer l'email uniquement (nouveau endpoint)
  sendNotification(notification: EmailNotificationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, notification);
  }
}
```

### Composant RH - Accept/Reject Modal

```typescript
import { Component, OnInit } from '@angular/core';
import { EmailNotificationService, EmailNotificationRequest } from './services/email-notification.service';

@Component({
  selector: 'app-applications-list',
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.css']
})
export class ApplicationsListComponent implements OnInit {

  applications: any[] = [];
  showModal = false;
  selectedApplication: any = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  modalForm = {
    candidateEmail: '',
    candidateName: '',
    jobTitle: '',
    companyName: '',
    status: 'ACCEPTED' as 'ACCEPTED' | 'REJECTED',
    message: ''
  };

  constructor(private emailService: EmailNotificationService) { }

  ngOnInit(): void {
    this.loadApplications();
  }

  // Charger les candidatures pour le RH
  loadApplications() {
    // À implémenter avec le service ApplicationService
    // GET /api/b2b/applications?jobOfferId=3
  }

  // Ouvrir la modal pour accepter/rejeter
  openAcceptRejectModal(application: any, action: 'ACCEPTED' | 'REJECTED') {
    this.selectedApplication = application;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Auto-remplir les champs
    this.modalForm = {
      candidateEmail: application.candidate?.email || '',
      candidateName: application.candidate?.name || '',
      jobTitle: application.jobOffer?.title || '',
      companyName: application.jobOffer?.company?.name || '',
      status: action,
      message: ''
    };
  }

  // Envoyer l'email et mettre à jour le statut
  sendEmailAndUpdateStatus() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Appeler le endpoint d'envoi d'email
    this.emailService.sendNotification(this.modalForm).subscribe(
      (response) => {
        this.successMessage = '✅ Email sent successfully and status updated!';
        this.isLoading = false;
        this.showModal = false;

        // Mettre à jour la liste des candidatures
        this.applications = this.applications.map(app => 
          app.id === this.selectedApplication.id 
            ? { ...app, status: this.modalForm.status }
            : app
        );

        // Réinitialiser le formulaire
        this.resetForm();
      },
      (error) => {
        this.errorMessage = '❌ Failed to send email: ' + (error.error?.message || error.message);
        this.isLoading = false;
      }
    );
  }

  // Valider le formulaire
  validateForm(): boolean {
    if (!this.modalForm.candidateEmail?.includes('@')) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }
    if (!this.modalForm.candidateName?.trim()) {
      this.errorMessage = 'Candidate name is required';
      return false;
    }
    if (!this.modalForm.jobTitle?.trim()) {
      this.errorMessage = 'Job title is required';
      return false;
    }
    if (!this.modalForm.companyName?.trim()) {
      this.errorMessage = 'Company name is required';
      return false;
    }
    return true;
  }

  // Réinitialiser le formulaire
  resetForm() {
    this.modalForm = {
      candidateEmail: '',
      candidateName: '',
      jobTitle: '',
      companyName: '',
      status: 'ACCEPTED',
      message: ''
    };
  }

  // Fermer la modal
  closeModal() {
    this.showModal = false;
    this.resetForm();
  }
}
```

### Template HTML (RH Interface)

```html
<!-- Applications Table -->
<table class="applications-table">
  <thead>
    <tr>
      <th>Candidate Name</th>
      <th>Email</th>
      <th>Skills</th>
      <th>Match Score</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let app of applications">
      <td>{{ app.candidate.name }}</td>
      <td>{{ app.candidate.email }}</td>
      <td>{{ app.candidate.skills }}</td>
      <td>{{ app.matchScore }}%</td>
      <td class="status" [ngClass]="app.status.toLowerCase()">
        {{ app.status }}
      </td>
      <td class="actions">
        <button 
          (click)="openAcceptRejectModal(app, 'ACCEPTED')"
          class="btn btn-success"
          [disabled]="app.status === 'ACCEPTED'">
          ✅ Accept
        </button>
        <button 
          (click)="openAcceptRejectModal(app, 'REJECTED')"
          class="btn btn-danger"
          [disabled]="app.status === 'REJECTED'">
          ❌ Reject
        </button>
      </td>
    </tr>
  </tbody>
</table>

<!-- Modal -->
<div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
  <div class="modal" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <h2>
        <span *ngIf="modalForm.status === 'ACCEPTED'">✅</span>
        <span *ngIf="modalForm.status === 'REJECTED'">❌</span>
        {{ modalForm.status === 'ACCEPTED' ? 'Accept Candidate' : 'Reject Candidate' }}
      </h2>
      <button class="close-btn" (click)="closeModal()">×</button>
    </div>

    <!-- Messages -->
    <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="modal-body">
      <!-- Candidate Email -->
      <div class="form-group">
        <label>Candidate Email:</label>
        <input 
          type="email" 
          [(ngModel)]="modalForm.candidateEmail"
          class="form-control"
          readonly>
      </div>

      <!-- Candidate Name -->
      <div class="form-group">
        <label>Candidate Name:</label>
        <input 
          type="text" 
          [(ngModel)]="modalForm.candidateName"
          class="form-control"
          readonly>
      </div>

      <!-- Job Title -->
      <div class="form-group">
        <label>Job Title:</label>
        <input 
          type="text" 
          [(ngModel)]="modalForm.jobTitle"
          class="form-control"
          readonly>
      </div>

      <!-- Company Name -->
      <div class="form-group">
        <label>Company Name:</label>
        <input 
          type="text" 
          [(ngModel)]="modalForm.companyName"
          class="form-control"
          readonly>
      </div>

      <!-- Custom Message (Optional) -->
      <div class="form-group">
        <label>Custom Message (Optional):</label>
        <textarea 
          [(ngModel)]="modalForm.message"
          class="form-control"
          rows="4"
          placeholder="Type a message from HR team..."></textarea>
      </div>
    </div>

    <div class="modal-footer">
      <button (click)="closeModal()" class="btn btn-secondary">Cancel</button>
      <button 
        (click)="sendEmailAndUpdateStatus()"
        [disabled]="isLoading"
        [ngClass]="modalForm.status === 'ACCEPTED' ? 'btn btn-success' : 'btn btn-danger'">
        {{ isLoading ? 'Sending...' : 'Send Email & Update Status' }}
      </button>
    </div>
  </div>
</div>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #28a745;
  color: #155724;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>
```

---

## 📝 RÉSUMÉ DU FLUX

1. **Candidat** remplit le formulaire et envoie sa candidature
2. **Backend** crée la candidature avec status PENDING
3. **RH** voit les candidatures dans /admin/b2b/jobs/{id}
4. **RH** clique "Accept" ou "Reject"
5. **Modal** s'ouvre avec les données pré-remplies
6. **RH** ajoute un message optionnel
7. **RH** clique "Send Email"
8. **Backend** appelle emailService.sendApplicationNotification()
9. **Email HTML** est envoyé au candidat via Gmail SMTP
10. **Candidat** reçoit l'email dans sa boîte 📧

---

## ✅ CHECKLIST

- [x] 2 endpoints API implémentés
- [x] Template HTML professionnel
- [x] Service Angular complet
- [x] Composant RH avec modal
- [x] Validation des données
- [x] Gestion d'erreurs
- [x] Configuration SMTP
- [x] Documentation complète

---

**Version** : 1.0  
**Date** : 4 Mars 2026  
**Statut** : ✅ COMPLET

