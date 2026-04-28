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
    <div class="detail-page">
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading mission...</p>
      </div>

      <ng-container *ngIf="!loading && mission">
        <a routerLink="/freelance" class="back-link">← Back to missions</a>

        <section class="hero-card">
          <div class="hero-copy">
            <div class="hero-top">
              <div class="mission-icon">FM</div>
              <span class="status-pill" [ngClass]="statusClass(mission.status)">{{ statusLabel(mission.status) }}</span>
            </div>

            <h1>{{ mission.title }}</h1>
            <p class="company-name">{{ mission.companyName }}</p>
            <p class="hero-description">{{ mission.description }}</p>

            <div class="hero-tags">
              <span class="tag">{{ missionBudget(mission) }}</span>
              <span class="tag">{{ mission.durationWeeks }} weeks</span>
              <span class="tag">{{ mission.applicationCount }} applications</span>
            </div>
          </div>

          <aside class="summary-card">
            <span class="summary-label">Mission summary</span>
            <div class="summary-item">
              <span>Budget</span>
              <strong>{{ missionBudget(mission) }}</strong>
            </div>
            <div class="summary-item">
              <span>Duration</span>
              <strong>{{ mission.durationWeeks }} weeks</strong>
            </div>
            <div class="summary-item">
              <span>Status</span>
              <strong>{{ statusLabel(mission.status) }}</strong>
            </div>
            <div class="summary-note">
              Apply with a clear profile and a proposed rate that fits the mission scope.
            </div>
          </aside>
        </section>

        <section class="detail-grid">
          <article class="content-card">
            <div class="section">
              <h2>Mission description</h2>
              <div class="desc-text">{{ mission.description }}</div>
            </div>

            <div class="section" *ngIf="mission.requiredSkills">
              <h2>Required skills</h2>
              <div class="skills-wrap">
                <span *ngFor="let s of parseSkills(mission.requiredSkills)" class="skill">{{ s }}</span>
              </div>
            </div>
          </article>

          <article class="content-card apply-card">
            <div class="apply-header">
              <h2>Apply for this mission</h2>
              <p>Build a short but specific application. The company will contact you after review.</p>
            </div>

            <div class="apply-form" *ngIf="!applied">
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
                <div class="form-group full">
                  <label>Portfolio / Resume (URL) <span class="optional">(optionnel)</span></label>
                  <input type="url" [(ngModel)]="resumeUrl" placeholder="https://... (optionnel)">
                </div>
              </div>

              <button (click)="applyMission()" class="btn-apply" [disabled]="applying">
                {{ applying ? 'Sending...' : 'Apply now' }}
              </button>
            </div>

            <div class="success-banner" *ngIf="applied">
              ✅ Votre candidature a été envoyée avec succès ! L'entreprise vous contactera bientôt.
              <br><br>
              <a routerLink="/freelance" class="link-candidatures">
                📋 Voir mes candidatures
              </a>
            </div>

            <div class="error-banner" *ngIf="errorMsg">
              {{ errorMsg }}
            </div>
          </article>
        </section>
      </ng-container>
    </div>
  `,
  styles: [`
    .detail-page {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 16px 44px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 24px 0 18px;
      color: #6366f1;
      font-weight: 700;
      text-decoration: none;
      font-size: 14px;
    }

    .back-link:hover { text-decoration: underline; }

    .hero-card,
    .content-card,
    .loading-state {
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(15,23,42,0.08);
      box-shadow: 0 18px 50px rgba(15,23,42,0.06);
      backdrop-filter: blur(14px);
    }

    :root.dark-mode .hero-card,
    :root.dark-mode .content-card,
    :root.dark-mode .loading-state {
      background: rgba(15,23,42,0.82);
      border-color: rgba(148,163,184,0.14);
      box-shadow: 0 22px 50px rgba(2,6,23,0.32);
    }

    .hero-card {
      border-radius: 30px;
      padding: 24px;
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.7fr);
      gap: 18px;
      align-items: stretch;
    }

    .hero-copy {
      border-radius: 24px;
      padding: 6px;
    }

    .hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .mission-icon {
      width: 54px;
      height: 54px;
      border-radius: 18px;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.05em;
      box-shadow: 0 14px 26px rgba(245,158,11,0.24);
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-open { background: rgba(34,197,94,0.14); color: #15803d; }
    .status-in-progress { background: rgba(59,130,246,0.14); color: #1d4ed8; }
    .status-completed { background: rgba(168,85,247,0.14); color: #7e22ce; }
    .status-cancelled { background: rgba(239,68,68,0.14); color: #b91c1c; }

    :root.dark-mode .status-open { color: #4ade80; }
    :root.dark-mode .status-in-progress { color: #93c5fd; }
    :root.dark-mode .status-completed { color: #d8b4fe; }
    :root.dark-mode .status-cancelled { color: #fca5a5; }

    .hero-copy h1 {
      margin: 0 0 10px;
      font-size: clamp(2rem, 3.2vw, 3rem);
      line-height: 1.08;
      color: var(--text-primary, #0f172a);
      letter-spacing: -0.04em;
    }

    :root.dark-mode .hero-copy h1 { color: #f8fafc; }

    .company-name {
      margin: 0 0 10px;
      color: #64748b;
      font-size: 15px;
      font-weight: 600;
    }

    .hero-description {
      margin: 0;
      color: #475569;
      line-height: 1.75;
      font-size: 15px;
      white-space: pre-line;
    }

    :root.dark-mode .hero-description { color: #94a3b8; }

    .hero-tags {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 18px;
    }

    .tag {
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(245,158,11,0.12);
      color: #b45309;
    }

    :root.dark-mode .tag {
      background: rgba(245,158,11,0.16);
      color: #fbbf24;
    }

    .summary-card {
      border-radius: 24px;
      padding: 20px;
      display: grid;
      gap: 12px;
      background: linear-gradient(180deg, rgba(245,158,11,0.08), rgba(249,115,22,0.04));
      border: 1px solid rgba(245,158,11,0.16);
    }

    :root.dark-mode .summary-card {
      background: linear-gradient(180deg, rgba(245,158,11,0.12), rgba(249,115,22,0.04));
      border-color: rgba(245,158,11,0.18);
    }

    .summary-label {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #b45309;
    }

    :root.dark-mode .summary-label { color: #fbbf24; }

    .summary-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(148,163,184,0.16);
    }

    .summary-item:last-of-type { border-bottom: none; padding-bottom: 0; }

    .summary-item span {
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
    }

    .summary-item strong {
      color: var(--text-primary, #0f172a);
      font-size: 14px;
    }

    :root.dark-mode .summary-item strong { color: #f8fafc; }

    .summary-note {
      margin-top: 4px;
      padding: 14px;
      border-radius: 18px;
      background: rgba(255,255,255,0.6);
      color: #475569;
      font-size: 13px;
      line-height: 1.6;
    }

    :root.dark-mode .summary-note {
      background: rgba(15,23,42,0.34);
      color: #cbd5e1;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
      gap: 18px;
      margin-top: 18px;
    }

    .content-card {
      border-radius: 28px;
      padding: 24px;
    }

    .section + .section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(148,163,184,0.16);
    }

    .section h2,
    .apply-header h2 {
      margin: 0 0 12px;
      font-size: 18px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .section h2,
    :root.dark-mode .apply-header h2 { color: #f8fafc; }

    .desc-text {
      white-space: pre-line;
      color: #475569;
      line-height: 1.8;
      font-size: 15px;
    }

    :root.dark-mode .desc-text { color: #94a3b8; }

    .skills-wrap {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .skill {
      padding: 7px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      background: rgba(245,158,11,0.12);
      color: #b45309;
    }

    :root.dark-mode .skill {
      background: rgba(245,158,11,0.16);
      color: #fbbf24;
    }

    .apply-card {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .apply-header p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .form-group.full { grid-column: 1 / -1; }

    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .form-group label .optional {
      font-weight: 400;
      color: #64748b;
      font-size: 12px;
    }

    :root.dark-mode .form-group label { color: #e2e8f0; }
    :root.dark-mode .form-group label .optional { color: #94a3b8; }

    .form-group input {
      width: 100%;
      padding: 12px 14px;
      border-radius: 14px;
      font-size: 14px;
      border: 1.5px solid #e2e8f0;
      background: rgba(255,255,255,0.92);
      color: var(--text-primary, #0f172a);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      font-family: inherit;
    }

    :root.dark-mode .form-group input {
      background: rgba(15,23,42,0.92);
      border-color: #334155;
      color: #e2e8f0;
    }

    .form-group input:focus {
      outline: none;
      border-color: #f59e0b;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.12);
    }

    .btn-apply {
      padding: 14px 20px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      box-shadow: 0 14px 28px rgba(245,158,11,0.24);
    }

    .btn-apply:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 18px 30px rgba(245,158,11,0.3);
    }

    .btn-apply:disabled { opacity: 0.65; cursor: not-allowed; }

    .success-banner,
    .error-banner {
      border-radius: 16px;
      padding: 14px 16px;
      font-size: 14px;
      line-height: 1.6;
      font-weight: 600;
    }

    .success-banner {
      background: rgba(34,197,94,0.12);
      color: #15803d;
    }

    .link-candidatures {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      background: rgba(34,197,94,0.2);
      color: #15803d;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      transition: all 0.2s ease;
      margin-top: 8px;
    }

    .link-candidatures:hover {
      background: rgba(34,197,94,0.3);
      transform: translateY(-1px);
    }

    .error-banner {
      background: rgba(239,68,68,0.12);
      color: #b91c1c;
    }

    :root.dark-mode .success-banner { color: #4ade80; }
    :root.dark-mode .link-candidatures { 
      background: rgba(34,197,94,0.25);
      color: #4ade80;
    }
    :root.dark-mode .link-candidatures:hover { 
      background: rgba(34,197,94,0.35);
    }
    :root.dark-mode .error-banner { color: #fca5a5; }

    .loading-state {
      text-align: center;
      padding: 84px 20px;
      color: #64748b;
      border-radius: 28px;
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

    @media (max-width: 940px) {
      .hero-card,
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .detail-page { padding-inline: 12px; }
      .hero-card,
      .content-card,
      .loading-state {
        border-radius: 22px;
      }
      .hero-card,
      .content-card { padding: 20px; }
      .hero-top {
        flex-direction: column;
        align-items: flex-start;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
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
    if (!this.candidateTitle.trim()) { this.errorMsg = 'Veuillez entrer votre titre/profil.'; return; }
    if (!this.proposedRate || this.proposedRate <= 0) { this.errorMsg = 'Veuillez proposer un taux journalier.'; return; }
    
    this.applying = true;
    this.errorMsg = '';
    
    // Get current user ID from auth service
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = currentUser.idUser || currentUser.id_user || currentUser.id;
    
    if (!userId) {
      this.errorMsg = 'Utilisateur non authentifié. Veuillez vous reconnecter.';
      this.applying = false;
      return;
    }

    // Apply directly to mission - backend will auto-create candidate if needed
    this.missionSvc.apply({
      missionId: this.mission!.id!,
      candidateId: userId,
      proposedRate: this.proposedRate!
    }).subscribe({
      next: () => { 
        this.applied = true; 
        this.applying = false; 
      },
      error: (error) => { 
        console.error('Application error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Erreur lors de l\'envoi de la candidature. Veuillez réessayer.';
        
        if (error.error?.message) {
          const backendMessage = error.error.message.toLowerCase();
          if (backendMessage.includes('already applied')) {
            errorMessage = 'Vous avez déjà postulé à cette mission. Consultez l\'onglet "Mes candidatures" pour voir le statut.';
          } else if (backendMessage.includes('mission not found')) {
            errorMessage = 'Mission introuvable. Elle a peut-être été supprimée.';
          } else if (backendMessage.includes('not authenticated')) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          } else {
            errorMessage = error.error.message;
          }
        } else if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMessage = 'Vous n\'avez pas les permissions nécessaires pour postuler.';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        this.errorMsg = errorMessage;
        this.applying = false; 
      }
    });
  }

  missionBudget(mission: Mission) {
    return mission.dailyRate ? `${mission.dailyRate.toLocaleString('fr-FR')} TND/jour` : 'On request';
  }

  parseSkills(skills: string): string[] {
    return skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  }

  statusLabel(status: Mission['status']) {
    const labels: Record<Mission['status'], string> = {
      OPEN: 'Open',
      IN_PROGRESS: 'In progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };

    return labels[status] || status;
  }

  statusClass(status: Mission['status']) {
    return `status-pill status-${status.toLowerCase().replace(/_/g, '-')}`;
  }
}
