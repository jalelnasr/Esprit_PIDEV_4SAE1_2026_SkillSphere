// ============================================
// ANGULAR SERVICE EXAMPLE - EmailNotificationService
// ============================================

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

  /**
   * Envoyer une notification email sans mettre à jour le statut
   */
  sendNotification(notification: EmailNotificationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, notification);
  }

  /**
   * Mettre à jour le statut ET envoyer l'email en même temps
   */
  updateStatusAndNotify(
    applicationId: number,
    status: 'ACCEPTED' | 'REJECTED',
    notification: EmailNotificationRequest
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${applicationId}/status-notify?status=${status}`,
      notification
    );
  }
}

// ============================================
// ANGULAR COMPONENT EXAMPLE
// ============================================

import { Component, OnInit } from '@angular/core';
import { EmailNotificationService, EmailNotificationRequest } from './services/email-notification.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.css']
})
export class ApplicationDetailComponent implements OnInit {

  application: any;
  candidateEmail: string = '';
  candidateName: string = '';
  jobTitle: string = '';
  companyName: string = '';
  selectedStatus: 'ACCEPTED' | 'REJECTED' = 'ACCEPTED';
  customMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private emailService: EmailNotificationService
  ) { }

  ngOnInit(): void {
    // Initialiser avec les données de l'application
    this.initializeFromApplication();
  }

  initializeFromApplication(): void {
    // À remplir avec vos données réelles
    // this.candidateEmail = this.application.candidate.email;
    // this.candidateName = this.application.candidate.name;
    // etc.
  }

  /**
   * Envoyer une notification email
   */
  sendNotificationOnly(): void {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const notification: EmailNotificationRequest = {
      candidateEmail: this.candidateEmail,
      candidateName: this.candidateName,
      jobTitle: this.jobTitle,
      companyName: this.companyName,
      status: this.selectedStatus,
      message: this.customMessage || undefined
    };

    this.emailService.sendNotification(notification).subscribe(
      (response) => {
        this.successMessage = '✅ Email sent successfully!';
        this.isLoading = false;
        this.resetForm();
      },
      (error) => {
        this.errorMessage = '❌ Failed to send email: ' + (error.error?.message || error.message);
        this.isLoading = false;
      }
    );
  }

  /**
   * Mettre à jour le statut ET envoyer l'email
   */
  updateStatusAndSendEmail(): void {
    if (!this.validateForm()) return;
    if (!this.application?.id) {
      this.errorMessage = '❌ Application ID is required';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const notification: EmailNotificationRequest = {
      candidateEmail: this.candidateEmail,
      candidateName: this.candidateName,
      jobTitle: this.jobTitle,
      companyName: this.companyName,
      status: this.selectedStatus,
      message: this.customMessage || undefined
    };

    this.emailService.updateStatusAndNotify(
      this.application.id,
      this.selectedStatus,
      notification
    ).subscribe(
      (response) => {
        this.successMessage = '✅ Status updated and email sent successfully!';
        this.isLoading = false;
        this.application = response;
        this.resetForm();
      },
      (error) => {
        this.errorMessage = '❌ Failed to update status and send email: ' + (error.error?.message || error.message);
        this.isLoading = false;
      }
    );
  }

  /**
   * Valider le formulaire
   */
  validateForm(): boolean {
    if (!this.candidateEmail || !this.candidateEmail.includes('@')) {
      this.errorMessage = '❌ Valid email address is required';
      return false;
    }
    if (!this.candidateName?.trim()) {
      this.errorMessage = '❌ Candidate name is required';
      return false;
    }
    if (!this.jobTitle?.trim()) {
      this.errorMessage = '❌ Job title is required';
      return false;
    }
    if (!this.companyName?.trim()) {
      this.errorMessage = '❌ Company name is required';
      return false;
    }
    return true;
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.customMessage = '';
    this.selectedStatus = 'ACCEPTED';
  }

  /**
   * Pré-remplir avec acceptation
   */
  setStatusAccepted(): void {
    this.selectedStatus = 'ACCEPTED';
  }

  /**
   * Pré-remplir avec rejet
   */
  setStatusRejected(): void {
    this.selectedStatus = 'REJECTED';
  }
}

// ============================================
// ANGULAR TEMPLATE EXAMPLE
// ============================================

<!--
<div class="email-notification-container">
  <h2>📧 Send Application Notification</h2>

  <!-- Affichage des messages -->
  <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
  <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

  <!-- Formulaire -->
  <form class="notification-form">

    <!-- Candidate Email -->
    <div class="form-group">
      <label for="email">Candidate Email:</label>
      <input
        type="email"
        id="email"
        [(ngModel)]="candidateEmail"
        name="candidateEmail"
        class="form-control"
        placeholder="candidate@example.com"
        required>
    </div>

    <!-- Candidate Name -->
    <div class="form-group">
      <label for="name">Candidate Name:</label>
      <input
        type="text"
        id="name"
        [(ngModel)]="candidateName"
        name="candidateName"
        class="form-control"
        placeholder="John Doe"
        required>
    </div>

    <!-- Job Title -->
    <div class="form-group">
      <label for="job">Job Title:</label>
      <input
        type="text"
        id="job"
        [(ngModel)]="jobTitle"
        name="jobTitle"
        class="form-control"
        placeholder="Data Analyst"
        required>
    </div>

    <!-- Company Name -->
    <div class="form-group">
      <label for="company">Company Name:</label>
      <input
        type="text"
        id="company"
        [(ngModel)]="companyName"
        name="companyName"
        class="form-control"
        placeholder="TechCorp"
        required>
    </div>

    <!-- Status Selection -->
    <div class="form-group">
      <label for="status">Status:</label>
      <div class="status-buttons">
        <button
          type="button"
          (click)="setStatusAccepted()"
          [class.active]="selectedStatus === 'ACCEPTED'"
          class="btn btn-success">
          ✅ ACCEPTED
        </button>
        <button
          type="button"
          (click)="setStatusRejected()"
          [class.active]="selectedStatus === 'REJECTED'"
          class="btn btn-danger">
          ❌ REJECTED
        </button>
      </div>
    </div>

    <!-- Custom Message -->
    <div class="form-group">
      <label for="message">Custom Message (Optional):</label>
      <textarea
        id="message"
        [(ngModel)]="customMessage"
        name="customMessage"
        class="form-control"
        rows="4"
        placeholder="Optional message from HR team..."></textarea>
    </div>

    <!-- Action Buttons -->
    <div class="button-group">
      <button
        type="button"
        (click)="sendNotificationOnly()"
        [disabled]="isLoading"
        class="btn btn-primary">
        📧 Send Email Only
      </button>
      <button
        type="button"
        (click)="updateStatusAndSendEmail()"
        [disabled]="isLoading"
        class="btn btn-success">
        ✅ Update Status & Send Email
      </button>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="loading">
      <span class="spinner"></span> Processing...
    </div>

  </form>
</div>

<!-- Styles CSS optionnels -->
<style>
  .email-notification-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
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

  .form-group {
    margin-bottom: 20px;
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

  .status-buttons {
    display: flex;
    gap: 10px;
  }

  .status-buttons button {
    flex: 1;
    padding: 10px;
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

  .btn-primary {
    background-color: #667eea;
    color: white;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .button-group button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s;
  }

  .button-group button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    text-align: center;
    margin-top: 20px;
    color: #667eea;
    font-weight: 600;
  }
</style>
-->

