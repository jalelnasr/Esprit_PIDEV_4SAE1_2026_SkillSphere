import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { B2bMissionService } from '../../services/mission.service';
import { B2bCompanyService } from '../../services/company.service';
import { MissionRequest, Company } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <a [routerLink]="nav.basePath + '/missions'" class="back-link">← Back to missions</a>
        <h1>{{ isEdit ? '✏️ Edit freelance mission' : '🎯 New freelance mission' }}</h1>
      </div>

      <div class="form-card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Company *</label>
            <select [(ngModel)]="form.companyId" name="companyId" class="form-control" required>
              <option [ngValue]="0" disabled>— Select —</option>
              <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Title *</label>
            <input type="text" [(ngModel)]="form.title" name="title" class="form-control" required placeholder="E.g.: REST API Development">
          </div>
          <div class="form-group">
            <label>Description *</label>
            <textarea [(ngModel)]="form.description" name="description" class="form-control textarea" rows="4" required placeholder="Mission description..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Duration (weeks) *</label>
              <input type="number" [(ngModel)]="form.durationWeeks" name="durationWeeks" class="form-control" required min="1" placeholder="12">
            </div>
            <div class="form-group">
              <label>Daily Rate (€) *</label>
              <input type="number" [(ngModel)]="form.dailyRate" name="dailyRate" class="form-control" required min="0" placeholder="500">
            </div>
          </div>
          <div class="form-group">
            <label>Required skills</label>
            <div class="tags-input">
              <span *ngFor="let s of parseSkills(form.requiredSkills); let i = index" class="skill-tag">
                {{ s }} 
                <button type="button" (click)="removeSkill(i)" class="tag-rm">×</button>
              </span>
              <input type="text" [(ngModel)]="newSkill" name="newSkill" (keydown.enter)="addSkill(); $event.preventDefault()" placeholder="Add + Enter">
            </div>
          </div>

          <div class="form-actions">
            <a [routerLink]="nav.basePath + '/missions'" class="btn btn-cancel">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="!isValid()">{{ isEdit ? 'Update mission' : 'Create mission' }}</button>
          </div>
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; width: 100%; }
    .page-header { margin-bottom: 24px; }
    .back-link { color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 8px 0 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .form-card { background: var(--card-bg, #fff); border-radius: 16px; padding: 32px; border: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .form-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; }
    .form-control { width: 100%; padding: 12px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-control { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .form-control:focus { outline: none; border-color: #6366f1; }
    .textarea { resize: vertical; font-family: inherit; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .tags-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); min-height: 42px; align-items: center; }
    :root.dark-mode .tags-input { background: #0f172a; border-color: #334155; }
    .tags-input input { border: none; background: transparent; outline: none; font-size: 14px; flex: 1; min-width: 120px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .tags-input input { color: #e2e8f0; }
    .skill-tag { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #ede9fe; color: #6366f1; display: inline-flex; align-items: center; gap: 4px; }
    :root.dark-mode .skill-tag { background: rgba(99,102,241,0.15); }
    .tag-rm { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; padding: 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; }
    .btn { padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; text-decoration: none; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
    :root.dark-mode .btn-cancel { border-color: #334155; color: #94a3b8; }
    .error-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 14px; }
    .success-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #f0fdf4; color: #16a34a; font-size: 14px; }
  `]
})
export class MissionFormComponent implements OnInit {
  companies: Company[] = [];
  newSkill = '';
  form: MissionRequest = { companyId: 0, title: '', description: '', durationWeeks: 0, dailyRate: 0, requiredSkills: '' };
  errorMsg = '';
  successMsg = '';
  isEdit = false;
  missionId: number | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private missionSvc: B2bMissionService, private companySvc: B2bCompanyService, private authSvc: AuthService, private activityLog: ActivityLogService, public nav: B2bNavService) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    this.isEdit = !!id;
    this.missionId = this.isEdit ? id : null;

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

    if (this.isEdit && this.missionId) {
      this.missionSvc.getById(this.missionId).subscribe({
        next: (m: any) => {
          this.form = {
            companyId: Number(m?.companyId || 0),
            title: m?.title || '',
            description: m?.description || '',
            durationWeeks: Number(m?.durationWeeks || 0),
            dailyRate: Number(m?.dailyRate || 0),
            requiredSkills: typeof m?.requiredSkills === 'string' ? m.requiredSkills : ''
          };
        },
        error: () => { this.errorMsg = 'Unable to load mission details'; }
      });
    }
  }

  parseSkills(skills: string): string[] {
    if (!skills) return [];
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  addSkill() {
    const s = this.newSkill.trim();
    if (s) {
      const currentSkills = this.parseSkills(this.form.requiredSkills);
      if (!currentSkills.includes(s)) {
        currentSkills.push(s);
        this.form.requiredSkills = currentSkills.join(',');
      }
    }
    this.newSkill = '';
  }

  removeSkill(index: number) {
    const currentSkills = this.parseSkills(this.form.requiredSkills);
    currentSkills.splice(index, 1);
    this.form.requiredSkills = currentSkills.join(',');
  }

  isValid(): boolean { 
    return this.form.companyId > 0 && 
           !!this.form.title && 
           !!this.form.description && 
           this.form.durationWeeks > 0 && 
           this.form.dailyRate > 0; 
  }

  onSubmit() {
    if (!this.isValid()) return;
    if (this.newSkill.trim()) this.addSkill();

    const payload = {
      ...this.form,
      companyId: Number(this.form.companyId),
      durationWeeks: Number(this.form.durationWeeks),
      dailyRate: Number(this.form.dailyRate)
    };

    this.errorMsg = ''; this.successMsg = '';
    const obs = (this.isEdit && this.missionId)
      ? this.missionSvc.update(this.missionId, payload)
      : this.missionSvc.create(payload);

    obs.subscribe({
      next: (res: any) => {
        this.successMsg = this.isEdit ? 'Mission updated!' : 'Mission created!';
        this.authSvc.currentUser$.subscribe(u => {
          if (u) {
            if (this.isEdit) {
              this.activityLog.logUpdate(u.email, u.role, 'Mission', this.missionId || 0, `Updated freelance mission "${this.form.title}"`);
            } else {
              this.activityLog.logCreate(u.email, u.role, 'Mission', res?.id || 0, `Created freelance mission "${this.form.title}" — Daily Rate: ${this.form.dailyRate}€`);
            }
          }
        }).unsubscribe();
        setTimeout(() => this.router.navigate([this.nav.basePath + '/missions']), 1200);
      },
      error: (err) => {
        const details = err?.error?.errors;
        const detailText = Array.isArray(details)
          ? details.join(', ')
          : (typeof details === 'string' ? details : '');
        this.errorMsg = err?.error?.message || detailText || err?.message || 'Error while creating mission';
      }
    });
  }
}
