import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2bJobOfferService } from '../../../../admin/b2b/services/job-offer.service';
import { B2bApplicationService, EmailNotification } from '../../../../admin/b2b/services/application.service';
import { B2bCandidateService } from '../../../../admin/b2b/services/candidate.service';
import { JobOffer } from '../../../../admin/b2b/models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-career-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detail-page" *ngIf="job">
      <a routerLink="/careers" class="back-link">← Back to offers</a>

      <div class="detail-card">
        <div class="detail-header">
          <div class="company-avatar">{{ job.companyName?.charAt(0) || '?' }}</div>
          <div>
            <h1>{{ job.title }}</h1>
            <p class="company-name">🏢 {{ job.companyName }}</p>
            <div class="meta-row">
              <span>📍 {{ job.location }}</span>
              <span>📋 {{ job.contractType }}</span>
              <span>📅 Published on {{ job.postedAt | date:'dd MMMM yyyy' }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📝 Job Description</h2>
          <div class="desc-text">{{ job.description }}</div>
        </div>

        <div class="section" *ngIf="parseSkills(job.requiredSkills).length">
          <h2>🎯 Required Skills</h2>
          <div class="skills-wrap">
            <span *ngFor="let s of parseSkills(job.requiredSkills)" class="skill">{{ s }}</span>
          </div>
        </div>

        <!-- Apply Section -->
        <div class="apply-section" *ngIf="!applied">
          <h2>📨 Apply for this Offer</h2>
          <p class="apply-info">Your candidate profile will be automatically sent to the company.</p>
          <div class="form-row">
            <div class="form-group full">
              <label>Title / Job Title</label>
              <input type="text" [(ngModel)]="candidateTitle" placeholder="Ex: Full Stack Developer">
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
              <label>Resume Link (URL)</label>
              <input type="url" [(ngModel)]="resumeUrl" placeholder="https://drive.google.com/...">
            </div>
          </div>
          <button (click)="apply()" class="btn-apply" [disabled]="applying">
            {{ applying ? 'Sending...' : '🚀 Submit my Application' }}
          </button>
        </div>

        <div class="success-banner" *ngIf="applied">
          ✅ Your application has been sent successfully! You will be contacted soon.
        </div>

        <div class="error-banner" *ngIf="errorMsg">
          ❌ {{ errorMsg }}
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading offer...</p>
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
    .company-avatar {
      width: 64px; height: 64px; border-radius: 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 700; flex-shrink: 0;
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
      background: #ede9fe; color: #6366f1;
    }
    :root.dark-mode .skill { background: rgba(99,102,241,0.15); }

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
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      font-size: 16px; font-weight: 700; transition: all 0.2s;
    }
    .btn-apply:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,0.3); transform: translateY(-1px); }
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
      width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .form-row { flex-direction: column; }
      .detail-header { flex-direction: column; text-align: center; align-items: center; }
    }
  `]
})
export class CareerDetailComponent implements OnInit {
  job: JobOffer | null = null;
  loading = true;
  candidateTitle = '';
  candidateSkills = '';
  experienceYears: number | null = null;
  resumeUrl = '';
  applying = false;
  applied = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private jobSvc: B2bJobOfferService,
    private appSvc: B2bApplicationService,
    private candidateSvc: B2bCandidateService,
    private authSvc: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobSvc.getById(+id).subscribe({
        next: data => { this.job = data; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  apply() {
    if (!this.candidateTitle.trim()) { this.errorMsg = 'Please enter your title.'; return; }
    this.applying = true;
    this.errorMsg = '';

    // Get current user ID for candidate profile
    this.authSvc.currentUser$.subscribe(user => {
      const userId = user?.idUser ?? (user as any)?.id_user ?? 0;
      const userEmail = user?.email ?? (user as any)?.email ?? 'candidate@example.com';

      // Backend expects skills as comma-separated string, not array
      const payload: any = {
        id: userId,
        title: this.candidateTitle,
        skills: this.candidateSkills,
        experienceYears: this.experienceYears || 0,
        resumeUrl: this.resumeUrl || '',
        isLookingForJob: true
      };

      // Try to create candidate; if it already exists (409/500), update instead
      this.candidateSvc.create(payload).subscribe({
        next: (candidate) => this.submitApplication(candidate.id, userEmail),
        error: () => {
          // Candidate already exists — try update, then apply
          this.candidateSvc.update(userId, payload).subscribe({
            next: (candidate) => this.submitApplication(candidate.id, userEmail),
            error: () => {
              // Still try to apply with userId as candidateId
              this.submitApplication(userId, userEmail);
            }
          });
        }
      });
    }).unsubscribe();
  }

  private submitApplication(candidateId: number, userEmail: string) {
    this.appSvc.apply({
      jobOfferId: this.job!.id!,
      candidateId: candidateId
    }).subscribe({
      next: () => {
        // Send confirmation email to candidate
        const emailData: EmailNotification = {
          candidateEmail: userEmail,
          candidateName: this.candidateTitle,
          jobTitle: this.job!.title || 'Position',
          companyName: this.job!.companyName || 'Company',
          status: 'PENDING',
          message: `Thank you for applying to ${this.job!.title} at ${this.job!.companyName}. We have received your application and will review it shortly. You will be contacted soon.`
        };

        this.appSvc.sendNotification(emailData).subscribe({
          next: () => { this.applied = true; this.applying = false; },
          error: () => { this.applied = true; this.applying = false; }
        });
      },
      error: () => { this.errorMsg = 'Error while sending. Please try again.'; this.applying = false; }
    });
  }

  parseSkills(skills: any): string[] {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    return [];
  }
}
