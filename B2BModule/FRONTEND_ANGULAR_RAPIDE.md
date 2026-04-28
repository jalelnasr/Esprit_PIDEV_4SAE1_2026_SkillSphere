# 📱 GUIDE RAPIDE ANGULAR - 3 FICHIERS À CRÉER

## 🎯 RÉSUMÉ

Vous devez créer **3 fichiers** pour intégrer le système de mailing dans Angular.

Le backend a déjà les endpoints → Vous n'avez rien à modifier au backend! ✅

---

## 📋 FICHIER 1️⃣ : SERVICE

**Créer:** `src/app/services/email-notification.service.ts`

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
export class EmailNotificationService {

  private apiUrl = 'http://localhost:8083/api/b2b/applications';

  constructor(private http: HttpClient) { }

  // Envoyer un email
  sendNotification(data: EmailNotification): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, data);
  }

  // Mettre à jour statut + email
  updateStatusAndNotify(
    applicationId: number,
    status: 'ACCEPTED' | 'REJECTED',
    data: EmailNotification
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${applicationId}/status-notify?status=${status}`,
      data
    );
  }
}
```

---

## 🎨 FICHIER 2️⃣ : COMPOSANT MODALE

**Créer:** `src/app/components/application-response-modal/application-response-modal.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailNotificationService, EmailNotification } from '../../services/email-notification.service';

@Component({
  selector: 'app-application-response-modal',
  template: `
    <div class="modal-content">
      <h2 mat-dialog-title>Envoyer une notification au candidat</h2>
      
      <mat-dialog-content>
        <!-- Info du candidat -->
        <div class="candidate-info">
          <p><strong>👤 Candidat:</strong> {{ data.candidateName }}</p>
          <p><strong>💼 Poste:</strong> {{ data.jobTitle }}</p>
          <p><strong>🏢 Entreprise:</strong> {{ data.companyName }}</p>
        </div>

        <!-- Champ Email -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>📧 Email du candidat</mat-label>
          <input matInput [(ngModel)]="emailData.candidateEmail" type="email" required />
        </mat-form-field>

        <!-- Champ Statut -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>📌 Statut</mat-label>
          <mat-select [(ngModel)]="selectedStatus">
            <mat-option value="ACCEPTED">✅ Accepté</mat-option>
            <mat-option value="REJECTED">❌ Refusé</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Champ Message -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>💬 Message personalisé (optionnel)</mat-label>
          <textarea matInput [(ngModel)]="emailData.message" rows="3"></textarea>
        </mat-form-field>

        <!-- Messages -->
        <div *ngIf="errorMessage" class="error">❌ {{ errorMessage }}</div>
        <div *ngIf="successMessage" class="success">✅ {{ successMessage }}</div>

        <!-- Loader -->
        <div *ngIf="isLoading" class="loader">
          <mat-spinner diameter="30"></mat-spinner>
          <p>Envoi en cours...</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()" [disabled]="isLoading">
          Annuler
        </button>
        <button 
          mat-raised-button 
          color="primary"
          (click)="send()"
          [disabled]="!isValid() || isLoading"
        >
          {{ isLoading ? 'Envoi...' : '📧 Envoyer l\'email' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .modal-content { min-width: 450px; }
    .candidate-info { 
      background: #f0f7ff; 
      padding: 15px; 
      border-radius: 8px; 
      margin-bottom: 20px;
      border-left: 4px solid #1976d2;
    }
    .full-width { width: 100%; margin-bottom: 15px; }
    .error { color: #d32f2f; background: #ffebee; padding: 10px; border-radius: 4px; }
    .success { color: #388e3c; background: #e8f5e9; padding: 10px; border-radius: 4px; }
    .loader { text-align: center; padding: 20px; }
    mat-spinner { margin: 0 auto; }
  `]
})
export class ApplicationResponseModalComponent {
  
  selectedStatus: 'ACCEPTED' | 'REJECTED' = 'ACCEPTED';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  emailData: EmailNotification = {
    candidateEmail: '',
    candidateName: '',
    jobTitle: '',
    companyName: '',
    status: 'ACCEPTED',
    message: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ApplicationResponseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emailService: EmailNotificationService
  ) {
    this.emailData = { ...data };
  }

  isValid(): boolean {
    return this.emailData.candidateEmail?.includes('@') || false;
  }

  send(): void {
    if (!this.isValid()) {
      this.errorMessage = 'Email invalide!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.emailData.status = this.selectedStatus;

    this.emailService.sendNotification(this.emailData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '✅ Email envoyé au candidat!';
        setTimeout(() => this.dialogRef.close(true), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur serveur';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
```

---

## 📋 FICHIER 3️⃣ : INTÉGRATION DANS LA PAGE

**Modifier:** `src/app/components/application-list/application-list.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationResponseModalComponent } from '../application-response-modal/application-response-modal.component';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-application-list',
  template: `
    <div class="container">
      <h1>📋 Candidatures</h1>

      <table mat-table [dataSource]="applications" class="table">
        <!-- Candidat -->
        <ng-container matColumnDef="candidat">
          <th mat-header-cell *matHeaderCellDef>👤 Candidat</th>
          <td mat-cell *matCellDef="let e">{{ e.candidate.name }}</td>
        </ng-container>

        <!-- Poste -->
        <ng-container matColumnDef="poste">
          <th mat-header-cell *matHeaderCellDef>💼 Poste</th>
          <td mat-cell *matCellDef="let e">{{ e.jobOffer.title }}</td>
        </ng-container>

        <!-- Entreprise -->
        <ng-container matColumnDef="entreprise">
          <th mat-header-cell *matHeaderCellDef>🏢 Entreprise</th>
          <td mat-cell *matCellDef="let e">{{ e.jobOffer.company }}</td>
        </ng-container>

        <!-- Statut -->
        <ng-container matColumnDef="statut">
          <th mat-header-cell *matHeaderCellDef>📌 Statut</th>
          <td mat-cell *matCellDef="let e">
            <span [ngClass]="{
              'status-pending': e.status === 'PENDING',
              'status-accepted': e.status === 'ACCEPTED',
              'status-rejected': e.status === 'REJECTED'
            }">
              {{ e.status }}
            </span>
          </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>⚙️ Actions</th>
          <td mat-cell *matCellDef="let e">
            <!-- Bouton Accepter -->
            <button 
              mat-icon-button 
              matTooltip="Accepter et envoyer email"
              (click)="openModal(e, 'ACCEPTED')"
              [disabled]="e.status !== 'PENDING'"
              color="accent"
            >
              ✅
            </button>

            <!-- Bouton Refuser -->
            <button 
              mat-icon-button 
              matTooltip="Refuser et envoyer email"
              (click)="openModal(e, 'REJECTED')"
              [disabled]="e.status !== 'PENDING'"
              color="warn"
            >
              ❌
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .table { width: 100%; }
    .status-pending { color: #ff9800; font-weight: bold; }
    .status-accepted { color: #4caf50; font-weight: bold; }
    .status-rejected { color: #f44336; font-weight: bold; }
  `]
})
export class ApplicationListComponent implements OnInit {

  applications: any[] = [];
  columns = ['candidat', 'poste', 'entreprise', 'statut', 'actions'];

  constructor(
    private appService: ApplicationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.appService.getAll().subscribe(
      (data) => this.applications = data,
      (error) => console.error('Erreur:', error)
    );
  }

  openModal(application: any, status: 'ACCEPTED' | 'REJECTED'): void {
    const dialogRef = this.dialog.open(ApplicationResponseModalComponent, {
      width: '600px',
      data: {
        candidateEmail: application.candidate.email,
        candidateName: application.candidate.name,
        jobTitle: application.jobOffer.title,
        companyName: application.jobOffer.company,
        status: status
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.load(); // Recharger la liste
    });
  }
}
```

---

## ⚙️ CONFIGURER APP.MODULE.TS

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppComponent } from './app.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationResponseModalComponent } from './components/application-response-modal/application-response-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    ApplicationListComponent,
    ApplicationResponseModalComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 🚀 WORKFLOW

```
1️⃣ RH clique "✅ Accepter" ou "❌ Refuser"
        ↓
2️⃣ Modale s'ouvre → Formulaire prérempl
        ↓
3️⃣ RH remplit l'email + message optionnel
        ↓
4️⃣ RH clique "Envoyer l'email"
        ↓
5️⃣ Angular → POST /api/b2b/applications/notify
        ↓
6️⃣ Backend EmailService envoie via SMTP
        ↓
7️⃣ Candidat reçoit l'email dans Gmail ✅
        ↓
8️⃣ Modale affiche "Succès" et se ferme
```

---

## ✅ VÉRIFICATION

- [ ] Service créé: `email-notification.service.ts`
- [ ] Composant créé: `application-response-modal.component.ts`
- [ ] Composant modifié: `application-list.component.ts`
- [ ] App.module modifié avec les imports
- [ ] Backend lancé (Shift + F10)
- [ ] Test rapide: `test_email_quick.ps1`
- [ ] Email reçu dans Gmail ✅

---

## 📊 ENDPOINTS UTILISÉS

```
POST http://localhost:8083/api/b2b/applications/notify
Body: EmailNotification
Response: 200 OK

PUT http://localhost:8083/api/b2b/applications/{id}/status-notify?status=ACCEPTED
Body: EmailNotification
Response: 200 OK
```

---

**C'est tout! 3 fichiers + config = MAILING FONCTIONNE! 🚀📧**

