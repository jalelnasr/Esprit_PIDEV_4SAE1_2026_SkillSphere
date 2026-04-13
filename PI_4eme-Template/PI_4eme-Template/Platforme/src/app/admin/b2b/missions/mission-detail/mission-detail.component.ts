import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2bMissionService } from '../../services/mission.service';
import { B2bContractService } from '../../services/contract.service';
import { Mission, MissionApplication } from '../../models/b2b.models';
import { B2bNavService } from '../../services/b2b-nav.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { SignaturePadComponent } from '../../../../shared/components/signature-pad/signature-pad.component';
import { AIScoreBadgeComponent } from '../../shared/ai-score-badge/ai-score-badge.component';
import { AIRecommendationComponent } from '../../shared/ai-recommendation/ai-recommendation.component';

@Component({
  selector: 'app-mission-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SignaturePadComponent, AIScoreBadgeComponent, AIRecommendationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <a [routerLink]="nav.basePath + '/missions'" class="back-link">← Back to missions</a>
        <h1>📋 Mission Details</h1>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <ng-container *ngIf="!loading && mission">
        <!-- Mission Info Card -->
        <div class="mission-info-card">
          <div class="card-header">
            <div>
              <h2>{{ mission.title }}</h2>
              <p class="company-name">🏢 {{ mission.companyName }}</p>
            </div>
            <span class="status-badge" [ngClass]="statusClass(mission.status)">
              {{ statusLabel(mission.status) }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">💰 Budget</span>
                <span class="info-value">{{ mission.dailyRate }} TND/day</span>
              </div>
              <div class="info-item">
                <span class="info-label">⏱ Duration</span>
                <span class="info-value">{{ mission.durationWeeks || 'Flexible' }} weeks</span>
              </div>
              <div class="info-item">
                <span class="info-label">👥 Applications</span>
                <span class="info-value">{{ applications.length }}</span>
              </div>
            </div>

            <div class="description-section">
              <h3>Description</h3>
              <p>{{ mission.description }}</p>
            </div>

            <div class="skills-section" *ngIf="missionSkills().length > 0">
              <h3>Required skills</h3>
              <div class="skills-wrap">
                <span *ngFor="let skill of missionSkills()" class="skill-tag">{{ skill }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Applications Section -->
        <div class="applications-section">
          <div class="section-header">
            <h2>👥 Applications ({{ applications.length }})</h2>
            <div class="stats">
              <span class="stat pending">{{ getCountByStatus('PENDING') }} Pending</span>
              <span class="stat accepted">{{ getCountByStatus('ACCEPTED') }} Accepted</span>
              <span class="stat rejected">{{ getCountByStatus('REJECTED') }} Rejected</span>
            </div>
          </div>

          <div *ngIf="applications.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No applications yet</h3>
            <p>Candidates haven't applied to this mission yet</p>
          </div>

          <div class="applications-list" *ngIf="applications.length > 0">
            <div *ngFor="let app of applications" class="application-card">
              <div class="app-header">
                <div class="candidate-info">
                  <div class="candidate-avatar">{{ getInitials(app.candidateName) }}</div>
                  <div>
                    <h3>{{ app.candidateName }}</h3>
                    <p class="candidate-email">Candidate #{{ app.candidateId }}</p>
                  </div>
                </div>
                <span class="status-badge" [ngClass]="statusClass(app.status)">
                  {{ statusLabel(app.status) }}
                </span>
              </div>

              <div class="app-body">
                <div class="app-info-grid">
                  <div class="app-info-item">
                    <span class="label">💰 Proposed rate</span>
                    <span class="value">{{ app.proposedRate }} TND/day</span>
                  </div>
                  <div class="app-info-item">
                    <span class="label">🤖 AI Score</span>
                    <span class="value">
                      <app-ai-score-badge [score]="app.matchScore || 0"></app-ai-score-badge>
                    </span>
                  </div>
                  <div class="app-info-item">
                    <span class="label">📅 Date</span>
                    <span class="value">{{ formatDate(app.appliedAt) }}</span>
                  </div>
                </div>

                <div class="ai-recommendation-section" *ngIf="app.matchScore">
                  <app-ai-recommendation [score]="app.matchScore"></app-ai-recommendation>
                </div>

                <div class="cover-letter" *ngIf="app.coverLetter">
                  <h4>Cover letter</h4>
                  <p>{{ app.coverLetter }}</p>
                </div>
              </div>

              <div class="app-actions" *ngIf="app.status === 'PENDING'">
                <button 
                  (click)="acceptApplication(app)" 
                  class="btn btn-accept"
                  [disabled]="processing">
                  ✅ Accept
                </button>
                <button 
                  (click)="rejectApplication(app)" 
                  class="btn btn-reject"
                  [disabled]="processing">
                  ❌ Reject
                </button>
              </div>

              <div class="app-status-message" *ngIf="app.status === 'ACCEPTED'">
                ✅ Application accepted - You can now create a contract
              </div>
              <div class="app-status-message rejected" *ngIf="app.status === 'REJECTED'">
                ❌ Application rejected
              </div>
            </div>
          </div>
        </div>

        <div class="success-message" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="error-message" *ngIf="errorMsg">{{ errorMsg }}</div>
      </ng-container>

      <!-- Contract creation modal -->
      <div class="modal-overlay" *ngIf="showContractModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📝 Create contract</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="candidate-summary" *ngIf="selectedApplication">
              <div class="summary-item">
                <span class="label">👤 Candidate</span>
                <span class="value">{{ selectedApplication.candidateName }}</span>
              </div>
              <div class="summary-item">
                <span class="label">📋 Mission</span>
                <span class="value">{{ mission?.title }}</span>
              </div>
              <div class="summary-item">
                <span class="label">💰 Proposed rate</span>
                <span class="value">{{ selectedApplication.proposedRate }} TND/day</span>
              </div>
            </div>

            <form class="contract-form">
              <div class="form-group">
                <label for="amount">💰 Total amount (TND)</label>
                <input 
                  type="number" 
                  id="amount" 
                  [(ngModel)]="contractForm.amount" 
                  name="amount"
                  class="form-control"
                  required
                  min="0"
                  step="0.01">
                <small class="form-hint">Automatically calculated: {{ contractForm.amount }} TND</small>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="startDate">📅 Start date</label>
                  <input 
                    type="date" 
                    id="startDate" 
                    [(ngModel)]="contractForm.startDate" 
                    name="startDate"
                    class="form-control"
                    required>
                </div>

                <div class="form-group">
                  <label for="endDate">📅 End date</label>
                  <input 
                    type="date" 
                    id="endDate" 
                    [(ngModel)]="contractForm.endDate" 
                    name="endDate"
                    class="form-control"
                    required>
                </div>
              </div>

              <div class="form-group">
                <label for="terms">📄 Contract terms</label>
                <textarea 
                  id="terms" 
                  [(ngModel)]="contractForm.terms" 
                  name="terms"
                  class="form-control"
                  rows="4"
                  placeholder="Describe the contract terms and conditions..."></textarea>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()" [disabled]="creatingContract">
              Cancel
            </button>
            <button class="btn btn-primary" (click)="createAndSignContract()" [disabled]="creatingContract">
              <span *ngIf="!creatingContract">✍️ Create and Sign contract</span>
              <span *ngIf="creatingContract">⏳ Creating...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Signature modal for HR -->
      <app-signature-pad 
        *ngIf="showSignatureModal"
        (signatureConfirmed)="onSignatureConfirmed($event)"
        (cancelled)="onSignatureCancelled()">
      </app-signature-pad>
    </div>
  `,
  styles: [`
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px 60px;
    }

    .page-header {
      margin: 32px 0 24px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6366f1;
      font-weight: 700;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    :root.dark-mode .page-header h1 {
      color: #f8fafc;
    }

    .loading-state {
      text-align: center;
      padding: 80px 20px;
      color: #64748b;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .mission-info-card,
    .applications-section {
      background: var(--card-bg, #fff);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }

    :root.dark-mode .mission-info-card,
    :root.dark-mode .applications-section {
      background: #1e293b;
      border-color: rgba(255,255,255,0.06);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(148,163,184,0.16);
    }

    .card-header h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 6px;
    }

    :root.dark-mode .card-header h2 {
      color: #f8fafc;
    }

    .company-name {
      color: #64748b;
      font-size: 15px;
      font-weight: 600;
      margin: 0;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-badge.open {
      background: rgba(34,197,94,0.14);
      color: #15803d;
    }

    .status-badge.in_progress {
      background: rgba(59,130,246,0.14);
      color: #1d4ed8;
    }

    .status-badge.completed {
      background: rgba(168,85,247,0.14);
      color: #7e22ce;
    }

    .status-badge.cancelled {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    .status-badge.pending {
      background: rgba(245,158,11,0.14);
      color: #b45309;
    }

    .status-badge.accepted {
      background: rgba(34,197,94,0.14);
      color: #15803d;
    }

    .status-badge.rejected {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    :root.dark-mode .status-badge.open { color: #4ade80; }
    :root.dark-mode .status-badge.in_progress { color: #93c5fd; }
    :root.dark-mode .status-badge.completed { color: #d8b4fe; }
    :root.dark-mode .status-badge.cancelled { color: #fca5a5; }
    :root.dark-mode .status-badge.pending { color: #fbbf24; }
    :root.dark-mode .status-badge.accepted { color: #4ade80; }
    :root.dark-mode .status-badge.rejected { color: #fca5a5; }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      padding: 16px;
      border-radius: 14px;
      background: rgba(148,163,184,0.08);
    }

    :root.dark-mode .info-item {
      background: rgba(148,163,184,0.12);
    }

    .info-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .info-value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .info-value {
      color: #f8fafc;
    }

    .description-section,
    .skills-section {
      margin-bottom: 20px;
    }

    .description-section h3,
    .skills-section h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 12px;
    }

    :root.dark-mode .description-section h3,
    :root.dark-mode .skills-section h3 {
      color: #f8fafc;
    }

    .description-section p {
      color: #475569;
      line-height: 1.7;
      margin: 0;
    }

    :root.dark-mode .description-section p {
      color: #94a3b8;
    }

    .skills-wrap {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .skill-tag {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      background: rgba(99,102,241,0.12);
      color: #6366f1;
    }

    :root.dark-mode .skill-tag {
      background: rgba(99,102,241,0.16);
      color: #a5b4fc;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    :root.dark-mode .section-header h2 {
      color: #f8fafc;
    }

    .stats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .stat {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }

    .stat.pending {
      background: rgba(245,158,11,0.14);
      color: #b45309;
    }

    .stat.accepted {
      background: rgba(34,197,94,0.14);
      color: #15803d;
    }

    .stat.rejected {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 8px;
    }

    :root.dark-mode .empty-state h3 {
      color: #f8fafc;
    }

    .empty-state p {
      margin: 0;
    }

    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .application-card {
      background: rgba(148,163,184,0.04);
      border: 1px solid rgba(148,163,184,0.12);
      border-radius: 16px;
      padding: 20px;
    }

    :root.dark-mode .application-card {
      background: rgba(15,23,42,0.4);
      border-color: rgba(148,163,184,0.08);
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(148,163,184,0.12);
    }

    .candidate-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .candidate-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }

    .candidate-info h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 4px;
    }

    :root.dark-mode .candidate-info h3 {
      color: #f8fafc;
    }

    .candidate-email {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .app-body {
      margin-bottom: 16px;
    }

    .app-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .app-info-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .app-info-item .label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .app-info-item .value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .app-info-item .value {
      color: #e2e8f0;
    }

    .match-score {
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
    }

    .match-score.excellent {
      background: rgba(34,197,94,0.14);
      color: #15803d;
    }

    .match-score.good {
      background: rgba(59,130,246,0.14);
      color: #1d4ed8;
    }

    .match-score.average {
      background: rgba(245,158,11,0.14);
      color: #b45309;
    }

    .match-score.low {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    .cover-letter {
      padding: 16px;
      border-radius: 12px;
      background: rgba(255,255,255,0.6);
      border: 1px solid rgba(148,163,184,0.12);
    }

    :root.dark-mode .cover-letter {
      background: rgba(15,23,42,0.6);
    }

    .ai-recommendation-section {
      margin-bottom: 16px;
    }

    .cover-letter h4 {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 8px;
    }

    .cover-letter p {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin: 0;
    }

    :root.dark-mode .cover-letter p {
      color: #94a3b8;
    }

    .app-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-accept {
      background: rgba(34,197,94,0.14);
      color: #15803d;
      border: 1px solid rgba(34,197,94,0.24);
    }

    .btn-accept:hover:not(:disabled) {
      background: rgba(34,197,94,0.24);
    }

    .btn-reject {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
      border: 1px solid rgba(239,68,68,0.24);
    }

    .btn-reject:hover:not(:disabled) {
      background: rgba(239,68,68,0.24);
    }

    .app-status-message {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      background: rgba(34,197,94,0.12);
      color: #15803d;
    }

    .app-status-message.rejected {
      background: rgba(239,68,68,0.12);
      color: #b91c1c;
    }

    .success-message,
    .error-message {
      padding: 14px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 20px;
    }

    .success-message {
      background: rgba(34,197,94,0.12);
      color: #15803d;
    }

    .error-message {
      background: rgba(239,68,68,0.12);
      color: #b91c1c;
    }

    @media (max-width: 768px) {
      .page {
        padding: 0 12px 40px;
      }

      .card-header,
      .section-header,
      .app-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .info-grid,
      .app-info-grid {
        grid-template-columns: 1fr;
      }

      .app-actions {
        flex-direction: column;
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: var(--card-bg, #fff);
      border-radius: 20px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    :root.dark-mode .modal-content {
      background: #1e293b;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(148,163,184,0.16);
    }

    .modal-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    :root.dark-mode .modal-header h2 {
      color: #f8fafc;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(148,163,184,0.12);
      color: #64748b;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    .modal-body {
      padding: 24px;
    }

    .candidate-summary {
      background: rgba(99,102,241,0.08);
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 24px;
      display: grid;
      gap: 12px;
    }

    :root.dark-mode .candidate-summary {
      background: rgba(99,102,241,0.12);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .summary-item .label {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
    }

    .summary-item .value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .summary-item .value {
      color: #e2e8f0;
    }

    .contract-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .form-group label {
      color: #e2e8f0;
    }

    .form-control {
      padding: 12px 16px;
      border: 1px solid rgba(148,163,184,0.24);
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, #0f172a);
      background: var(--card-bg, #fff);
      transition: all 0.2s ease;
    }

    :root.dark-mode .form-control {
      background: rgba(15,23,42,0.4);
      border-color: rgba(148,163,184,0.16);
      color: #e2e8f0;
    }

    .form-control:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }

    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }

    .form-hint {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid rgba(148,163,184,0.16);
    }

    .btn-secondary {
      background: rgba(148,163,184,0.12);
      color: #475569;
      border: 1px solid rgba(148,163,184,0.24);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(148,163,184,0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(99,102,241,0.3);
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        flex-direction: column;
      }

      .modal-footer .btn {
        width: 100%;
      }
    }
  `]
})
export class MissionDetailComponent implements OnInit {
  mission: Mission | null = null;
  applications: MissionApplication[] = [];
  loading = true;
  processing = false;
  successMsg = '';
  errorMsg = '';
  
  // Modal to create a contract
  showContractModal = false;
  selectedApplication: MissionApplication | null = null;
  contractForm = {
    amount: 0,
    startDate: '',
    endDate: '',
    terms: ''
  };
  creatingContract = false;
  showSignatureModal = false;
  signatureData: string = '';
  createdContractId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionService: B2bMissionService,
    private contractService: B2bContractService,
    public nav: B2bNavService,
    private authService: AuthService,
    private activityLog: ActivityLogService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMissionDetails(+id);
    }
  }

  loadMissionDetails(missionId: number) {
    this.loading = true;
    console.log('🔍 Loading mission details for ID:', missionId);
    
    // Load mission
    this.missionService.getById(missionId).subscribe({
      next: (mission) => {
        console.log('✅ Mission loaded:', mission);
        this.mission = mission;
        
        // Load applications for this mission
        console.log('🔍 Loading applications for mission:', missionId);
        this.missionService.getApplications(missionId).subscribe({
          next: (apps) => {
            console.log('✅ Applications loaded:', apps);
            this.applications = apps || [];
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Error loading applications:', err);
            this.errorMsg = 'Error loading applications: ' + (err?.error?.message || err.message);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error loading mission:', err);
        this.loading = false;
        this.errorMsg = 'Error loading mission: ' + (err?.error?.message || err.message);
      }
    });
  }

  acceptApplication(app: MissionApplication) {
    if (!confirm(`Accept application from ${app.candidateName}?`)) {
      return;
    }

    this.processing = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.missionService.updateApplicationStatus(app.id, 'ACCEPTED').subscribe({
      next: () => {
        app.status = 'ACCEPTED';
        this.successMsg = `Application from ${app.candidateName} accepted successfully!`;
        this.processing = false;

        // Log activity
        this.authService.currentUser$.subscribe(user => {
          if (user) {
            this.activityLog.logStatusChange(
              user.email,
              user.role,
              'MissionApplication',
              app.id,
              `Application accepted for mission "${this.mission?.title}"`
            );
          }
        }).unsubscribe();

        // Show modal to create a contract
        setTimeout(() => {
          this.selectedApplication = app;
          this.prepareContractForm(app);
          this.showContractModal = true;
        }, 1000);
      },
      error: (err) => {
        this.errorMsg = 'Error accepting application';
        this.processing = false;
        console.error('Error accepting application:', err);
      }
    });
  }

  rejectApplication(app: MissionApplication) {
    if (!confirm(`Reject application from ${app.candidateName}?`)) {
      return;
    }

    this.processing = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.missionService.updateApplicationStatus(app.id, 'REJECTED').subscribe({
      next: () => {
        app.status = 'REJECTED';
        this.successMsg = `Application from ${app.candidateName} rejected.`;
        this.processing = false;

        // Log activity
        this.authService.currentUser$.subscribe(user => {
          if (user) {
            this.activityLog.logStatusChange(
              user.email,
              user.role,
              'MissionApplication',
              app.id,
              `Application rejected for mission "${this.mission?.title}"`
            );
          }
        }).unsubscribe();

        setTimeout(() => this.successMsg = '', 5000);
      },
      error: (err) => {
        this.errorMsg = 'Error rejecting application';
        this.processing = false;
        console.error('Error rejecting application:', err);
      }
    });
  }

  getCountByStatus(status: string): number {
    return this.applications.filter(app => app.status === status).length;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected'
    };
    return labels[status] || status;
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(/_/g, '-');
  }

  missionSkills(): string[] {
    if (!this.mission?.requiredSkills) return [];
    return this.mission.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getMatchClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'low';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  prepareContractForm(app: MissionApplication) {
    if (!this.mission) return;

    // Calculate total amount: proposed rate * duration in weeks * 5 days
    const durationWeeks = this.mission.durationWeeks || 4;
    const dailyRate = app.proposedRate || this.mission.dailyRate;
    const totalAmount = dailyRate * durationWeeks * 5; // 5 days per week

    // Default dates: start in 1 week, end according to duration
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // +7 days
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (durationWeeks * 7)); // +duration in days

    this.contractForm = {
      amount: totalAmount,
      startDate: this.formatDateForInput(startDate),
      endDate: this.formatDateForInput(endDate),
      terms: `Mission contract for "${this.mission.title}".\n\nDaily rate: ${dailyRate} TND/day\nDuration: ${durationWeeks} weeks\nTotal amount: ${totalAmount} TND\n\nThe freelancer commits to providing the services described in the mission.\nPayment will be made according to agreed terms.`
    };
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  createAndSignContract() {
    if (!this.selectedApplication || !this.mission) {
      this.errorMsg = 'Missing data to create contract';
      return;
    }

    // Validation
    if (!this.contractForm.amount || this.contractForm.amount <= 0) {
      this.errorMsg = 'Amount must be greater than 0';
      return;
    }

    if (!this.contractForm.startDate || !this.contractForm.endDate) {
      this.errorMsg = 'Start and end dates are required';
      return;
    }

    if (new Date(this.contractForm.endDate) <= new Date(this.contractForm.startDate)) {
      this.errorMsg = 'End date must be after start date';
      return;
    }

    // Close contract modal and open signature modal
    this.showContractModal = false;
    this.showSignatureModal = true;
  }

  onSignatureConfirmed(signatureData: string) {
    if (!this.selectedApplication || !this.mission) return;

    this.signatureData = signatureData;
    this.creatingContract = true;
    this.errorMsg = '';

    const contractRequest = {
      missionId: this.mission.id,
      candidateId: this.selectedApplication.candidateId,
      freelancerId: this.selectedApplication.candidateId,
      companyId: this.mission.companyId,
      amount: this.contractForm.amount,
      startDate: this.contractForm.startDate,
      endDate: this.contractForm.endDate,
      terms: this.contractForm.terms || '',
      contractUrl: null
    };

    console.log('📝 Creating contract with signature:', contractRequest);

    this.contractService.create(contractRequest).subscribe({
      next: (contract) => {
        console.log('✅ Contract created:', contract);
        this.createdContractId = contract.id;
        
        // Sign contract immediately with signature
        this.contractService.sign(contract.id, this.signatureData).subscribe({
          next: (signedContract) => {
            console.log('✅ Contract signed:', signedContract);
            this.creatingContract = false;
            this.showSignatureModal = false;
            
            // Log activity
            this.authService.currentUser$.subscribe(user => {
              if (user) {
                this.activityLog.logCreate(
                  user.email,
                  user.role,
                  'Contract',
                  contract.id,
                  `Contract created and signed for ${this.selectedApplication?.candidateName} - Mission: ${this.mission?.title}`
                );
              }
            }).unsubscribe();

            this.successMsg = `Contract created and signed successfully for ${this.selectedApplication?.candidateName}!`;
            setTimeout(() => {
              this.router.navigate([this.nav.basePath, 'contracts']);
            }, 2000);
          },
          error: (err) => {
            console.error('❌ Error signing contract:', err);
            this.errorMsg = 'Contract created but error signing: ' + (err?.error?.message || err.message);
            this.creatingContract = false;
            this.showSignatureModal = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error creating contract:', err);
        this.errorMsg = 'Error creating contract: ' + (err?.error?.message || err.message);
        this.creatingContract = false;
        this.showSignatureModal = false;
      }
    });
  }

  onSignatureCancelled() {
    this.showSignatureModal = false;
    this.showContractModal = true;
  }

  createContract() {
    // This method is now replaced by createAndSignContract
    this.createAndSignContract();
  }

  closeModal() {
    this.showContractModal = false;
    this.selectedApplication = null;
    this.contractForm = {
      amount: 0,
      startDate: '',
      endDate: '',
      terms: ''
    };
  }
}
