import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
        <h1>🎯 New freelance mission</h1>
      </div>

      <div class="form-card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Company *</label>
            <select [(ngModel)]="form.companyId" name="companyId" class="form-control" required>
              <option [value]="0" disabled>— Select —</option>
              <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
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
              <label>Duration *</label>
              <input type="text" [(ngModel)]="form.duration" name="duration" class="form-control" required placeholder="E.g.: 3 months">
            </div>
            <div class="form-group">
              <label>Budget (€) *</label>
              <input type="number" [(ngModel)]="form.budget" name="budget" class="form-control" required min="0" placeholder="15000">
            </div>
          </div>
          <div class="form-group">
            <label>Required skills</label>
            <div class="tags-input">
              <span *ngFor="let s of form.requiredSkills; let i = index" class="skill-tag">{{ s }} <button type="button" (click)="form.requiredSkills.splice(i, 1)" class="tag-rm">×</button></span>
              <input type="text" [(ngModel)]="newSkill" name="newSkill" (keydown.enter)="addSkill(); $event.preventDefault()" placeholder="Add + Enter">
            </div>
          </div>

          <div class="form-actions">
            <a [routerLink]="nav.basePath + '/missions'" class="btn btn-cancel">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="!isValid()">Create mission</button>
          </div>
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 680px; }
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
  form: MissionRequest = { companyId: 0, title: '', description: '', duration: '', budget: 0, requiredSkills: [] };
  errorMsg = '';
  successMsg = '';

  constructor(private router: Router, private missionSvc: B2bMissionService, private companySvc: B2bCompanyService, private authSvc: AuthService, private activityLog: ActivityLogService, public nav: B2bNavService) {}

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
  }

  addSkill() {
    const s = this.newSkill.trim();
    if (s && !this.form.requiredSkills.includes(s)) this.form.requiredSkills.push(s);
    this.newSkill = '';
  }

  isValid(): boolean { return this.form.companyId > 0 && !!this.form.title && !!this.form.description && !!this.form.duration && this.form.budget > 0; }

  onSubmit() {
    if (!this.isValid()) return;
    this.errorMsg = ''; this.successMsg = '';
    this.missionSvc.create(this.form).subscribe({
      next: (res: any) => {
        this.successMsg = 'Mission created!';
        this.authSvc.currentUser$.subscribe(u => {
          if (u) {
            this.activityLog.logCreate(u.email, u.role, 'Mission', res?.id || 0, `Created freelance mission "${this.form.title}" — Budget: ${this.form.budget} TND`);
          }
        }).unsubscribe();
        setTimeout(() => this.router.navigate([this.nav.basePath + '/missions']), 1200);
      },
      error: (err) => { this.errorMsg = err.error?.message || 'Error'; }
    });
  }
}
