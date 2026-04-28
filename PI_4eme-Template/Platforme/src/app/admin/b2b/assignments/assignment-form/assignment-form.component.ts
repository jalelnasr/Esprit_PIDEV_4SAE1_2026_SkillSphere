import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { B2bAssignmentService } from '../../services/assignment.service';
import { B2bEmployeeService } from '../../services/employee.service';
import { B2bPackService } from '../../services/pack.service';
import { B2bCompanyService } from '../../services/company.service';
import { AssignmentRequest, Employee, Pack, Company } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <a [routerLink]="nav.basePath + '/assignments'" class="back-link">← Back to assignments</a>
        <h1>📋 New Assignment</h1>
        <p class="subtitle">Assign a training to an employee</p>
      </div>

      <div class="form-card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Company *</label>
            <select [(ngModel)]="form.companyId" name="companyId" (ngModelChange)="onCompanyChange()" class="form-control" required>
              <option [value]="0" disabled>— Select —</option>
              <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Employee *</label>
            <select [(ngModel)]="form.employeeId" name="employeeId" class="form-control" required>
              <option [value]="0" disabled>— Select an employee —</option>
              <option *ngFor="let e of filteredEmployees" [value]="e.id">
                #{{ e.id }} — {{ e.department }} / {{ e.position }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Training pack *</label>
            <select [(ngModel)]="form.packId" name="packId" class="form-control" required>
              <option [value]="0" disabled>— Select a pack —</option>
              <option *ngFor="let p of packs" [value]="p.id">{{ p.name }} ({{ p.formationsCount }} trainings)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Training name *</label>
            <input type="text" [(ngModel)]="form.courseName" name="courseName" class="form-control" required placeholder="E.g.: Advanced Angular">
          </div>

          <div class="form-group">
            <label>Deadline *</label>
            <input type="date" [(ngModel)]="form.deadline" name="deadline" class="form-control" required>
          </div>

          <div class="form-actions">
            <a [routerLink]="nav.basePath + '/assignments'" class="btn btn-cancel">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="!isValid()">Assign</button>
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
    .back-link:hover { text-decoration: underline; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 8px 0 4px; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; }

    .form-card { background: var(--card-bg, #fff); border-radius: 16px; padding: 32px; border: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .form-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
    .form-control { width: 100%; padding: 12px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-control { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .form-control:focus { outline: none; border-color: #6366f1; }

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
export class AssignmentFormComponent implements OnInit {
  companies: Company[] = [];
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  packs: Pack[] = [];

  form: AssignmentRequest = { companyId: 0, employeeId: 0, packId: 0, courseName: '', deadline: '' };
  errorMsg = '';
  successMsg = '';

  private userCompanyId: number | null = null;
  private userRole: string | null = null;
  private currentUserEmail = '';

  get isCompanyScoped(): boolean {
    return this.userRole === 'RH_ENTREPRISE' || this.userRole === 'MANAGER';
  }

  constructor(
    private router: Router,
    private assignmentSvc: B2bAssignmentService,
    private employeeSvc: B2bEmployeeService,
    private packSvc: B2bPackService,
    private companySvc: B2bCompanyService,
    private authSvc: AuthService,
    private activityLog: ActivityLogService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.userCompanyId = user?.companyId || null;
      this.currentUserEmail = user?.email || '';

      if (this.isCompanyScoped && this.userCompanyId) {
        this.form.companyId = this.userCompanyId;
        this.companySvc.getById(this.userCompanyId).subscribe(c => this.companies = c ? [c] : []);
        this.employeeSvc.getByCompany(this.userCompanyId).subscribe(e => {
          this.employees = e || [];
          this.filteredEmployees = this.employees;
        });
      } else {
        this.companySvc.getAll().subscribe(c => this.companies = c || []);
        this.employeeSvc.getAll().subscribe(e => this.employees = e || []);
      }
    });
    this.packSvc.getAll().subscribe(p => this.packs = (p || []).filter(pk => pk.isActive));
  }

  onCompanyChange() {
    this.filteredEmployees = this.employees.filter(e => e.companyId === +this.form.companyId);
    this.form.employeeId = 0;
  }

  isValid(): boolean {
    return this.form.companyId > 0 && this.form.employeeId > 0 && this.form.packId > 0
      && !!this.form.courseName && !!this.form.deadline;
  }

  onSubmit() {
    if (!this.isValid()) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.assignmentSvc.create(this.form).subscribe({
      next: () => {
        this.successMsg = 'Training assigned successfully!';
        const emp = this.employees.find(e => e.id === +this.form.employeeId);
        const empLabel = emp ? `employee #${emp.id}` : `employee #${this.form.employeeId}`;
        this.activityLog.logAssign(
          this.currentUserEmail || 'unknown',
          this.userRole || 'unknown',
          `Assigned training ${this.form.courseName} to ${empLabel}`
        );
        setTimeout(() => this.router.navigate([this.nav.basePath + '/assignments']), 1200);
      },
      error: (err) => { this.errorMsg = err.error?.message || 'Error during assignment'; }
    });
  }
}
