# 📱 Guide d'Intégration Frontend Angular - Notification Email

## 🎯 Vue d'ensemble

Ce guide montre comment intégrer le système de notification email dans votre interface Angular.

---

## 1. Service Angular pour les Emails

### Créez `src/app/services/email.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailNotification {
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
export class EmailService {
  private readonly API_URL = 'http://localhost:8083/api/b2b/applications';

  constructor(private http: HttpClient) {}

  /**
   * Envoie une notification email
   */
  sendNotification(notification: EmailNotification): Observable<any> {
    return this.http.post(`${this.API_URL}/notify`, notification);
  }

  /**
   * Met à jour le statut et envoie une notification email
   */
  updateStatusAndNotify(
    id: number,
    status: 'ACCEPTED' | 'REJECTED',
    notification: EmailNotification
  ): Observable<any> {
    return this.http.put(
      `${this.API_URL}/${id}/status-notify?status=${status}`,
      notification
    );
  }
}
```

---

## 2. Composant Modal d'Acceptation

### Créez `src/app/components/application-decision-modal/application-decision-modal.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailService, EmailNotification } from '../../services/email.service';
import { ApplicationService } from '../../services/application.service';

export interface ApplicationDecisionData {
  applicationId: number;
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
}

@Component({
  selector: 'app-application-decision-modal',
  templateUrl: './application-decision-modal.component.html',
  styleUrls: ['./application-decision-modal.component.css']
})
export class ApplicationDecisionModalComponent {
  
  candidateEmail: string;
  candidateName: string;
  personalMessage: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<ApplicationDecisionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDecisionData,
    private emailService: EmailService,
    private applicationService: ApplicationService
  ) {
    this.candidateEmail = data.candidateEmail;
    this.candidateName = data.candidateName;
  }

  /**
   * Accepter la candidature et envoyer un email
   */
  acceptApplication(): void {
    if (!this.validateEmail()) {
      this.errorMessage = 'Email invalide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const notification: EmailNotification = {
      candidateEmail: this.candidateEmail,
      candidateName: this.candidateName,
      jobTitle: this.data.jobTitle,
      companyName: this.data.companyName,
      status: 'ACCEPTED',
      message: this.personalMessage || undefined
    };

    this.emailService.updateStatusAndNotify(
      this.data.applicationId,
      'ACCEPTED',
      notification
    ).subscribe(
      (response) => {
        this.isLoading = false;
        this.successMessage = '✅ Email d\'acceptation envoyé avec succès!';
        setTimeout(() => {
          this.dialogRef.close({ success: true, status: 'ACCEPTED' });
        }, 2000);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = `❌ Erreur: ${error.error?.body || error.message}`;
      }
    );
  }

  /**
   * Refuser la candidature et envoyer un email
   */
  rejectApplication(): void {
    if (!this.validateEmail()) {
      this.errorMessage = 'Email invalide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const notification: EmailNotification = {
      candidateEmail: this.candidateEmail,
      candidateName: this.candidateName,
      jobTitle: this.data.jobTitle,
      companyName: this.data.companyName,
      status: 'REJECTED',
      message: this.personalMessage || undefined
    };

    this.emailService.updateStatusAndNotify(
      this.data.applicationId,
      'REJECTED',
      notification
    ).subscribe(
      (response) => {
        this.isLoading = false;
        this.successMessage = '📧 Email de refus envoyé avec succès!';
        setTimeout(() => {
          this.dialogRef.close({ success: true, status: 'REJECTED' });
        }, 2000);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = `❌ Erreur: ${error.error?.body || error.message}`;
      }
    );
  }

  /**
   * Valider l'adresse email
   */
  private validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.candidateEmail);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
```

### Créez `src/app/components/application-decision-modal/application-decision-modal.component.html`

```html
<div class="modal-container">
  <h2 mat-dialog-title>📧 Décision de Candidature</h2>

  <mat-dialog-content>
    <!-- Messages d'erreur/succès -->
    <div *ngIf="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div *ngIf="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <!-- Formulaire -->
    <div class="form-group" *ngIf="!successMessage">
      <!-- Email du candidat -->
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Email du Candidat</mat-label>
        <input
          matInput
          [(ngModel)]="candidateEmail"
          type="email"
          placeholder="candidate@email.com"
          [disabled]="isLoading"
        />
        <mat-hint>Adresse email pour envoyer la notification</mat-hint>
      </mat-form-field>

      <!-- Message personnalisé (optionnel) -->
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Message Personnalisé (Optionnel)</mat-label>
        <textarea
          matInput
          [(ngModel)]="personalMessage"
          rows="4"
          placeholder="Message du RH au candidat..."
          [disabled]="isLoading"
        ></textarea>
        <mat-hint>Ex: Bienvenue dans notre équipe! Nous sommes ravis de vous accueillir.</mat-hint>
      </mat-form-field>

      <!-- Informations de la candidature -->
      <div class="info-section">
        <h4>📋 Résumé</h4>
        <p><strong>Candidat :</strong> {{ candidateName }}</p>
        <p><strong>Poste :</strong> {{ data.jobTitle }}</p>
        <p><strong>Entreprise :</strong> {{ data.companyName }}</p>
      </div>
    </div>
  </mat-dialog-content>

  <!-- Boutons d'action -->
  <mat-dialog-actions align="end" *ngIf="!successMessage">
    <button
      mat-button
      (click)="closeDialog()"
      [disabled]="isLoading"
    >
      Annuler
    </button>
    <button
      mat-raised-button
      color="warn"
      (click)="rejectApplication()"
      [disabled]="isLoading"
      class="reject-btn"
    >
      <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
      {{ isLoading ? 'Envoi en cours...' : '❌ Refuser & Envoyer Email' }}
    </button>
    <button
      mat-raised-button
      color="primary"
      (click)="acceptApplication()"
      [disabled]="isLoading"
      class="accept-btn"
    >
      <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
      {{ isLoading ? 'Envoi en cours...' : '✅ Accepter & Envoyer Email' }}
    </button>
  </mat-dialog-actions>
</div>
```

### Créez `src/app/components/application-decision-modal/application-decision-modal.component.css`

```css
.modal-container {
  min-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.full-width {
  width: 100%;
}

.alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info-section {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  border-left: 4px solid #667eea;
}

.info-section h4 {
  margin-top: 0;
  color: #667eea;
}

.info-section p {
  margin: 8px 0;
  font-size: 14px;
}

mat-dialog-actions {
  padding: 16px 0;
  gap: 8px;
}

.accept-btn {
  background-color: #28a745 !important;
}

.reject-btn {
  background-color: #dc3545 !important;
}

mat-spinner {
  display: inline-block;
  margin-right: 8px;
}
```

---

## 3. Intégration dans le listing des candidatures

### Dans votre composant `applications-list.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationService } from '../../services/application.service';
import { ApplicationDecisionModalComponent } from '../application-decision-modal/application-decision-modal.component';

@Component({
  selector: 'app-applications-list',
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.css']
})
export class ApplicationsListComponent implements OnInit {

  applications: any[] = [];
  loading: boolean = true;

  constructor(
    private applicationService: ApplicationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.applicationService.getAll().subscribe(
      (data) => {
        this.applications = data;
        this.loading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement', error);
        this.loading = false;
      }
    );
  }

  /**
   * Ouvre le modal de décision
   */
  openDecisionModal(application: any): void {
    const dialogRef = this.dialog.open(ApplicationDecisionModalComponent, {
      width: '600px',
      data: {
        applicationId: application.id,
        candidateEmail: application.candidate?.email || '',
        candidateName: application.candidate?.name || '',
        jobTitle: application.jobOffer?.title || '',
        companyName: application.jobOffer?.company?.name || 'Notre Entreprise'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // Recharger les applications ou mettre à jour la liste
        this.loadApplications();
      }
    });
  }
}
```

### Dans votre template `applications-list.component.html`

```html
<div class="applications-container">
  <h2>📋 Candidatures Reçues</h2>

  <mat-spinner *ngIf="loading"></mat-spinner>

  <mat-table [dataSource]="applications" class="mat-elevation-z8" *ngIf="!loading">
    <!-- Colonnes du tableau -->
    <ng-container matColumnDef="candidateName">
      <mat-header-cell *matHeaderCellDef>Candidat</mat-header-cell>
      <mat-cell *matCellDef="let element">
        {{ element.candidate?.name }}
      </mat-cell>
    </ng-container>

    <ng-container matColumnDef="jobTitle">
      <mat-header-cell *matHeaderCellDef>Poste</mat-header-cell>
      <mat-cell *matCellDef="let element">
        {{ element.jobOffer?.title }}
      </mat-cell>
    </ng-container>

    <ng-container matColumnDef="status">
      <mat-header-cell *matHeaderCellDef>Statut</mat-header-cell>
      <mat-cell *matCellDef="let element">
        <span [ngClass]="'status-' + (element.status | lowercase)">
          {{ element.status }}
        </span>
      </mat-cell>
    </ng-container>

    <ng-container matColumnDef="matchScore">
      <mat-header-cell *matHeaderCellDef>Match Score</mat-header-cell>
      <mat-cell *matCellDef="let element">
        <mat-progress-bar
          mode="determinate"
          [value]="element.matchScore"
        ></mat-progress-bar>
        {{ element.matchScore }}%
      </mat-cell>
    </ng-container>

    <ng-container matColumnDef="actions">
      <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
      <mat-cell *matCellDef="let element">
        <button
          mat-icon-button
          (click)="openDecisionModal(element)"
          matTooltip="Accepter/Refuser et envoyer un email"
          [disabled]="element.status !== 'PENDING'"
        >
          <mat-icon>mail</mat-icon>
        </button>
      </mat-cell>
    </ng-container>

    <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
  </mat-table>
</div>
```

---

## 4. Module Imports

Assurez-vous que votre module Angular importe :

```typescript
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    ApplicationDecisionModalComponent,
    ApplicationsListComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormsModule,
    HttpClientModule
  ]
})
export class ApplicationsModule { }
```

---

## 5. Workflow Utilisateur Final

### 🎬 Scénario Complet

1. **RH accède à `/admin/b2b/jobs/3`**
   - Vue la liste des candidatures pour l'offre

2. **RH voit une candidature intéressante**
   - Clique sur le bouton "📧" (actions)

3. **Modal s'ouvre** avec :
   - Email du candidat (pré-rempli ou éditable)
   - Message personnalisé (optionnel)
   - Résumé du candidat et du poste

4. **RH choisit : Accepter ou Refuser**
   - Optionnel : ajoute un message personnalisé
   - Clique "Accepter & Envoyer Email"

5. **Backend traite la demande** (2 secondes)
   - Met à jour le statut → `ACCEPTED`
   - Envoie l'email HTML au candidat
   - Retourne l'application mise à jour

6. **Frontend ferme le modal**
   - Recharge la liste
   - Affiche la confirmation

7. **Candidat reçoit l'email** 📧
   - Design professionnel
   - Message personnalisé du RH
   - Lien/instructions d'onboarding (optionnel)

---

## 6. Gestion des Erreurs

### Messages d'erreur du backend :

```typescript
// EmailService.ts - Handling errors
this.emailService.updateStatusAndNotify(...).subscribe(
  (response) => {
    // ✅ Succès
  },
  (error) => {
    if (error.status === 500) {
      console.error('Erreur serveur: email non envoyé');
    } else if (error.status === 400) {
      console.error('Données invalides');
    } else if (error.status === 404) {
      console.error('Application non trouvée');
    }
  }
);
```

---

## 7. Tests avec Postman

### Request 1 : Envoyer un email ACCEPTED

```
POST http://localhost:8083/api/b2b/applications/notify
Content-Type: application/json

{
  "candidateEmail": "aziz2guizeni@gmail.com",
  "candidateName": "Jean Dupont",
  "jobTitle": "Data Analyst",
  "companyName": "TechCorp",
  "status": "ACCEPTED",
  "message": "Bienvenue dans notre équipe! Nous sommes ravis de vous accueillir."
}
```

### Request 2 : Mettre à jour + Envoyer email

```
PUT http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED
Content-Type: application/json

{
  "candidateEmail": "aziz2guizeni@gmail.com",
  "candidateName": "Jean Dupont",
  "jobTitle": "Data Analyst",
  "companyName": "TechCorp",
  "status": "ACCEPTED",
  "message": "Bienvenue!"
}
```

---

## ✅ Checklist d'Implémentation

- [ ] Créer `EmailService` dans Angular
- [ ] Créer `ApplicationDecisionModalComponent`
- [ ] Intégrer le modal dans la liste des candidatures
- [ ] Ajouter les Material imports
- [ ] Tester localement avec un email valide
- [ ] Vérifier que les emails sont reçus
- [ ] Customiser les styles selon votre charte graphique
- [ ] Ajouter des animations/transitions
- [ ] Tester en production

---

**🎉 Vous êtes prêt à notifier les candidats !**

