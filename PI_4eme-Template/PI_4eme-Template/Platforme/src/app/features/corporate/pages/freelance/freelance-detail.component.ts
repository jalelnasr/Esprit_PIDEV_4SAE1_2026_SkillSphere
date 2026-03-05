import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2bMissionService } from '../../../../admin/b2b/services/mission.service';
import { B2bCandidateService } from '../../../../admin/b2b/services/candidate.service';
import { Mission } from '../../../../admin/b2b/models/b2b.models';

@Component({
  selector: 'app-freelance-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detail-page" *ngIf="mission">
      <a routerLink="/freelance" class="back-link">← Back to missions</a>

      <div class="detail-card">
        <div class="detail-header">
          <div class="mission-icon">🎯</div>
          <div>
            <h1>{{ mission.title }}</h1>
            <p class="company-name">🏢 {{ mission.companyName }}</p>
            <div class="meta-row">
              <span *ngIf="mission.budget">💰 {{ mission.budget | number:'1.0-0' }} TND</span>
              <span *ngIf="mission.duration">⏱ {{ mission.duration }}</span>
              <span>� {{ mission.status }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📝 Mission Description</h2>
          <div class="desc-text">{{ mission.description }}</div>
        </div>

        <div class="section" *ngIf="mission.requiredSkills?.length">
          <h2>🎯 Required Skills</h2>
          <div class="skills-wrap">
            <span *ngFor="let s of mission.requiredSkills" class="skill">{{ s }}</span>
          </div>
        </div>

        <!-- Apply Section -->
        <div class="apply-section" *ngIf="!applied">
          <h2>📨 Apply for this Mission</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Title / Profile</label>
              <input type="text" [(ngModel)]="candidateTitle" placeholder="Ex: Angular Developer">
            </div>
            <div class="form-group">
              <label>Proposed Daily Rate (TND)</label>
              <input type="number" [(ngModel)]="proposedRate" placeholder="Ex: 400">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Skills (separated by commas)</label>
              <input type="text" [(ngModel)]="candidateSkills" placeholder="Angular, Java, Spring Boot...">
            </div>
            <div class="form-group">
              <label>Years of Experience</label>
              <input type="number" [(ngModel)]="experienceYears" placeholder="3">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Portfolio / Resume (URL)</label>
              <input type="url" [(ngModel)]="resumeUrl" placeholder="https://...">
            </div>
          </div>
          <button (click)="applyMission()" class="btn-apply" [disabled]="applying">
            {{ applying ? 'Sending...' : '🚀 Apply Now' }}
          </button>
        </div>

        <div class="success-banner" *ngIf="applied">
          ✅ Your application has been sent successfully! The company will contact you soon.
        </div>

        <div class="error-banner" *ngIf="errorMsg">
          ❌ {{ errorMsg }}
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading mission...</p>
    </div>
  `,
  styles: [`
    .detail-page { max-width: 800px; margin: 0 auto; padding: 0 16px 40px; }

    .back-link {
      display: inline-block; margin: 24px 0 16px; color: #6366f1;
      font-weight: 600; text-decoration: none; font-size: 14px;
    }
    .back-link:hover { text-decoration: underline; }

    .detail-card {
      background: var(--card-bg, #fff); border-radius: 20px; padding: 32px;
      border: 1.5px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .detail-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }

    .detail-header { display: flex; gap: 20px; margin-bottom: 28px; }
    .mission-icon {
      width: 64px; height: 64px; border-radius: 16px;
      background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; flex-shrink: 0;
    }
    .detail-header h1 { font-size: 24px; font-weight: 800; margin: 0 0 4px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .detail-header h1 { color: #f1f5f9; }
    .company-name { font-size: 14px; color: #64748b; margin: 0 0 8px; }
    .meta-row { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: #64748b; }

    .section { margin-bottom: 24px; }
    .section h2 { font-size: 17px; font-weight: 700; margin: 0 0 12px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .section h2 { color: #e2e8f0; }
    .desc-text { white-space: pre-line; color: #475569; line-height: 1.7; font-size: 15px; }
    :root.dark-mode .desc-text { color: #94a3b8; }

    .skills-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
    .skill {
      padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;
      background: #fef3c7; color: #d97706;
    }
    :root.dark-mode .skill { background: rgba(217,119,6,0.15); }

    .apply-section {
      margin-top: 28px; padding-top: 24px; border-top: 1.5px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .apply-section { border-color: rgba(255,255,255,0.06); }
    .apply-section h2 { font-size: 18px; font-weight: 700; margin: 0 0 16px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .apply-section h2 { color: #e2e8f0; }

    .form-row { display: flex; gap: 14px; margin-bottom: 14px; }
    .form-group { flex: 1; }
    .form-group.full { flex: 1 1 100%; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-group label { color: #e2e8f0; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 10px 14px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
      resize: vertical; font-family: inherit;
    }
    :root.dark-mode .form-group input, :root.dark-mode .form-group textarea {
      background: #0f172a; border-color: #334155; color: #e2e8f0;
    }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; }

    .btn-apply {
      padding: 14px 32px; border-radius: 12px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff;
      font-size: 16px; font-weight: 700; transition: all 0.2s;
    }
    .btn-apply:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(245,158,11,0.3); transform: translateY(-1px); }
    .btn-apply:disabled { opacity: 0.6; cursor: not-allowed; }

    .success-banner {
      margin-top: 24px; padding: 16px 20px; border-radius: 12px;
      background: #f0fdf4; color: #16a34a; font-weight: 600; font-size: 15px;
    }
    :root.dark-mode .success-banner { background: rgba(22,163,74,0.12); }

    .error-banner {
      margin-top: 12px; padding: 12px 16px; border-radius: 10px;
      background: #fef2f2; color: #dc2626; font-size: 14px;
    }
    :root.dark-mode .error-banner { background: rgba(220,38,38,0.12); }

    .loading-state { text-align: center; padding: 80px 20px; color: #94a3b8; }
    .spinner {
      width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #f59e0b;
      border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .form-row { flex-direction: column; }
      .detail-header { flex-direction: column; text-align: center; align-items: center; }
    }
  `]
})
export class FreelanceDetailComponent implements OnInit {
  mission: Mission | null = null;
  loading = true;
  candidateTitle = '';
  candidateSkills = '';
  experienceYears: number | null = null;
  resumeUrl = '';
  proposedRate: number | null = null;
  applying = false;
  applied = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private missionSvc: B2bMissionService,
    private candidateSvc: B2bCandidateService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.missionSvc.getById(+id).subscribe({
        next: data => { this.mission = data; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  applyMission() {
    if (!this.candidateTitle.trim()) { this.errorMsg = 'Please enter your title.'; return; }
    if (!this.proposedRate || this.proposedRate <= 0) { this.errorMsg = 'Please propose a rate.'; return; }
    this.applying = true;
    this.errorMsg = '';
    // Step 1: create candidate profile
    this.candidateSvc.create({
      id: 0,
      title: this.candidateTitle,
      skills: this.candidateSkills.split(',').map(s => s.trim()).filter(Boolean),
      experienceYears: this.experienceYears || 0,
      resumeUrl: this.resumeUrl,
      isLookingForJob: true
    }).subscribe({
      next: (candidate) => {
        // Step 2: apply to mission
        this.missionSvc.apply({
          missionId: this.mission!.id!,
          candidateId: candidate.id,
          proposedRate: this.proposedRate!
        }).subscribe({
          next: () => { this.applied = true; this.applying = false; },
          error: () => { this.errorMsg = 'Error while sending. Please try again.'; this.applying = false; }
        });
      },
      error: () => { this.errorMsg = 'Error while creating profile.'; this.applying = false; }
    });
  }
}
