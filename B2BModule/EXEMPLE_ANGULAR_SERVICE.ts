// Service Angular pour gérer les emails de candidature
// Fichier: src/app/services/application-email.service.ts

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
export class ApplicationEmailService {
  private baseUrl = 'http://localhost:8083/api/b2b/applications';

  constructor(private http: HttpClient) {}

  /**
   * Accepter un candidat et envoyer un email
   */
  acceptCandidate(applicationId: number, emailData: EmailNotification): Observable<any> {
    const url = `${this.baseUrl}/${applicationId}/status-notify?status=ACCEPTED`;
    emailData.status = 'ACCEPTED';
    return this.http.put(url, emailData);
  }

  /**
   * Refuser un candidat et envoyer un email
   */
  rejectCandidate(applicationId: number, emailData: EmailNotification): Observable<any> {
    const url = `${this.baseUrl}/${applicationId}/status-notify?status=REJECTED`;
    emailData.status = 'REJECTED';
    return this.http.put(url, emailData);
  }

  /**
   * Envoyer un email sans changer le statut
   */
  sendNotificationOnly(emailData: EmailNotification): Observable<string> {
    const url = `${this.baseUrl}/notify`;
    return this.http.post<string>(url, emailData);
  }
}


// ============================================
// EXEMPLE D'UTILISATION DANS UN COMPONENT
// ============================================

// Fichier: src/app/components/candidate-list/candidate-list.component.ts

import { Component } from '@angular/core';
import { ApplicationEmailService, EmailNotification } from '../../services/application-email.service';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html'
})
export class CandidateListComponent {
  
  constructor(private emailService: ApplicationEmailService) {}

  /**
   * Quand le RH clique sur "Accepter"
   */
  onAcceptCandidate(application: any) {
    const emailData: EmailNotification = {
      candidateEmail: application.candidate.email,
      candidateName: application.candidate.name,
      jobTitle: application.jobOffer.title,
      companyName: 'TechCorp', // Ou récupérer depuis les données
      status: 'ACCEPTED',
      message: 'Bienvenue dans notre équipe! Nous sommes ravis de vous accueillir.'
    };

    this.emailService.acceptCandidate(application.id, emailData).subscribe({
      next: (response) => {
        console.log('Candidat accepté et email envoyé:', response);
        alert('Le candidat a été accepté et un email lui a été envoyé!');
        // Rafraîchir la liste ou mettre à jour l'UI
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'acceptation du candidat');
      }
    });
  }

  /**
   * Quand le RH clique sur "Refuser"
   */
  onRejectCandidate(application: any) {
    const emailData: EmailNotification = {
      candidateEmail: application.candidate.email,
      candidateName: application.candidate.name,
      jobTitle: application.jobOffer.title,
      companyName: 'TechCorp',
      status: 'REJECTED',
      message: 'Merci pour votre candidature. Nous vous encourageons à postuler à nouveau.'
    };

    this.emailService.rejectCandidate(application.id, emailData).subscribe({
      next: (response) => {
        console.log('Candidat refusé et email envoyé:', response);
        alert('Le candidat a été informé de la décision.');
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors du refus du candidat');
      }
    });
  }
}


// ============================================
// EXEMPLE DE TEMPLATE HTML
// ============================================

/*
<!-- Fichier: candidate-list.component.html -->

<div class="candidate-card" *ngFor="let application of applications">
  <h3>{{ application.candidate.name }}</h3>
  <p>Poste: {{ application.jobOffer.title }}</p>
  <p>Email: {{ application.candidate.email }}</p>
  <p>Match Score: {{ application.matchScore }}%</p>
  
  <div class="actions">
    <button 
      class="btn-accept" 
      (click)="onAcceptCandidate(application)"
      [disabled]="application.status === 'ACCEPTED'">
      ✅ Accepter
    </button>
    
    <button 
      class="btn-reject" 
      (click)="onRejectCandidate(application)"
      [disabled]="application.status === 'REJECTED'">
      ❌ Refuser
    </button>
  </div>
  
  <span class="status" [class.accepted]="application.status === 'ACCEPTED'"
                       [class.rejected]="application.status === 'REJECTED'">
    {{ application.status }}
  </span>
</div>
*/


// ============================================
// EXEMPLE AVEC MODAL DE CONFIRMATION
// ============================================

/*
import { MatDialog } from '@angular/material/dialog';

export class CandidateListComponent {
  
  constructor(
    private emailService: ApplicationEmailService,
    private dialog: MatDialog
  ) {}

  onAcceptCandidate(application: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Accepter le candidat',
        message: `Voulez-vous accepter ${application.candidate.name}?`,
        customMessage: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        const emailData: EmailNotification = {
          candidateEmail: application.candidate.email,
          candidateName: application.candidate.name,
          jobTitle: application.jobOffer.title,
          companyName: 'TechCorp',
          status: 'ACCEPTED',
          message: result.customMessage || 'Bienvenue!'
        };

        this.emailService.acceptCandidate(application.id, emailData).subscribe({
          next: () => alert('Email envoyé!'),
          error: (err) => alert('Erreur: ' + err.message)
        });
      }
    });
  }
}
*/
