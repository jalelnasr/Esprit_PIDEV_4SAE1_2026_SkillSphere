import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { B2bJobOfferService } from '../../services/job-offer.service';
import { B2bCompanyService } from '../../services/company.service';
import { B2bApplicationService, EmailNotification } from '../../services/application.service';
import { B2bCandidateService } from '../../services/candidate.service';
import { JobOfferRequest, Company, Application, Candidate } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';

@Component({
  selector: 'app-job-offer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <a [routerLink]="nav.basePath + '/jobs'" class="back-link">← Back to offers</a>
        <h1>{{ isDetail ? '💼 Offer details' : isEdit ? '✏️ Edit offer' : '➕ New job offer' }}</h1>
      </div>

      <!-- Detail view -->
      <div *ngIf="isDetail && jobDetail" class="detail-view">
        <div class="info-grid">
          <div class="info-card"><div class="info-label">Company</div><div class="info-value">{{ jobDetail.companyName }}</div></div>
          <div class="info-card"><div class="info-label">Contract</div><div class="info-value">{{ jobDetail.contractType }}</div></div>
          <div class="info-card"><div class="info-label">Location</div><div class="info-value">{{ jobDetail.location }}</div></div>
          <div class="info-card"><div class="info-label">Status</div><div class="info-value"><span class="badge" [ngClass]="jobDetail.status.toLowerCase()">{{ jobDetail.status }}</span></div></div>
        </div>
        <div class="card"><h3>Description</h3><p>{{ jobDetail.description }}</p></div>
        <div class="card">
          <h3>Required Skills</h3>
          <div class="skills"><span *ngFor="let s of parseSkills(jobDetail.requiredSkills)" class="skill-tag">{{ s }}</span></div>
        </div>

        <!-- Applications Section -->
        <div class="card applications-card">
          <div class="card-header-row">
            <h3>👤 Applications ({{ applications.length }})</h3>
            <span class="app-summary" *ngIf="applications.length > 0">
              <span class="mini-badge pending-bg">{{ countByStatus('PENDING') }} Pending</span>
              <span class="mini-badge accepted-bg">{{ countByStatus('ACCEPTED') }} Accepted</span>
              <span class="mini-badge rejected-bg">{{ countByStatus('REJECTED') }} Rejected</span>
            </span>
          </div>

          <div *ngIf="applications.length === 0" class="empty-apps">
            <div class="empty-icon">📭</div>
            <p>No applications received yet</p>
          </div>

          <div *ngIf="applications.length > 0" class="app-list">
            <div *ngFor="let app of applications" class="app-row" [ngClass]="'app-' + app.status.toLowerCase()">
              <div class="app-candidate">
                <div class="app-avatar" [style.background]="getAvatarColor(app.candidateId)">{{ (app.candidateTitle || '?').charAt(0).toUpperCase() }}</div>
                <div class="app-info">
                  <div class="app-name">{{ app.candidateTitle || 'Candidate #' + app.candidateId }}</div>
                  <div class="app-meta">
                    <span>📅 {{ app.appliedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span *ngIf="app.matchScore > 0">⭐ {{ app.matchScore }}% match</span>
                  </div>
                </div>
              </div>
              <div class="app-status-col">
                <span class="badge" [ngClass]="app.status.toLowerCase()">{{ getStatusLabel(app.status) }}</span>
              </div>
              <div class="app-actions">
                <!-- Quick actions for PENDING / REVIEWED / SHORTLISTED -->
                <ng-container *ngIf="app.status !== 'ACCEPTED' && app.status !== 'REJECTED'">
                  <button class="action-btn accept-btn" (click)="openEmailModal(app, 'ACCEPTED')" title="Accept & Notify">
                    ✅ Accept
                  </button>
                  <button class="action-btn reject-btn" (click)="openEmailModal(app, 'REJECTED')" title="Reject & Notify">
                    ❌ Reject
                  </button>
                  <select (change)="updateAppStatus(app, $event)" class="status-select">
                    <option value="" disabled selected>More...</option>
                    <option value="REVIEWED">Mark Reviewed</option>
                    <option value="SHORTLISTED">Shortlist</option>
                  </select>
                </ng-container>
                <!-- Already decided -->
                <span *ngIf="app.status === 'ACCEPTED'" class="decided-label accepted-label">✅ Accepted</span>
                <span *ngIf="app.status === 'REJECTED'" class="decided-label rejected-label">❌ Rejected</span>
                <button *ngIf="app.status === 'ACCEPTED' || app.status === 'REJECTED'" class="action-btn resend-btn" (click)="openEmailModal(app, app.status)" title="Resend notification">
                  📧 Resend Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Notification Modal -->
      <div class="modal-overlay" *ngIf="showEmailModal" (click)="closeEmailModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header" [ngClass]="emailAction === 'ACCEPTED' ? 'modal-accept' : 'modal-reject'">
            <div class="modal-icon">{{ emailAction === 'ACCEPTED' ? '🎉' : '📩' }}</div>
            <h2>{{ emailAction === 'ACCEPTED' ? 'Accept Candidate' : 'Reject Candidate' }}</h2>
            <p>Send an email notification to <strong>{{ selectedApp?.candidateTitle }}</strong></p>
          </div>
          <div class="modal-body">
            <div class="modal-info-row">
              <div class="modal-info-item">
                <label>Candidate</label>
                <span>{{ selectedApp?.candidateTitle || '#' + selectedApp?.candidateId }}</span>
              </div>
              <div class="modal-info-item">
                <label>Job Offer</label>
                <span>{{ jobDetail?.title }}</span>
              </div>
              <div class="modal-info-item">
                <label>Company</label>
                <span>{{ jobDetail?.companyName }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>Candidate Email *</label>
              <input type="email" [(ngModel)]="emailForm.candidateEmail" placeholder="candidate@email.com" class="form-control">
            </div>
            <div class="form-group">
              <label>Personal Message (optional)</label>
              <textarea [(ngModel)]="emailForm.message" rows="4" class="form-control textarea"
                [placeholder]="emailAction === 'ACCEPTED'
                  ? 'Congratulations! We are pleased to inform you that your application has been accepted...'
                  : 'Thank you for your interest. After careful review, we regret to inform you...'"></textarea>
            </div>
            <div class="email-preview">
              <div class="preview-label">📧 Email Preview</div>
              <div class="preview-content">
                <div class="preview-subject">
                  <strong>Subject:</strong> {{ emailAction === 'ACCEPTED' ? '🎉' : '📩' }} Application Update — {{ jobDetail?.title }} at {{ jobDetail?.companyName }}
                </div>
                <div class="preview-body">
                  <p>Dear <strong>{{ selectedApp?.candidateTitle }}</strong>,</p>
                  <p *ngIf="emailAction === 'ACCEPTED'">
                    We are delighted to inform you that your application for the position of <strong>{{ jobDetail?.title }}</strong> at <strong>{{ jobDetail?.companyName }}</strong> has been <span class="text-green">accepted</span>! 🎉
                  </p>
                  <p *ngIf="emailAction === 'REJECTED'">
                    Thank you for your interest in the position of <strong>{{ jobDetail?.title }}</strong> at <strong>{{ jobDetail?.companyName }}</strong>. After careful review, we regret to inform you that your application has not been <span class="text-red">retained</span>.
                  </p>
                  <p *ngIf="emailForm.message" class="custom-msg">
                    <em>"{{ emailForm.message }}"</em>
                  </p>
                  <p>Best regards,<br><strong>{{ jobDetail?.companyName }} HR Team</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeEmailModal()">Cancel</button>
            <button class="btn" [ngClass]="emailAction === 'ACCEPTED' ? 'btn-accept' : 'btn-reject'"
              (click)="confirmAndSendEmail()" [disabled]="sending || !emailForm.candidateEmail">
              {{ sending ? 'Sending...' : (emailAction === 'ACCEPTED' ? '✅ Accept & Send Email' : '❌ Reject & Send Email') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success toast -->
      <div class="toast-notification" *ngIf="toastMsg" [ngClass]="toastType">
        {{ toastMsg }}
      </div>

      <!-- Create/Edit form -->
      <div class="form-card" *ngIf="!isDetail">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Company *</label>
            <select [(ngModel)]="form.companyId" name="companyId" class="form-control" required>
              <option [value]="0" disabled>— Select —</option>
              <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Job Title *</label>
            <input type="text" [(ngModel)]="form.title" name="title" class="form-control" required placeholder="E.g.: Full Stack Developer">
          </div>
          <div class="form-group">
            <label>Description *</label>
            <textarea [(ngModel)]="form.description" name="description" class="form-control textarea" required rows="4" placeholder="Job description..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Contract Type *</label>
              <select [(ngModel)]="form.contractType" name="contractType" class="form-control" required>
                <option value="" disabled>— Select —</option>
                <option value="CDI">Permanent</option>
                <option value="CDD">Fixed-term</option>
                <option value="Stage">Internship</option>
                <option value="Alternance">Apprenticeship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div class="form-group">
              <label>Location *</label>
              <input type="text" [(ngModel)]="form.location" name="location" class="form-control" required placeholder="E.g.: Paris, Remote">
            </div>
          </div>
          <div class="form-group">
            <label>Required Skills</label>
            <div class="tags-input">
              <span *ngFor="let s of form.requiredSkills; let i = index" class="skill-tag">
                {{ s }} <button type="button" (click)="removeSkill(i)" class="tag-remove">×</button>
              </span>
              <div class="skill-input-row">
                <input type="text" [(ngModel)]="newSkill" name="newSkill" (keydown.enter)="addSkill(); $event.preventDefault()" placeholder="Type a skill and press Enter or click +">
                <button type="button" class="btn-add-skill" (click)="addSkill()">+</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a [routerLink]="nav.basePath + '/jobs'" class="btn btn-cancel">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="!isValid()">{{ isEdit ? 'Update' : 'Publish' }}</button>
          </div>
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 850px; }
    .page-header { margin-bottom: 24px; }
    .back-link { color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 8px 0 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .info-card { background: var(--card-bg, #fff); padding: 14px 18px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .info-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .info-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .info-value { font-size: 15px; font-weight: 700; color: var(--text-primary, #0f172a); }
    :root.dark-mode .info-value { color: #f1f5f9; }

    .card { background: var(--card-bg, #fff); border-radius: 14px; padding: 20px; border: 1px solid rgba(0,0,0,0.06); margin-bottom: 16px; }
    :root.dark-mode .card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .card h3 { font-size: 16px; font-weight: 700; margin: 0 0 12px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .card h3 { color: #f1f5f9; }
    .card p { font-size: 14px; color: #64748b; line-height: 1.6; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #ede9fe; color: #6366f1; display: inline-flex; align-items: center; gap: 4px; }
    :root.dark-mode .skill-tag { background: rgba(99,102,241,0.15); }

    /* Applications section */
    .applications-card { padding: 24px; }
    .card-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .app-summary { display: flex; gap: 8px; }
    .mini-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .pending-bg { background: #fef3c7; color: #d97706; }
    .accepted-bg { background: #dcfce7; color: #16a34a; }
    .rejected-bg { background: #fef2f2; color: #dc2626; }
    .empty-apps { text-align: center; padding: 40px 20px; }
    .empty-icon { font-size: 48px; margin-bottom: 8px; }
    .empty-apps p { color: #94a3b8; font-size: 15px; }

    .app-list { display: flex; flex-direction: column; gap: 10px; }
    .app-row { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.06); transition: all 0.2s; }
    :root.dark-mode .app-row { border-color: rgba(255,255,255,0.06); }
    .app-row:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .app-row.app-accepted { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.03); }
    .app-row.app-rejected { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.02); opacity: 0.7; }
    .app-candidate { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .app-avatar { width: 42px; height: 42px; border-radius: 12px; color: #fff; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .app-info { min-width: 0; }
    .app-name { font-size: 14px; font-weight: 700; color: var(--text-primary, #0f172a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    :root.dark-mode .app-name { color: #f1f5f9; }
    .app-meta { display: flex; gap: 12px; font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .app-status-col { flex-shrink: 0; }
    .app-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .action-btn { padding: 6px 14px; border-radius: 8px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .accept-btn { background: #dcfce7; color: #16a34a; }
    .accept-btn:hover { background: #22c55e; color: #fff; }
    .reject-btn { background: #fef2f2; color: #dc2626; }
    .reject-btn:hover { background: #ef4444; color: #fff; }
    .resend-btn { background: #ede9fe; color: #6366f1; }
    .resend-btn:hover { background: #6366f1; color: #fff; }
    .decided-label { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 8px; }
    .accepted-label { background: #dcfce7; color: #16a34a; }
    .rejected-label { background: #fef2f2; color: #dc2626; }

    .badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
    .badge.open { background: #dcfce7; color: #16a34a; }
    .badge.closed { background: #fef2f2; color: #dc2626; }
    .badge.filled { background: #dbeafe; color: #2563eb; }
    .badge.pending { background: #fef3c7; color: #d97706; }
    .badge.reviewed { background: #dbeafe; color: #2563eb; }
    .badge.shortlisted { background: #ede9fe; color: #6366f1; }
    .badge.accepted { background: #dcfce7; color: #16a34a; }
    .badge.rejected { background: #fef2f2; color: #dc2626; }
    .status-select { padding: 4px 8px; border-radius: 6px; font-size: 12px; border: 1px solid #e2e8f0; background: var(--card-bg, #fff); cursor: pointer; }
    :root.dark-mode .status-select { background: #0f172a; border-color: #334155; color: #e2e8f0; }

    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-card { background: var(--card-bg, #fff); border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    :root.dark-mode .modal-card { background: #1e293b; }
    .modal-header { padding: 28px 28px 20px; border-bottom: 1px solid rgba(0,0,0,0.06); text-align: center; }
    :root.dark-mode .modal-header { border-color: rgba(255,255,255,0.06); }
    .modal-accept { background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02)); }
    .modal-reject { background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)); }
    .modal-icon { font-size: 40px; margin-bottom: 8px; }
    .modal-header h2 { font-size: 20px; font-weight: 800; margin: 0 0 4px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .modal-header h2 { color: #f1f5f9; }
    .modal-header p { font-size: 14px; color: #64748b; margin: 0; }
    .modal-body { padding: 24px 28px; }
    .modal-info-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .modal-info-item { text-align: center; padding: 10px; border-radius: 10px; background: rgba(99,102,241,0.04); }
    :root.dark-mode .modal-info-item { background: rgba(99,102,241,0.1); }
    .modal-info-item label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
    .modal-info-item span { font-size: 13px; font-weight: 700; color: var(--text-primary, #0f172a); }
    :root.dark-mode .modal-info-item span { color: #e2e8f0; }
    .modal-footer { padding: 16px 28px 24px; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-accept { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
    .btn-reject { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
    .btn-accept:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Email preview */
    .email-preview { margin-top: 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    :root.dark-mode .email-preview { border-color: #334155; }
    .preview-label { padding: 8px 14px; background: #f8fafc; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    :root.dark-mode .preview-label { background: #0f172a; border-color: #334155; }
    .preview-content { padding: 16px; font-size: 13px; color: var(--text-primary, #0f172a); line-height: 1.6; }
    :root.dark-mode .preview-content { color: #e2e8f0; }
    .preview-subject { padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; margin-bottom: 10px; font-size: 12px; }
    :root.dark-mode .preview-subject { border-color: #334155; }
    .preview-body p { margin: 6px 0; }
    .text-green { color: #16a34a; font-weight: 700; }
    .text-red { color: #dc2626; font-weight: 700; }
    .custom-msg { padding: 8px 12px; border-left: 3px solid #6366f1; background: rgba(99,102,241,0.04); border-radius: 0 8px 8px 0; margin: 10px 0 !important; }

    /* Toast */
    .toast-notification { position: fixed; bottom: 30px; right: 30px; padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; z-index: 2000; animation: slideUp 0.3s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
    .toast-notification.success { background: #22c55e; color: #fff; }
    .toast-notification.error { background: #ef4444; color: #fff; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .form-card { background: var(--card-bg, #fff); border-radius: 16px; padding: 32px; border: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .form-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; }
    .form-control { width: 100%; padding: 12px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-control { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .form-control:focus { outline: none; border-color: #6366f1; }
    .textarea { resize: vertical; font-family: inherit; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .tags-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); min-height: 42px; align-items: center; }    .skill-input-row { display: flex; gap: 6px; align-items: center; flex: 1; min-width: 180px; }
    .skill-input-row input { flex: 1; }
    .btn-add-skill { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 8px; width: 32px; height: 32px; font-size: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .btn-add-skill:hover { opacity: 0.9; }    :root.dark-mode .tags-input { background: #0f172a; border-color: #334155; }
    .tags-input input { border: none; background: transparent; outline: none; font-size: 14px; flex: 1; min-width: 120px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .tags-input input { color: #e2e8f0; }
    .tag-remove { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; padding: 0 2px; }

    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; }
    .btn { padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; text-decoration: none; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
    :root.dark-mode .btn-cancel { border-color: #334155; color: #94a3b8; }
    .error-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 14px; }
    .success-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #f0fdf4; color: #16a34a; font-size: 14px; }

    @media (max-width: 768px) {
      .app-row { flex-direction: column; align-items: flex-start; gap: 10px; }
      .app-actions { flex-wrap: wrap; }
      .modal-info-row { grid-template-columns: 1fr; }
    }
  `]
})
export class JobOfferFormComponent implements OnInit {
  isEdit = false;
  isDetail = false;
  jobId = 0;
  companies: Company[] = [];
  applications: Application[] = [];
  jobDetail: any = null;
  newSkill = '';

  form: JobOfferRequest = { companyId: 0, title: '', description: '', contractType: '', location: '', requiredSkills: [] };
  errorMsg = '';
  successMsg = '';

  // Email modal
  showEmailModal = false;
  selectedApp: Application | null = null;
  emailAction: 'ACCEPTED' | 'REJECTED' = 'ACCEPTED';
  emailForm: EmailNotification = { candidateEmail: '', candidateName: '', jobTitle: '', companyName: '', status: '', message: '' };
  sending = false;
  toastMsg = '';
  toastType = '';

  private avatarColors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #22c55e, #10b981)',
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #8b5cf6, #a855f7)',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobSvc: B2bJobOfferService,
    private companySvc: B2bCompanyService,
    private appSvc: B2bApplicationService,
    private candidateSvc: B2bCandidateService,
    private authSvc: AuthService,
    private activityLog: ActivityLogService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      const role = user?.role;
      const companyId = user?.companyId;
      if ((role === 'RH_ENTREPRISE' || role === 'MANAGER') && companyId) {
        this.form.companyId = companyId;
        this.companySvc.getById(companyId).subscribe(c => this.companies = c ? [c] : []);
      } else {
        this.companySvc.getAll().subscribe(c => this.companies = c || []);
      }
    });
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.router.url;

    if (id && id !== 'new') {
      this.jobId = +id;
      if (url.endsWith('/edit')) {
        this.isEdit = true;
        this.jobSvc.getById(this.jobId).subscribe(j => {
          // Backend may return requiredSkills as comma-separated string
          const skills = typeof j.requiredSkills === 'string'
            ? (j.requiredSkills as string).split(',').map(s => s.trim()).filter(s => s)
            : [...j.requiredSkills];
          this.form = { companyId: j.companyId, title: j.title, description: j.description, contractType: j.contractType, location: j.location, requiredSkills: skills };
        });
      } else {
        this.isDetail = true;
        this.jobSvc.getById(this.jobId).subscribe(j => this.jobDetail = j);
        this.appSvc.getAll().subscribe(apps => {
          this.applications = (apps || []).filter(a => a.jobOfferId === this.jobId);
        });
      }
    }
  }

  addSkill() {
    const s = this.newSkill.trim();
    if (s && !this.form.requiredSkills.includes(s)) { this.form.requiredSkills.push(s); }
    this.newSkill = '';
  }

  removeSkill(i: number) { this.form.requiredSkills.splice(i, 1); }

  isValid(): boolean {
    return this.form.companyId > 0 && !!this.form.title && !!this.form.description && !!this.form.contractType && !!this.form.location;
  }

  onSubmit() {
    if (!this.isValid()) return;
    // Auto-add any pending skill typed in the input
    if (this.newSkill.trim()) { this.addSkill(); }
    this.errorMsg = '';
    this.successMsg = '';
    // Backend expects requiredSkills as comma-separated string, not array
    const payload: any = {
      ...this.form,
      requiredSkills: Array.isArray(this.form.requiredSkills)
        ? this.form.requiredSkills.join(',')
        : this.form.requiredSkills
    };
    const obs = this.isEdit ? this.jobSvc.update(this.jobId, payload) : this.jobSvc.create(payload);
    obs.subscribe({
      next: (res: any) => {
        this.successMsg = this.isEdit ? 'Offer updated!' : 'Offer published successfully!';
        const user = this.authSvc.currentUser$ ? undefined : undefined;
        this.authSvc.currentUser$.subscribe(u => {
          if (u) {
            if (this.isEdit) {
              this.activityLog.logUpdate(u.email, u.role, 'JobOffer', this.jobId, `Updated job offer "${this.form.title}"`);
            } else {
              this.activityLog.logCreate(u.email, u.role, 'JobOffer', res?.id || 0, `Published job offer "${this.form.title}" — ${this.form.contractType}, ${this.form.location}`);
            }
          }
        }).unsubscribe();
        setTimeout(() => this.router.navigate([this.nav.basePath + '/jobs']), 1200);
      },
      error: (err) => { this.errorMsg = err.error?.message || 'Error'; }
    });
  }

  updateAppStatus(app: Application, evt: any) {
    const status = evt.target.value;
    if (status) {
      this.appSvc.updateStatus(app.id, status).subscribe(() => {
        app.status = status;
        this.showToast(`Status updated to ${status}`, 'success');
      });
    }
  }

  // ---- Email notification modal ----

  getAvatarColor(id: number): string {
    return this.avatarColors[id % this.avatarColors.length];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: '⏳ Pending', REVIEWED: '👀 Reviewed', SHORTLISTED: '⭐ Shortlisted',
      ACCEPTED: '✅ Accepted', REJECTED: '❌ Rejected'
    };
    return labels[status] || status;
  }

  countByStatus(status: string): number {
    return this.applications.filter(a => a.status === status).length;
  }

  openEmailModal(app: Application, action: 'ACCEPTED' | 'REJECTED') {
    this.selectedApp = app;
    this.emailAction = action;
    this.emailForm = {
      candidateEmail: '',
      candidateName: app.candidateTitle || 'Candidate #' + app.candidateId,
      jobTitle: this.jobDetail?.title || '',
      companyName: this.jobDetail?.companyName || '',
      status: action,
      message: ''
    };

    // Try to get candidate email from user API
    this.loadCandidateEmail(app.candidateId);
    this.showEmailModal = true;
  }

  loadCandidateEmail(candidateId: number) {
    // candidateId is also the userId — try to get email from user API
    this.candidateSvc.getById(candidateId).subscribe({
      next: (_candidate) => {
        // The candidate record doesn't store email, so we'll use the user API
        // Try fetching from /api/users/{id}
        import('../../../../core/services/auth.service').then(() => {
          // The candidate ID is also used as user ID
          // We'll try to fetch the user info
          const http = (this.appSvc as any).http || (this.candidateSvc as any).http;
          if (http) {
            http.get(`/api/users/${candidateId}`).subscribe({
              next: (user: any) => {
                if (user?.email) {
                  this.emailForm.candidateEmail = user.email;
                }
              },
              error: () => { /* User will enter email manually */ }
            });
          }
        });
      },
      error: () => {}
    });
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.selectedApp = null;
    this.sending = false;
  }

  confirmAndSendEmail() {
    if (!this.selectedApp || !this.emailForm.candidateEmail) return;
    this.sending = true;

    // Step 1: Update the application status
    this.appSvc.updateStatus(this.selectedApp.id, this.emailAction).subscribe({
      next: () => {
        this.selectedApp!.status = this.emailAction;

        // Step 2: Send the email notification
        this.appSvc.sendNotification(this.emailForm).subscribe({
          next: () => {
            this.showToast(
              this.emailAction === 'ACCEPTED'
                ? `✅ Candidate accepted & email sent to ${this.emailForm.candidateEmail}`
                : `📧 Candidate rejected & email sent to ${this.emailForm.candidateEmail}`,
              'success'
            );
            this.closeEmailModal();

            // Log activity
            this.authSvc.currentUser$.subscribe(u => {
              if (u) {
                this.activityLog.logUpdate(
                  u.email, u.role, 'Application', this.selectedApp?.id || 0,
                  `${this.emailAction} candidate "${this.emailForm.candidateName}" for "${this.emailForm.jobTitle}" — email sent to ${this.emailForm.candidateEmail}`
                );
              }
            }).unsubscribe();
          },
          error: () => {
            // Status was updated but email failed — still show partial success
            this.showToast(`⚠️ Status updated to ${this.emailAction} but email failed to send. Check backend email config.`, 'error');
            this.closeEmailModal();
          }
        });
      },
      error: () => {
        this.showToast('❌ Failed to update application status', 'error');
        this.sending = false;
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => { this.toastMsg = ''; }, 5000);
  }

  parseSkills(skills: any): string[] {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    return [];
  }
}
