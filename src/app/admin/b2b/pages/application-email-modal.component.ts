import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Application } from '../models/b2b.models';

/**
 * Modal pour envoyer un email personnalisé au candidat
 * Permet au RH de personnaliser le message avant d'envoyer
 */
@Component({
  selector: 'app-application-email-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isAccepting ? '✅ Accept Candidate' : '❌ Reject Candidate' }}</h2>
          <button class="close-btn" (click)="onCancel()">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-section">
            <p><strong>Candidate:</strong> {{ application?.candidateTitle }}</p>
            <p><strong>Position:</strong> {{ application?.jobOfferTitle }}</p>
            <p><strong>Email:</strong> {{ application?.candidateEmail }}</p>
          </div>

          <div class="form-section">
            <label>Message to send:</label>
            <textarea 
              [(ngModel)]="customMessage" 
              rows="6"
              placeholder="Enter your personalized message here..."
              class="message-textarea">
            </textarea>
            <p class="hint">{{ customMessage?.length || 0 }} characters</p>
          </div>

          <div class="preview-section">
            <h3>Email Preview:</h3>
            <div class="email-preview">
              <div class="preview-header">
                <div class="preview-status" [class.accepted]="isAccepting" [class.rejected]="!isAccepting">
                  {{ isAccepting ? '✅ ACCEPTED' : '❌ REJECTED' }}
                </div>
              </div>
              <div class="preview-content">
                <p>Dear {{ application?.candidateTitle }},</p>
                <p>{{ customMessage || (isAccepting ? 'Congratulations! We are excited to welcome you to our team.' : 'Thank you for your application. We appreciate your interest.') }}</p>
                <p>Best regards,<br>The {{ application?.companyName }} HR Team</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="onCancel()">Cancel</button>
          <button class="btn-send" [class.loading]="isLoading" (click)="onSend()" [disabled]="isLoading">
            {{ isLoading ? 'Sending...' : 'Send Email' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--card-bg, #fff);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    :root.dark-mode .modal-content {
      background: #1e293b;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    :root.dark-mode .modal-header {
      border-bottom-color: #334155;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .modal-header h2 {
      color: #f1f5f9;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #94a3b8;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #0f172a;
    }

    :root.dark-mode .close-btn:hover {
      color: #f1f5f9;
    }

    .modal-body {
      padding: 20px;
    }

    .info-section {
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    :root.dark-mode .info-section {
      background: #0f172a;
    }

    .info-section p {
      margin: 6px 0;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .info-section p {
      color: #e2e8f0;
    }

    .form-section {
      margin-bottom: 20px;
    }

    .form-section label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-primary, #0f172a);
      font-size: 14px;
    }

    :root.dark-mode .form-section label {
      color: #f1f5f9;
    }

    .message-textarea {
      width: 100%;
      padding: 12px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      background: var(--card-bg, #fff);
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .message-textarea {
      background: #0f172a;
      border-color: #334155;
      color: #e2e8f0;
    }

    .message-textarea:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .hint {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .preview-section {
      margin-bottom: 20px;
    }

    .preview-section h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .preview-section h3 {
      color: #f1f5f9;
    }

    .email-preview {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    :root.dark-mode .email-preview {
      background: #0f172a;
      border-color: #334155;
    }

    .preview-header {
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }

    .preview-status {
      font-weight: 700;
      font-size: 14px;
      padding: 8px 12px;
      border-radius: 6px;
      display: inline-block;
    }

    .preview-status.accepted {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .preview-status.rejected {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .preview-content {
      padding: 12px;
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
    }

    :root.dark-mode .preview-content {
      color: #cbd5e1;
    }

    .preview-content p {
      margin: 8px 0;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      justify-content: flex-end;
    }

    :root.dark-mode .modal-footer {
      border-top-color: #334155;
    }

    .btn-cancel {
      padding: 10px 20px;
      border: 1.5px solid #e2e8f0;
      background: var(--card-bg, #fff);
      color: var(--text-primary, #0f172a);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    :root.dark-mode .btn-cancel {
      background: #1e293b;
      border-color: #334155;
      color: #e2e8f0;
    }

    .btn-cancel:hover {
      background: #f1f5f9;
    }

    :root.dark-mode .btn-cancel:hover {
      background: #334155;
    }

    .btn-send {
      padding: 10px 20px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-send:hover:not(:disabled) {
      background: #4f46e5;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-send.loading {
      opacity: 0.8;
    }
  `]
})
export class ApplicationEmailModalComponent {
  @Input() isOpen = false;
  @Input() application: Application | null = null;
  @Input() isAccepting = true;
  @Output() onSendEmail = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  customMessage = '';
  isLoading = false;

  onSend() {
    this.isLoading = true;
    this.onSendEmail.emit(this.customMessage);
  }

  onCancel() {
    this.customMessage = '';
    this.isLoading = false;
    this.onClose.emit();
  }
}
