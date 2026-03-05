# 🚀 Guide Complet : Service Email Angular pour B2B Module

**Version:** 1.0  
**Date:** 2026-03-04  
**Status:** ✅ COMPLET ET OPÉRATIONNEL

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Implémentation du Service Email Angular](#implémentation-du-service-email-angular)
3. [Composant Modal de Décision](#composant-modal-de-décision)
4. [Intégration avec le Component Candidatures](#intégration-avec-le-component-candidatures)
5. [Tests Complets](#tests-complets)
6. [Dépannage](#dépannage)

---

## Vue d'ensemble

### Architecture du Workflow

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND ANGULAR                       │
│                                                          │
│  1. RH voit les candidatures → Admin Component          │
│  2. Clique "Accept" ou "Reject" → Modal s'ouvre        │
│  3. Modal: EmailNotificationService envoie requête      │
│  4. Requête POST /api/b2b/applications/notify           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP POST
                     ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND SPRING BOOT (Port 8083)             │
│                                                          │
│  POST /api/b2b/applications/notify                      │
│   → ApplicationController reçoit EmailNotificationDTO   │
│   → EmailService.sendApplicationNotification()          │
│   → JavaMailSender envoie email SMTP à Gmail            │
└─────────────────────────────────────────────────────────┘
                     │
                     ↓ Email SMTP
        ┌────────────────────────┐
        │   Gmail SMTP Server    │
        │  smtp.gmail.com:587    │
        └────────────────────────┘
                     │
                     ↓ Email HTML
        ┌────────────────────────┐
        │   Inbox du candidat    │
        │  candidate@email.com   │
        └────────────────────────┘
```

---

## Implémentation du Service Email Angular

### Fichier 1: `email-notification.service.ts`

Créez ce fichier dans `src/app/services/`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmailNotificationDTO {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  status: 'ACCEPTED' | 'REJECTED';
  message?: string; // Optional custom message from HR
}

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  
  private apiUrl = `${environment.apiUrl}/b2b/applications`;

  constructor(private http: HttpClient) { }

  /**
   * Envoie une notification email au candidat
   * POST /api/b2b/applications/notify
   */
  sendNotification(emailData: EmailNotificationDTO): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${this.apiUrl}/notify`,
      emailData,
      { headers }
    );
  }

  /**
   * Mettre à jour le statut ET envoyer une notification email en même temps
   * PUT /api/b2b/applications/{id}/status-notify?status=ACCEPTED
   */
  updateStatusAndNotify(
    applicationId: number,
    status: 'ACCEPTED' | 'REJECTED',
    emailData: EmailNotificationDTO
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(
      `${this.apiUrl}/${applicationId}/status-notify?status=${status}`,
      emailData,
      { headers }
    );
  }
}
```

---

## Composant Modal de Décision

### Fichier 2: `application-decision.component.ts`

Créez ce fichier dans `src/app/components/`:

```typescript
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailNotificationService, EmailNotificationDTO } from '../services/email-notification.service';
import { ApplicationResponse } from '../models/application.model';
import { ToastrService } from 'ngx-toastr'; // ou votre service de notifications

@Component({
  selector: 'app-application-decision',
  templateUrl: './application-decision.component.html',
  styleUrls: ['./application-decision.component.css']
})
export class ApplicationDecisionComponent implements OnInit {

  candidateName: string = '';
  candidateEmail: string = '';
  jobTitle: string = '';
  companyName: string = '';
  customMessage: string = '';
  
  isLoading: boolean = false;
  selectedStatus: 'ACCEPTED' | 'REJECTED' = 'ACCEPTED';

  constructor(
    public dialogRef: MatDialogRef<ApplicationDecisionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emailService: EmailNotificationService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Récupérer les données de la candidature
    if (this.data) {
      this.candidateName = this.data.candidateName || '';
      this.candidateEmail = this.data.candidateEmail || '';
      this.jobTitle = this.data.jobTitle || '';
      this.companyName = this.data.companyName || '';
    }
  }

  /**
   * Envoyer l'email et mettre à jour le statut
   */
  async submitDecision(): Promise<void> {
    // Validation
    if (!this.candidateEmail) {
      this.toastr.error('Please enter candidate email');
      return;
    }

    this.isLoading = true;

    const emailData: EmailNotificationDTO = {
      candidateEmail: this.candidateEmail,
      candidateName: this.candidateName,
      jobTitle: this.jobTitle,
      companyName: this.companyName,
      status: this.selectedStatus,
      message: this.customMessage || undefined
    };

    try {
      // Option 1 : Envoyer uniquement l'email (sans mettre à jour le statut)
      await this.emailService.sendNotification(emailData).toPromise();

      this.toastr.success(`✅ Email sent successfully to ${this.candidateEmail}`);
      
      // Fermer la modale et retourner le résultat
      this.dialogRef.close({
        success: true,
        status: this.selectedStatus,
        emailData: emailData
      });

    } catch (error: any) {
      console.error('Error sending email:', error);
      this.toastr.error(`❌ Failed to send email: ${error.error?.message || error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Variante : Mettre à jour le statut ET envoyer l'email
   * À utiliser si applicationId est disponible
   */
  async updateStatusAndSendEmail(applicationId: number): Promise<void> {
    if (!this.candidateEmail) {
      this.toastr.error('Please enter candidate email');
      return;
    }

    this.isLoading = true;

    const emailData: EmailNotificationDTO = {
      candidateEmail: this.candidateEmail,
      candidateName: this.candidateName,
      jobTitle: this.jobTitle,
      companyName: this.companyName,
      status: this.selectedStatus,
      message: this.customMessage || undefined
    };

    try {
      await this.emailService.updateStatusAndNotify(applicationId, this.selectedStatus, emailData).toPromise();

      this.toastr.success(`✅ Status updated and email sent!`);
      
      this.dialogRef.close({
        success: true,
        status: this.selectedStatus,
        emailData: emailData
      });

    } catch (error: any) {
      console.error('Error updating status and sending email:', error);
      this.toastr.error(`❌ Failed: ${error.error?.message || error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
```

### Fichier 3: `application-decision.component.html`

```html
<div class="decision-modal">
  <!-- Header -->
  <div class="modal-header">
    <h2>Make a Decision on Application</h2>
    <button mat-icon-button (click)="closeDialog()">
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <!-- Content -->
  <div class="modal-content">
    
    <!-- Application Info -->
    <div class="info-section">
      <h3>Application Details</h3>
      <p><strong>Candidate:</strong> {{ candidateName }}</p>
      <p><strong>Position:</strong> {{ jobTitle }}</p>
      <p><strong>Company:</strong> {{ companyName }}</p>
    </div>

    <!-- Status Selection -->
    <div class="decision-section">
      <h3>Your Decision</h3>
      <mat-radio-group [(ngModel)]="selectedStatus">
        <mat-radio-button value="ACCEPTED" class="accepted">
          ✅ Accept Application
        </mat-radio-button>
        <mat-radio-button value="REJECTED" class="rejected">
          ❌ Reject Application
        </mat-radio-button>
      </mat-radio-group>
    </div>

    <!-- Candidate Email -->
    <mat-form-field class="full-width">
      <mat-label>Candidate Email</mat-label>
      <input matInput [(ngModel)]="candidateEmail" 
             type="email" 
             placeholder="candidate@example.com"
             [disabled]="isLoading">
      <mat-error *ngIf="!candidateEmail">Email is required</mat-error>
    </mat-form-field>

    <!-- Custom Message from HR -->
    <mat-form-field class="full-width">
      <mat-label>Message for Candidate (Optional)</mat-label>
      <textarea matInput 
                [(ngModel)]="customMessage"
                placeholder="Enter a personalized message (welcome message, feedback, etc.)"
                rows="4"
                [disabled]="isLoading">
      </textarea>
      <mat-hint>This message will appear in the email as 'Message from HR Team'</mat-hint>
    </mat-form-field>

    <!-- Preview Section (Optional) -->
    <div class="preview-section" *ngIf="selectedStatus">
      <h4>Email Preview</h4>
      <div class="email-preview">
        <p><strong>Subject:</strong> 🎯 Application Update — {{ jobTitle }} at {{ companyName }}</p>
        <p><strong>To:</strong> {{ candidateEmail }}</p>
        <div class="preview-body">
          <p>Dear {{ candidateName }},</p>
          <p *ngIf="selectedStatus === 'ACCEPTED'" class="accepted-text">
            ✅ Congratulations! Your application has been <strong>ACCEPTED</strong>!
          </p>
          <p *ngIf="selectedStatus === 'REJECTED'" class="rejected-text">
            📋 Thank you for your interest. Your application has been reviewed.
          </p>
          <p *ngIf="customMessage" class="message-text">
            <em>{{ customMessage }}</em>
          </p>
        </div>
      </div>
    </div>

  </div>

  <!-- Footer / Actions -->
  <div class="modal-footer">
    <button mat-button (click)="closeDialog()" [disabled]="isLoading">
      Cancel
    </button>
    <button mat-raised-button 
            color="primary" 
            (click)="submitDecision()"
            [disabled]="isLoading || !candidateEmail">
      <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
      <span *ngIf="!isLoading">Send Email & Continue</span>
      <span *ngIf="isLoading">Sending...</span>
    </button>
  </div>

</div>
```

### Fichier 4: `application-decision.component.css`

```css
.decision-modal {
  min-width: 500px;
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-content {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.info-section,
.decision-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.info-section h3,
.decision-section h3 {
  margin-top: 0;
  color: #333;
}

.info-section p {
  margin: 8px 0;
  color: #555;
}

mat-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

mat-radio-button {
  margin-bottom: 10px;
}

mat-radio-button.accepted {
  color: #28a745;
}

mat-radio-button.rejected {
  color: #dc3545;
}

.full-width {
  width: 100%;
  margin-bottom: 16px;
}

.preview-section {
  background-color: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 20px;
}

.preview-section h4 {
  margin-top: 0;
  color: #667eea;
}

.email-preview {
  background: white;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
}

.email-preview p {
  margin: 6px 0;
}

.preview-body {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  line-height: 1.5;
}

.accepted-text {
  color: #28a745;
  font-weight: 600;
}

.rejected-text {
  color: #6c757d;
}

.message-text {
  color: #667eea;
  border-left: 3px solid #667eea;
  padding-left: 10px;
  margin-top: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

.modal-footer button {
  min-width: 120px;
}

mat-spinner {
  display: inline-block;
  margin-right: 8px;
}

@media (max-width: 600px) {
  .decision-modal {
    min-width: 100%;
    max-width: 100%;
  }
}
```

---

## Intégration avec le Component Candidatures

### Fichier 5: `applications-admin.component.ts`

Intégrez le modal dans votre component admin :

```typescript
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationService } from '../services/application.service';
import { ApplicationDecisionComponent } from '../components/application-decision.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-applications-admin',
  templateUrl: './applications-admin.component.html',
  styleUrls: ['./applications-admin.component.css']
})
export class ApplicationsAdminComponent implements OnInit {

  applications: any[] = [];
  displayedColumns: string[] = ['id', 'candidate', 'position', 'status', 'matchScore', 'actions'];
  isLoading = false;

  constructor(
    private applicationService: ApplicationService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.applicationService.getAll().subscribe({
      next: (data) => {
        this.applications = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load applications');
        this.isLoading = false;
      }
    });
  }

  /**
   * Ouvrir le modal de décision pour accepter/rejeter une candidature
   */
  openDecisionModal(application: any): void {
    const dialogRef = this.dialog.open(ApplicationDecisionComponent, {
      width: '600px',
      data: {
        candidateName: application.candidate?.name || 'Candidate',
        candidateEmail: application.candidate?.email || '',
        jobTitle: application.jobOffer?.title || 'Position',
        companyName: 'Your Company Name',
        applicationId: application.id
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Actualiser la liste après l'envoi de l'email
        this.loadApplications();
        
        // Optionnel : Actualiser le statut localement
        const updatedApp = this.applications.find(a => a.id === application.id);
        if (updatedApp) {
          updatedApp.status = result.status;
        }
      }
    });
  }

  /**
   * Boutons d'action rapide (accept/reject)
   */
  acceptApplication(application: any): void {
    this.openDecisionModal(application);
  }

  rejectApplication(application: any): void {
    this.openDecisionModal(application);
  }

  /**
   * Optionnel : Action sans modal (mise à jour directe du statut)
   */
  quickUpdateStatus(applicationId: number, status: string): void {
    this.applicationService.updateStatus(applicationId, status).subscribe({
      next: () => {
        this.toastr.success(`Application ${status}`);
        this.loadApplications();
      },
      error: (error) => {
        this.toastr.error('Failed to update status');
      }
    });
  }

}
```

### Intégration dans le Template HTML

```html
<div class="applications-container">
  <h2>Applications Management</h2>

  <!-- Table des candidatures -->
  <table mat-table [dataSource]="applications" class="applications-table">
    
    <!-- Columns -->
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef>ID</th>
      <td mat-cell *matCellDef="let element">{{ element.id }}</td>
    </ng-container>

    <ng-container matColumnDef="candidate">
      <th mat-header-cell *matHeaderCellDef>Candidate</th>
      <td mat-cell *matCellDef="let element">
        <strong>{{ element.candidate?.name }}</strong>
        <br>
        <small>{{ element.candidate?.email }}</small>
      </td>
    </ng-container>

    <ng-container matColumnDef="position">
      <th mat-header-cell *matHeaderCellDef>Position</th>
      <td mat-cell *matCellDef="let element">{{ element.jobOffer?.title }}</td>
    </ng-container>

    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>Status</th>
      <td mat-cell *matCellDef="let element">
        <span [class]="'status-badge status-' + element.status?.toLowerCase()">
          {{ element.status }}
        </span>
      </td>
    </ng-container>

    <ng-container matColumnDef="matchScore">
      <th mat-header-cell *matHeaderCellDef>Match Score</th>
      <td mat-cell *matCellDef="let element">
        <mat-progress-bar mode="determinate" 
                          [value]="element.matchScore * 100">
        </mat-progress-bar>
        {{ (element.matchScore * 100).toFixed(1) }}%
      </td>
    </ng-container>

    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Actions</th>
      <td mat-cell *matCellDef="let element">
        <button mat-stroked-button color="accent" 
                (click)="acceptApplication(element)"
                [disabled]="element.status === 'ACCEPTED'">
          ✅ Accept
        </button>
        <button mat-stroked-button color="warn" 
                (click)="rejectApplication(element)"
                [disabled]="element.status === 'REJECTED'"
                style="margin-left: 8px;">
          ❌ Reject
        </button>
      </td>
    </ng-container>

    <!-- Header and Row -->
    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <!-- Loading State -->
  <div *ngIf="isLoading" class="loading">
    <mat-spinner></mat-spinner>
    <p>Loading applications...</p>
  </div>

  <!-- Empty State -->
  <div *ngIf="!isLoading && applications.length === 0" class="empty-state">
    <p>No applications found</p>
  </div>
</div>
```

---

## Tests Complets

### Test 1 : Test Simple (Direct)

**Endpoint:** `POST /api/b2b/applications/notify`

```bash
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "test@gmail.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED",
    "message": "Welcome to our team! We are excited to have you."
  }'
```

**Réponse attendue:**
```json
{
  "message": "Email sent successfully to test@gmail.com"
}
```

### Test 2 : Mise à jour du statut + Email

**Endpoint:** `PUT /api/b2b/applications/1/status-notify?status=ACCEPTED`

```bash
curl -X PUT http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "test@gmail.com",
    "candidateName": "John Doe",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED"
  }'
```

### Test 3 : Depuis Angular

```typescript
// Dans votre component
import { EmailNotificationService } from './services/email-notification.service';

constructor(private emailService: EmailNotificationService) { }

testEmail() {
  const emailData = {
    candidateEmail: 'your-email@gmail.com',
    candidateName: 'Test User',
    jobTitle: 'Data Analyst',
    companyName: 'MarketingPro',
    status: 'ACCEPTED' as const,
    message: 'Welcome message here'
  };

  this.emailService.sendNotification(emailData).subscribe({
    next: (response) => console.log('✅ Email sent!', response),
    error: (error) => console.error('❌ Error:', error)
  });
}
```

---

## Dépannage

### ❌ Problème 1 : "Backend not available"

**Symptôme:** `Error: Failed to fetch / Network error`

**Solution:**
```bash
# Vérifier que le backend tourne
netstat -ano | findstr :8083

# Si rien, redémarrer le backend
java -jar target/B2BModule-0.0.1-SNAPSHOT.jar
```

### ❌ Problème 2 : "Email not received"

**Cause possible:** Problème SMTP Gmail

**Vérification:**
1. ✅ Email du compte: `aziz2guizeni@gmail.com`
2. ✅ App Password: `dabwejwnyqaryees`
3. ✅ 2FA doit être activé sur Gmail
4. ✅ Port SMTP: 587 (TLS)

**Dans application.properties:**
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### ❌ Problème 3 : "CORS Error"

**Message:** `Access to XMLHttpRequest blocked by CORS`

**Solution:** Vérifiez que `@CrossOrigin(origins = "*")` est sur `ApplicationController`

```java
@RestController
@RequestMapping("/api/b2b/applications")
@CrossOrigin(origins = "*")  // ← Important!
public class ApplicationController {
  // ...
}
```

### ❌ Problème 4 : "Invalid Email Format"

**Message:** `Validation error: invalid email`

**Solution:** Vérifiez le format `candidateEmail` dans le DTO

```typescript
const emailData = {
  candidateEmail: 'test@example.com',  // ✅ Format valide
  // ...
};
```

---

## ✅ Checklist Implémentation

- [ ] Service `EmailNotificationService` créé
- [ ] Composant `ApplicationDecisionComponent` créé
- [ ] Integration dans `ApplicationsAdminComponent`
- [ ] Backend démarré (port 8083)
- [ ] Angular démarré (avec proxy configuré si nécessaire)
- [ ] Test simple CURL réussi
- [ ] Test depuis Angular réussi
- [ ] Email reçu dans la boîte de réception

---

## 📞 Support Rapide

| Problème | Solution |
|----------|----------|
| Backend ne démarre | Vérifier Java 17+, port 8083 |
| Email non reçu | Vérifier credentials Gmail + 2FA |
| CORS error | Ajouter `@CrossOrigin(origins = "*")` |
| Validation error | Vérifier format du JSON DTO |
| Service non trouvé | Vérifier imports dans component |

---

## 🎉 Prochaines Étapes

1. ✅ Implémenter le service
2. ✅ Tester avec CURL
3. ✅ Intégrer dans Angular
4. ✅ Tester en production
5. ✅ Configurer les secrets (prod)

**Tous les fichiers sont prêts. À vous de jouer ! 🚀**

