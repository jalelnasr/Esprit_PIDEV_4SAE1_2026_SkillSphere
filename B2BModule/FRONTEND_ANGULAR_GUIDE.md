# 📱 GUIDE FRONTEND ANGULAR - SYSTÈME DE MAILING

**Pour le développeur Angular**  
**Date:** 2026-03-05  
**Statut:** ✅ PRÊT À INTÉGRER

---

## 🎯 RÉSUMÉ RAPIDE

Le **BACKEND** (Spring Boot) a créé **2 nouveaux endpoints** pour envoyer des emails aux candidats.

Votre job en **ANGULAR** : 
1. ✅ Créer un service pour appeler ces endpoints
2. ✅ Créer un composant avec une modale
3. ✅ Afficher un formulaire pour entrer l'email du candidat
4. ✅ Envoyer les données au backend
5. ✅ Afficher un message de succès/erreur

---

## 📊 VUE D'ENSEMBLE

```
┌──────────────────────────┐
│   ANGULAR FRONTEND       │
│  ┌────────────────────┐  │
│  │ Page Candidatures  │  │
│  │ (List/Table)       │  │
│  └────────┬───────────┘  │
│           │ Clique bouton│
│           │ "Accepter"   │
│           ▼              │
│  ┌────────────────────┐  │
│  │ Modal Dialog       │  │
│  │ ┌────────────────┐ │  │
│  │ │ Formulaire:    │ │  │
│  │ │ • Email        │ │  │
│  │ │ • Message (opt)│ │  │
│  │ │                │ │  │
│  │ │ [Accepter] [ X]│ │  │
│  │ └────────────────┘ │  │
│  └────────┬───────────┘  │
│           │ Submit        │
│           ▼              │
│  POST /api/b2b/         │
│  applications/notify    │
│           │              │
└───────────┼──────────────┘
            │
            ▼
┌──────────────────────────┐
│   BACKEND (SPRING BOOT)  │
│                          │
│ EmailService.java        │
│ ├─ Crée MimeMessage      │
│ ├─ Construit HTML        │
│ └─ Envoie via SMTP       │
│           │              │
└───────────┼──────────────┘
            │
            ▼
    SMTP GMAIL SERVER
            │
            ▼
       Candidat reçoit
       l'email ✅
```

---

## 💻 ÉTAPE 1 : CRÉER LE SERVICE

**Fichier:** `src/app/services/email-notification.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface pour typer les données
export interface EmailNotification {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  status: 'ACCEPTED' | 'REJECTED';
  message?: string; // Optionnel
}

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  
  private apiUrl = 'http://localhost:8083/api/b2b/applications';

  constructor(private http: HttpClient) { }

  /**
   * Envoie un email de notification au candidat
   */
  sendNotification(data: EmailNotification): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, data);
  }

  /**
   * Met à jour le statut ET envoie un email en même temps
   */
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

## 🎨 ÉTAPE 2 : CRÉER LE COMPOSANT AVEC MODALE

**Fichier:** `src/app/components/application-response/application-response.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailNotificationService, EmailNotification } from '../../services/email-notification.service';

@Component({
  selector: 'app-application-response',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Répondre à la candidature</h2>
      
      <mat-dialog-content>
        <div class="candidate-info">
          <p><strong>Candidat:</strong> {{ data.candidateName }}</p>
          <p><strong>Poste:</strong> {{ data.jobTitle }}</p>
          <p><strong>Entreprise:</strong> {{ data.companyName }}</p>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email du candidat</mat-label>
          <input 
            matInput 
            [(ngModel)]="emailData.candidateEmail"
            type="email"
            required
          />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="selectedStatus">
            <mat-option value="ACCEPTED">✅ Accepté</mat-option>
            <mat-option value="REJECTED">❌ Refusé</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Message personnalisé (optionnel)</mat-label>
          <textarea 
            matInput 
            [(ngModel)]="emailData.message"
            rows="4"
          ></textarea>
        </mat-form-field>

        <!-- Afficher les erreurs -->
        <div *ngIf="errorMessage" class="error-message">
          ❌ {{ errorMessage }}
        </div>

        <!-- Afficher le succès -->
        <div *ngIf="successMessage" class="success-message">
          ✅ {{ successMessage }}
        </div>

        <!-- Indicateur de chargement -->
        <mat-spinner *ngIf="isLoading" diameter="30"></mat-spinner>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button 
          mat-button 
          (click)="onCancel()"
          [disabled]="isLoading"
        >
          Annuler
        </button>
        <button 
          mat-raised-button 
          color="primary"
          (click)="onSubmit()"
          [disabled]="!isFormValid() || isLoading"
        >
          {{ isLoading ? 'Envoi en cours...' : 'Envoyer l\'email' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
    }
    .candidate-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .error-message {
      color: #d32f2f;
      background-color: #ffebee;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
    .success-message {
      color: #388e3c;
      background-color: #e8f5e9;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
    mat-spinner {
      margin: 10px 0;
    }
  `]
})
export class ApplicationResponseComponent {
  
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
    public dialogRef: MatDialogRef<ApplicationResponseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emailService: EmailNotificationService
  ) {
    this.populateData();
  }

  /**
   * Remplir les données avec les infos du candidat
   */
  private populateData(): void {
    this.emailData = {
      candidateEmail: this.data.candidateEmail || '',
      candidateName: this.data.candidateName || '',
      jobTitle: this.data.jobTitle || '',
      companyName: this.data.companyName || '',
      status: 'ACCEPTED',
      message: ''
    };
  }

  /**
   * Vérifier si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.emailData.candidateEmail && this.emailData.candidateEmail.includes('@');
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Mettre à jour le statut dans l'email
    this.emailData.status = this.selectedStatus;

    // Appeler le service
    this.emailService.sendNotification(this.emailData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = '✅ Email envoyé avec succès au candidat!';
        
        // Fermer la modale après 2 secondes
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = `❌ Erreur: ${error.error?.message || error.message}`;
      }
    });
  }

  /**
   * Fermer la modale
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
```

---

## 📋 ÉTAPE 3 : INTÉGRER DANS LA PAGE DES CANDIDATURES

**Fichier:** `src/app/components/application-list/application-list.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationResponseComponent } from '../application-response/application-response.component';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-application-list',
  template: `
    <div class="application-list-container">
      <h1>Candidatures</h1>

      <table mat-table [dataSource]="applications" class="applications-table">
        
        <!-- Colonne: Candidat -->
        <ng-container matColumnDef="candidateName">
          <th mat-header-cell *matHeaderCellDef>Candidat</th>
          <td mat-cell *matCellDef="let element">{{ element.candidate.name }}</td>
        </ng-container>

        <!-- Colonne: Poste -->
        <ng-container matColumnDef="jobTitle">
          <th mat-header-cell *matHeaderCellDef>Poste</th>
          <td mat-cell *matCellDef="let element">{{ element.jobOffer.title }}</td>
        </ng-container>

        <!-- Colonne: Entreprise -->
        <ng-container matColumnDef="companyName">
          <th mat-header-cell *matHeaderCellDef>Entreprise</th>
          <td mat-cell *matCellDef="let element">{{ element.jobOffer.company }}</td>
        </ng-container>

        <!-- Colonne: Statut -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Statut</th>
          <td mat-cell *matCellDef="let element">
            <span [ngClass]="{
              'status-pending': element.status === 'PENDING',
              'status-accepted': element.status === 'ACCEPTED',
              'status-rejected': element.status === 'REJECTED'
            }">
              {{ element.status }}
            </span>
          </td>
        </ng-container>

        <!-- Colonne: Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <button 
              mat-icon-button 
              matTooltip="Accepter"
              (click)="openResponseModal(element, 'ACCEPTED')"
              [disabled]="element.status !== 'PENDING'"
            >
              <mat-icon>check_circle</mat-icon>
            </button>
            <button 
              mat-icon-button 
              matTooltip="Refuser"
              (click)="openResponseModal(element, 'REJECTED')"
              [disabled]="element.status !== 'PENDING'"
            >
              <mat-icon>cancel</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .application-list-container {
      padding: 20px;
    }
    .applications-table {
      width: 100%;
    }
    .status-pending { color: #ff9800; font-weight: bold; }
    .status-accepted { color: #4caf50; font-weight: bold; }
    .status-rejected { color: #f44336; font-weight: bold; }
  `]
})
export class ApplicationListComponent implements OnInit {

  applications: any[] = [];
  displayedColumns = ['candidateName', 'jobTitle', 'companyName', 'status', 'actions'];

  constructor(
    private applicationService: ApplicationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  /**
   * Charger la liste des candidatures
   */
  loadApplications(): void {
    this.applicationService.getAll().subscribe({
      next: (data) => {
        this.applications = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
      }
    });
  }

  /**
   * Ouvrir la modale de réponse
   */
  openResponseModal(application: any, status: 'ACCEPTED' | 'REJECTED'): void {
    const dialogRef = this.dialog.open(ApplicationResponseComponent, {
      width: '500px',
      data: {
        candidateName: application.candidate.name,
        candidateEmail: application.candidate.email,
        jobTitle: application.jobOffer.title,
        companyName: application.jobOffer.company,
        status: status
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recharger la liste si l'email a été envoyé
        this.loadApplications();
      }
    });
  }
}
```

---

## 📦 ÉTAPE 4 : MODULES REQUIS

**Fichier:** `src/app/app.module.ts`

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
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppComponent } from './app.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationResponseComponent } from './components/application-response/application-response.component';

@NgModule({
  declarations: [
    AppComponent,
    ApplicationListComponent,
    ApplicationResponseComponent
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
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 🔧 ÉTAPE 5 : CONFIGURATION CORS

**⚠️ IMPORTANT:** Le backend a déjà `@CrossOrigin(origins = "*")`

Donc aucune configuration supplémentaire n'est nécessaire!

```typescript
// ✅ C'est déjà dans le backend
@RestController
@RequestMapping("/api/b2b/applications")
@CrossOrigin(origins = "*")  // ← CORS activé
public class ApplicationController {
  ...
}
```

---

## 📊 FLUX COMPLET

```
1. Utilisateur clique "✅ Accepter" ou "❌ Refuser"
        ↓
2. Modale s'ouvre avec le formulaire
        ↓
3. RH remplit l'email du candidat et le message (optionnel)
        ↓
4. RH clique "Envoyer l'email"
        ↓
5. Angular appelle: POST /api/b2b/applications/notify
        ↓
6. Backend EmailService.sendApplicationNotification()
        ↓
7. Email HTML professionnel envoyé au candidat
        ↓
8. Candidat reçoit l'email dans Gmail ✅
        ↓
9. Modale affiche "Email envoyé avec succès!" et se ferme
```

---

## ✅ DONNÉES ENVOYÉES AU BACKEND

```json
{
  "candidateEmail": "candidate@email.com",
  "candidateName": "John Doe",
  "jobTitle": "Senior Developer",
  "companyName": "TechCorp",
  "status": "ACCEPTED",
  "message": "Bienvenue dans notre équipe!"
}
```

### Validation:
- ✅ `candidateEmail` - Obligatoire (format email)
- ✅ `candidateName` - Obligatoire (string)
- ✅ `jobTitle` - Obligatoire (string)
- ✅ `companyName` - Obligatoire (string)
- ✅ `status` - Obligatoire (ACCEPTED ou REJECTED)
- ✅ `message` - Optionnel (string)

---

## 🎨 DESIGN DE LA MODALE

```
┌─────────────────────────────────────┐
│ Répondre à la candidature           │ ← Titre
├─────────────────────────────────────┤
│ Candidat: John Doe                  │
│ Poste: Senior Developer             │
│ Entreprise: TechCorp                │
│                                     │
│ Email du candidat:                  │
│ [___________________________]        │
│                                     │
│ Statut:                             │
│ [✅ Accepté          ▼]             │
│                                     │
│ Message personnalisé (optionnel):   │
│ [_________________________          │
│  _________________________          │
│  _________________________]         │
│                                     │
│ ❌ Erreur: Email invalide           │ ← Si erreur
│ ✅ Email envoyé avec succès!        │ ← Si succès
│                                     │
├─────────────────────────────────────┤
│        [Annuler]  [Envoyer l'email] │
└─────────────────────────────────────┘
```

---

## 🧪 TEST DANS ANGULAR

```typescript
// Dans le composant de test ou console
import { EmailNotificationService } from './services/email-notification.service';

constructor(private emailService: EmailNotificationService) {}

testSendEmail(): void {
  const data = {
    candidateEmail: 'test@example.com',
    candidateName: 'Test User',
    jobTitle: 'Developer',
    companyName: 'TestCo',
    status: 'ACCEPTED' as const,
    message: 'Welcome!'
  };

  this.emailService.sendNotification(data).subscribe({
    next: (response) => console.log('✅ Success:', response),
    error: (error) => console.error('❌ Error:', error)
  });
}
```

---

## 🚀 DÉPLOIEMENT

### Development (localhost)
```typescript
private apiUrl = 'http://localhost:8083/api/b2b/applications';
```

### Production (serveur distant)
```typescript
private apiUrl = 'https://api.yourcompany.com/api/b2b/applications';
```

---

## ✨ POINTS IMPORTANTS

✅ **Service déjà créé au backend**  
✅ **2 endpoints disponibles**  
✅ **CORS activé (pas de config supplémentaire)**  
✅ **Design HTML géré par le backend**  
✅ **Emails envoyés directement au candidat**  

---

## 📝 RÉSUMÉ

| Tâche | Fichier | Statut |
|-------|---------|--------|
| Service Angular | `email-notification.service.ts` | À créer |
| Composant Modale | `application-response.component.ts` | À créer |
| Intégration | `application-list.component.ts` | À modifier |
| Modules | `app.module.ts` | À modifier |
| Backend | **DÉJÀ FAIT ✅** | Prêt |

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Créer le service `EmailNotificationService`
2. ✅ Créer le composant `ApplicationResponseComponent`
3. ✅ Intégrer dans `ApplicationListComponent`
4. ✅ Ajouter les modules Angular Material
5. ✅ Tester avec le backend

---

**Vous avez toutes les infos! 🚀 Bon développement! 📱✨**

