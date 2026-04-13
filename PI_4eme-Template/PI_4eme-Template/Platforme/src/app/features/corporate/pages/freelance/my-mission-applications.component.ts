import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { B2bMissionService } from '../../../../admin/b2b/services/mission.service';
import { B2bCandidateService } from '../../../../admin/b2b/services/candidate.service';
import { MissionApplication } from '../../../../admin/b2b/models/b2b.models';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-my-mission-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="applications-page">
      <section class="hero-shell">
        <div class="hero-copy">
          <div class="hero-badge">My applications</div>
          <h1>Track your mission applications</h1>
          <p>
            View all your submitted applications and application status.
          </p>
        </div>

        <div class="hero-metrics">
          <div class="metric-card">
            <span class="metric-label">Total applications</span>
            <strong>{{ applications.length }}</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">Pending review</span>
            <strong>{{ pendingCount }}</strong>
          </div>
          <div class="metric-card accent">
            <span class="metric-label">Accepted</span>
            <strong>{{ acceptedCount }}</strong>
          </div>
        </div>
      </section>

      <div class="content-shell">
        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div>
          <p>Loading your applications...</p>
        </div>

        <ng-container *ngIf="!loading">
          <section *ngIf="applications.length > 0; else emptyState" class="applications-list">
            <article *ngFor="let app of applications; trackBy: trackByAppId" class="app-card">
              <div class="app-card-top">
                <div class="mission-info">
                  <h3>{{ app.missionTitle || 'Mission #' + app.missionId }}</h3>
                  <p class="company-name">🏢 {{ getCompanyName(app) }}</p>
                </div>
                <span class="status-pill" [ngClass]="statusClass(app.status)">{{ statusLabel(app.status) }}</span>
              </div>

              <div class="app-meta">
                <div class="meta-item">
                  <span class="meta-label">💰 Your Rate</span>
                  <strong>{{ app.proposedRate }} TND/day</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">📊 Match Score</span>
                  <strong [ngClass]="matchScoreClass(app.matchScore)">{{ app.matchScore }}%</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">👤 Your Profile</span>
                  <strong>{{ app.candidateName || 'Candidate' }}</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">📅 Applied</span>
                  <strong>{{ formatDate(app.appliedAt) }}</strong>
                </div>
              </div>

              <div class="app-footer">
                <a [routerLink]="['/freelance', app.missionId]" class="view-mission-btn">View mission</a>
                <button *ngIf="app.status === 'PENDING'" (click)="cancelApplication(app)" class="cancel-btn">Cancel application</button>
              </div>
            </article>
          </section>

          <ng-template #emptyState>
            <div class="empty-state">
              <div class="empty-icon">📋</div>
              <h3>No applications yet</h3>
              <p>Start exploring missions and submit your applications to see them here.</p>
              <a routerLink="/freelance" class="explore-btn">Explore missions</a>
            </div>
          </ng-template>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .applications-page {
      position: relative;
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 16px 56px;
    }

    .applications-page::before {
      content: '';
      position: absolute;
      inset: 0 auto auto 50%;
      width: min(960px, 92vw);
      height: 320px;
      transform: translateX(-50%);
      background: radial-gradient(circle at top, rgba(245,158,11,0.18), transparent 66%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-shell,
    .content-shell {
      position: relative;
      z-index: 1;
    }

    .hero-shell {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.85fr);
      gap: 20px;
      align-items: stretch;
      padding: 32px 0 24px;
    }

    .hero-copy,
    .hero-metrics,
    .app-card,
    .empty-state {
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(15,23,42,0.08);
      box-shadow: 0 18px 50px rgba(15,23,42,0.06);
      backdrop-filter: blur(14px);
    }

    :root.dark-mode .hero-copy,
    :root.dark-mode .hero-metrics,
    :root.dark-mode .app-card,
    :root.dark-mode .empty-state {
      background: rgba(15,23,42,0.82);
      border-color: rgba(148,163,184,0.14);
      box-shadow: 0 22px 50px rgba(2,6,23,0.32);
    }

    .hero-copy {
      border-radius: 28px;
      padding: 30px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      padding: 7px 14px;
      border-radius: 999px;
      background: rgba(245,158,11,0.12);
      color: #b45309;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    :root.dark-mode .hero-badge {
      background: rgba(245,158,11,0.18);
      color: #fbbf24;
    }

    .hero-copy h1 {
      margin: 0 0 14px;
      font-size: clamp(2rem, 4vw, 3.5rem);
      line-height: 1.02;
      color: var(--text-primary, #0f172a);
      letter-spacing: -0.04em;
      max-width: 12ch;
    }

    :root.dark-mode .hero-copy h1 { color: #f8fafc; }

    .hero-copy p {
      margin: 0;
      max-width: 60ch;
      color: #64748b;
      font-size: 16px;
      line-height: 1.7;
    }

    .hero-metrics {
      border-radius: 28px;
      padding: 20px;
      display: grid;
      gap: 14px;
      align-content: stretch;
    }

    .metric-card {
      border-radius: 22px;
      padding: 18px 18px 20px;
      background: rgba(255,255,255,0.65);
      border: 1px solid rgba(15,23,42,0.08);
    }

    :root.dark-mode .metric-card {
      background: rgba(15,23,42,0.56);
      border-color: rgba(148,163,184,0.14);
    }

    .metric-card.accent {
      background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.12));
      border-color: rgba(245,158,11,0.2);
    }

    .metric-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 10px;
    }

    .metric-card strong {
      display: block;
      font-size: 28px;
      line-height: 1;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .metric-card strong { color: #f8fafc; }

    .content-shell { display: grid; gap: 18px; }

    .loading-state {
      text-align: center;
      padding: 72px 20px;
      color: #64748b;
      border-radius: 24px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 14px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .applications-list {
      display: grid;
      gap: 16px;
    }

    .app-card {
      border-radius: 24px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .app-card:hover {
      transform: translateY(-3px);
      border-color: rgba(245,158,11,0.26);
      box-shadow: 0 20px 40px rgba(15,23,42,0.08);
    }

    .app-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .mission-info h3 {
      margin: 0 0 5px;
      font-size: 18px;
      line-height: 1.25;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .mission-info h3 { color: #f8fafc; }

    .company-name {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-pending { background: rgba(59,130,246,0.14); color: #1d4ed8; }
    .status-accepted { background: rgba(34,197,94,0.14); color: #15803d; }
    .status-rejected { background: rgba(239,68,68,0.14); color: #b91c1c; }

    :root.dark-mode .status-pending { color: #93c5fd; }
    :root.dark-mode .status-accepted { color: #4ade80; }
    :root.dark-mode .status-rejected { color: #fca5a5; }

    .app-meta {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    .meta-item {
      padding: 12px;
      border-radius: 16px;
      background: rgba(148,163,184,0.08);
    }

    :root.dark-mode .meta-item { background: rgba(148,163,184,0.12); }

    .meta-label {
      display: block;
      margin-bottom: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #94a3b8;
    }

    .meta-item strong {
      font-size: 14px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .meta-item strong { color: #f8fafc; }

    .match-excellent { color: #15803d !important; font-weight: 800; }
    .match-good { color: #1d4ed8 !important; font-weight: 800; }
    .match-average { color: #b45309 !important; font-weight: 800; }
    .match-low { color: #b91c1c !important; font-weight: 800; }

    :root.dark-mode .match-excellent { color: #4ade80 !important; }
    :root.dark-mode .match-good { color: #93c5fd !important; }
    :root.dark-mode .match-average { color: #fbbf24 !important; }
    :root.dark-mode .match-low { color: #fca5a5 !important; }

    .app-footer {
      display: flex;
      gap: 12px;
      margin-top: auto;
      padding-top: 4px;
    }

    .view-mission-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 14px;
      border-radius: 14px;
      color: #fff;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      box-shadow: 0 12px 22px rgba(79,70,229,0.2);
      text-decoration: none;
      font-size: 14px;
    }

    .view-mission-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 26px rgba(79,70,229,0.26);
    }

    .cancel-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 14px;
      border-radius: 14px;
      color: #b91c1c;
      font-weight: 700;
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.24);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn:hover {
      background: rgba(239,68,68,0.18);
      transform: translateY(-1px);
    }

    :root.dark-mode .cancel-btn {
      color: #fca5a5;
      background: rgba(239,68,68,0.18);
    }

    .empty-state {
      border-radius: 26px;
      padding: 52px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px;
      font-size: 20px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .empty-state h3 { color: #f8fafc; }

    .empty-state p {
      margin: 0 0 20px;
      color: #64748b;
      line-height: 1.6;
    }

    .explore-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 18px;
      border-radius: 14px;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: #fff;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 14px 28px rgba(245,158,11,0.24);
    }

    .explore-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 18px 30px rgba(245,158,11,0.3);
    }

    @media (max-width: 920px) {
      .hero-shell {
        grid-template-columns: 1fr;
      }
      .app-meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .applications-page { padding-inline: 12px; }
      .hero-copy,
      .hero-metrics,
      .app-card,
      .empty-state {
        border-radius: 22px;
      }
      .hero-copy { padding: 24px; }
      .app-meta { grid-template-columns: 1fr; }
      .app-footer {
        flex-direction: column;
      }
      .view-mission-btn,
      .cancel-btn {
        width: 100%;
      }
    }
  `]
})
export class MyMissionApplicationsComponent implements OnInit {
  applications: MissionApplication[] = [];
  loading = true;
  candidateId: number | null = null;
  pendingCount = 0;
  acceptedCount = 0;

  constructor(
    private missionSvc: B2bMissionService,
    private candidateSvc: B2bCandidateService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current user's candidate profile
    this.authService.currentUser$.subscribe(user => {
      if (user && user.idUser) {
        this.candidateSvc.getByUserId(user.idUser).subscribe({
          next: (candidate) => {
            this.candidateId = candidate.id;
            this.loadApplications();
          },
          error: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  loadApplications() {
    if (this.candidateId) {
      this.missionSvc.getApplicationsByCandidate(this.candidateId).subscribe({
        next: (data) => {
          this.applications = data || [];
          this.updateCounts();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  updateCounts() {
    this.pendingCount = this.applications.filter(a => a.status === 'PENDING').length;
    this.acceptedCount = this.applications.filter(a => a.status === 'ACCEPTED').length;
  }

  trackByAppId(_index: number, app: MissionApplication) {
    return app.id;
  }

  statusLabel(status: string) {
    const labels: Record<string, string> = {
      PENDING: 'Pending review',
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected'
    };
    return labels[status] || status;
  }

  statusClass(status: string) {
    return `status-pill status-${status.toLowerCase()}`;
  }

  getCompanyName(app: MissionApplication): string {
    return (app as any).companyName || 'Company';
  }

  matchScoreClass(score: number): string {
    if (score >= 80) return 'match-excellent';
    if (score >= 60) return 'match-good';
    if (score >= 40) return 'match-average';
    return 'match-low';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  cancelApplication(app: MissionApplication) {
    if (!confirm('Are you sure you want to cancel this application?')) {
      return;
    }

    this.missionSvc.deleteApplication(app.id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== app.id);
        this.updateCounts();
      },
      error: (err) => {
        console.error('Error canceling application:', err);
        alert('Error canceling application. Please try again.');
      }
    });
  }
}
