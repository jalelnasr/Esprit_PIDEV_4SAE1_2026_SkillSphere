import { Injectable } from '@angular/core';
import { B2bApplicationService, EmailNotification } from './application.service';
import { Application } from '../models/b2b.models';

/**
 * Service pour gérer les notifications email des candidatures
 * Envoie des emails quand un RH accepte ou refuse un candidat
 */
@Injectable({ providedIn: 'root' })
export class ApplicationEmailService {

  constructor(private appSvc: B2bApplicationService) {}

  /**
   * Accepter un candidat et envoyer un email de félicitations
   */
  acceptCandidate(application: Application, customMessage?: string): Promise<any> {
    const emailData: EmailNotification = {
      candidateEmail: application.candidateEmail || 'candidate@example.com',
      candidateName: application.candidateTitle || 'Candidate',
      jobTitle: application.jobOfferTitle || 'Position',
      companyName: application.companyName || 'Company',
      status: 'ACCEPTED',
      message: customMessage || 'Congratulations! We are excited to welcome you to our team.'
    };

    return new Promise((resolve, reject) => {
      this.appSvc.updateStatusWithEmail(application.id, 'ACCEPTED', emailData).subscribe({
        next: (response) => {
          console.log('Candidate accepted and email sent:', response);
          resolve(response);
        },
        error: (error) => {
          console.error('Error accepting candidate:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Refuser un candidat et envoyer un email de notification
   */
  rejectCandidate(application: Application, customMessage?: string): Promise<any> {
    const emailData: EmailNotification = {
      candidateEmail: application.candidateEmail || 'candidate@example.com',
      candidateName: application.candidateTitle || 'Candidate',
      jobTitle: application.jobOfferTitle || 'Position',
      companyName: application.companyName || 'Company',
      status: 'REJECTED',
      message: customMessage || 'Thank you for your application. We appreciate your interest and encourage you to apply again in the future.'
    };

    return new Promise((resolve, reject) => {
      this.appSvc.updateStatusWithEmail(application.id, 'REJECTED', emailData).subscribe({
        next: (response) => {
          console.log('Candidate rejected and email sent:', response);
          resolve(response);
        },
        error: (error) => {
          console.error('Error rejecting candidate:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Envoyer un email sans changer le statut
   */
  sendNotificationOnly(application: Application, status: 'ACCEPTED' | 'REJECTED', customMessage?: string): Promise<any> {
    const emailData: EmailNotification = {
      candidateEmail: application.candidateEmail || 'candidate@example.com',
      candidateName: application.candidateTitle || 'Candidate',
      jobTitle: application.jobOfferTitle || 'Position',
      companyName: application.companyName || 'Company',
      status: status,
      message: customMessage
    };

    return new Promise((resolve, reject) => {
      this.appSvc.sendNotification(emailData).subscribe({
        next: (response) => {
          console.log('Email sent:', response);
          resolve(response);
        },
        error: (error) => {
          console.error('Error sending email:', error);
          reject(error);
        }
      });
    });
  }
}
