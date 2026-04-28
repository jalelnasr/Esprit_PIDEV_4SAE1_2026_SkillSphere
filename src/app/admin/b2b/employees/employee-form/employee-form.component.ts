import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { B2bEmployeeService } from '../../services/employee.service';
import { B2bCompanyService } from '../../services/company.service';
import { EmployeeRequest, Company } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { BackendUser, BackendRole } from '../../../../core/models/auth.model';
import { AdminUsersApiService, UserResponse } from '../../../../admin/admin-users-api.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <a [routerLink]="nav.basePath + '/employees'" class="back-link">← Back to employees</a>
        <h1>{{ isEdit ? '✏️ Edit employee' : '➕ New employee' }}</h1>
        <p class="subtitle" *ngIf="!isEdit">Fill in the information to create a new employee account</p>
      </div>

      <!-- Logged-in context banner -->
      <div class="context-banner" *ngIf="!isEdit && companyName">
        <div class="context-icon">🏢</div>
        <div class="context-info">
          <span class="context-label">Creating for</span>
          <span class="context-company">{{ companyName }}</span>
        </div>
        <div class="context-role">
          <span class="badge" [class]="'badge-' + (userRole || '').toLowerCase()">
            {{ userRole === 'RH_ENTREPRISE' ? 'HR Manager' : userRole === 'MANAGER' ? 'Manager' : userRole }}
          </span>
        </div>
      </div>

      <div class="form-card">
        <form (ngSubmit)="onSubmit()" #empForm="ngForm">

          <!-- Company (only for ADMIN, auto-set for RH/Manager) -->
          <div class="form-group" *ngIf="!isCompanyScoped">
            <label>Company *</label>
            <select [(ngModel)]="form.companyId" name="companyId" required class="form-control"
                    (ngModelChange)="onCompanyChange($event)">
              <option [value]="0" disabled>— Select —</option>
              <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- === USER ACCOUNT FIELDS (create mode only) === -->
          <ng-container *ngIf="!isEdit">
            <div class="section-title">👤 User Account</div>
            <div class="form-row">
              <div class="form-group half">
                <label>First name *</label>
                <input type="text" [(ngModel)]="newUser.firstName" name="firstName" required
                       placeholder="Jean" class="form-control">
              </div>
              <div class="form-group half">
                <label>Last name *</label>
                <input type="text" [(ngModel)]="newUser.lastName" name="lastName" required
                       placeholder="Dupont" class="form-control">
              </div>
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="newUser.email" name="email" required
                     placeholder="jean.dupont&#64;company.com" class="form-control">
            </div>

            <div class="form-group">
              <label>Password *</label>
              <div class="password-field">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="newUser.password" name="password" required
                       placeholder="Min. 6 characters" class="form-control" minlength="6">
                <button type="button" class="toggle-pwd" (click)="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <button type="button" class="btn-generate" (click)="generatePassword()">🔑 Generate password</button>
            </div>

            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="newUser.role" name="role" required class="form-control">
                <option value="" disabled>— Select role —</option>
                <option value="APPRENANT">Learner (APPRENANT)</option>
                <option value="MANAGER" *ngIf="userRole === 'RH_ENTREPRISE' || userRole === 'ADMIN'">Manager (MANAGER)</option>
              </select>
              <small class="hint" *ngIf="userRole === 'MANAGER'">
                As a Manager, you can create Learners for your department
              </small>
              <small class="hint" *ngIf="userRole === 'RH_ENTREPRISE'">
                As HR, you can create Learners and Managers
              </small>
            </div>
          </ng-container>

          <div class="section-title">🏢 Employee Details</div>

          <!-- Department -->
          <div class="form-group">
            <label>Department *</label>
            <input type="text" [(ngModel)]="form.department" name="department" required
                   placeholder="E.g.: IT, Marketing, HR..." class="form-control"
                   [readonly]="userRole === 'MANAGER' && managerDepartment && !isEdit"
                   [value]="userRole === 'MANAGER' && managerDepartment && !isEdit ? managerDepartment : form.department">
            <small class="hint" *ngIf="userRole === 'MANAGER' && managerDepartment && !isEdit">
              Auto-set to your department
            </small>
          </div>

          <!-- Position -->
          <div class="form-group">
            <label>Position *</label>
            <input type="text" [(ngModel)]="form.position" name="position" required
                   placeholder="E.g.: Developer, Project Manager..." class="form-control">
          </div>



          <div class="form-actions">
            <a [routerLink]="nav.basePath + '/employees'" class="btn btn-cancel">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="!isValid() || submitting">
              <span *ngIf="submitting" class="btn-spinner"></span>
              {{ isEdit ? 'Update' : (submitting ? 'Creating...' : 'Create employee') }}
            </button>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="success-msg" *ngIf="successMsg">✅ {{ successMsg }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; width: 100%; }
    .page-header { margin-bottom: 24px; }
    .back-link { color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; }
    .back-link:hover { text-decoration: underline; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 8px 0 0; }
    .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }

    .context-banner {
      display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 12px;
      background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06));
      border: 1.5px solid rgba(99,102,241,0.15); margin-bottom: 20px;
    }
    :root.dark-mode .context-banner { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.2); }
    .context-icon { font-size: 24px; }
    .context-info { display: flex; flex-direction: column; flex: 1; }
    .context-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .context-company { font-size: 16px; font-weight: 700; color: var(--text-primary, #0f172a); }
    :root.dark-mode .context-company { color: #f1f5f9; }

    .form-card {
      background: var(--card-bg, #fff); border-radius: 16px; padding: 32px;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06)); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    :root.dark-mode .form-card { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }

    .section-title {
      font-size: 15px; font-weight: 700; color: var(--text-primary, #0f172a);
      margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;
    }
    :root.dark-mode .section-title { color: #f1f5f9; border-color: #334155; }

    .form-row { display: flex; gap: 16px; }
    .form-group { margin-bottom: 20px; }
    .form-group.half { flex: 1; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
    .form-control {
      width: 100%; padding: 12px 14px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid var(--border, #e2e8f0); background: var(--input-bg, #fff); color: var(--text-primary, #0f172a);
      transition: border-color 0.2s; box-sizing: border-box;
    }
    :root.dark-mode .form-control { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .form-control:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .form-control[readonly] { background: #f1f5f9; cursor: not-allowed; }
    :root.dark-mode .form-control[readonly] { background: #1e293b; }
    .hint { color: #94a3b8; font-size: 12px; margin-top: 4px; display: block; }

    .password-field { position: relative; }
    .toggle-pwd {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; font-size: 16px; cursor: pointer; padding: 4px 8px;
    }
    .btn-generate {
      margin-top: 6px; background: none; border: 1px dashed #6366f1; color: #6366f1;
      padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: background 0.2s;
    }
    .btn-generate:hover { background: rgba(99,102,241,0.08); }

    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; }
    .btn { padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(99,102,241,0.3); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
    :root.dark-mode .btn-cancel { border-color: #334155; color: #94a3b8; }
    .btn-cancel:hover { border-color: #6366f1; color: #6366f1; }

    .btn-spinner {
      display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 14px; }
    :root.dark-mode .error-msg { background: rgba(220,38,38,0.1); }
    .success-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #f0fdf4; color: #16a34a; font-size: 14px; }
    :root.dark-mode .success-msg { background: rgba(22,163,106,0.1); }

    .badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
    .badge-manager { background: #fef3c7; color: #92400e; }
    .badge-apprenant { background: #dbeafe; color: #1e40af; }
    .badge-rh_entreprise { background: #ede9fe; color: #5b21b6; }
    .badge-formateur { background: #d1fae5; color: #065f46; }
    .badge-admin { background: #fce7f3; color: #9d174d; }
  `]
})
export class EmployeeFormComponent implements OnInit {
  isEdit = false;
  employeeId = 0;
  companies: Company[] = [];
  companyManagers: UserResponse[] = [];
  loadingUsers = false;
  submitting = false;
  showPassword = false;
  companyName = '';
  managerDepartment = '';  // auto-fill department for managers
  userCompanyId: number | null = null;
  userRole: BackendRole | null = null;
  private currentUserEmail = '';

  get isCompanyScoped(): boolean {
    return this.userRole === 'RH_ENTREPRISE' || this.userRole === 'MANAGER';
  }

  form: EmployeeRequest = {
    id: 0,
    companyId: 0,
    department: '',
    position: '',
    managerId: null
  };

  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '' as string
  };

  errorMsg = '';
  successMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeSvc: B2bEmployeeService,
    private companySvc: B2bCompanyService,
    private authSvc: AuthService,
    private usersSvc: AdminUsersApiService,
    private activityLog: ActivityLogService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.userCompanyId = user?.companyId || null;
      this.currentUserEmail = user?.email || '';

      if (this.isCompanyScoped && this.userCompanyId) {
        // RH or Manager: company is auto-set
        this.form.companyId = this.userCompanyId;
        this.companySvc.getById(this.userCompanyId).subscribe(c => {
          if (c) {
            this.companies = [c];
            this.companyName = c.name;
          }
        });
        this.loadManagersForCompany(this.userCompanyId);

        // If manager, try to auto-fill their department
        if (this.userRole === 'MANAGER' && user) {
          this.loadManagerDepartment(user.idUser || 0);
        }
      } else {
        // ADMIN: can pick any company
        this.companySvc.getAll().subscribe(c => this.companies = c || []);
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.employeeId = +id;
      this.employeeSvc.getById(this.employeeId).subscribe(e => {
        this.form = {
          id: e.id,
          companyId: e.companyId,
          department: e.department,
          position: e.position,
          managerId: e.managerId
        };
        this.loadManagersForCompany(e.companyId);
      });
    }
  }

  onCompanyChange(companyId: any) {
    const cid = +companyId;
    if (cid > 0) {
      this.form.managerId = null;
      this.loadManagersForCompany(cid);
      // Update company name for admin
      const found = this.companies.find(c => c.id === cid);
      this.companyName = found?.name || '';
    }
  }

  loadManagersForCompany(companyId: number) {
    this.loadingUsers = true;
    this.companyManagers = [];

    this.usersSvc.getUsersByCompany(companyId).subscribe({
      next: (users) => {
        this.companyManagers = users.filter(u => u.role === 'MANAGER');
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
      }
    });
  }

  /** Auto-fill department for manager creating employees */
  private loadManagerDepartment(userId: number) {
    if (!userId) return;
    this.employeeSvc.getAll().subscribe({
      next: (employees) => {
        const managerEmp = employees.find((e: any) => e.id === userId);
        if (managerEmp) {
          this.managerDepartment = managerEmp.department || '';
          this.form.department = this.managerDepartment;
        }
      },
      error: () => {}
    });
  }

  generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newUser.password = pwd;
    this.showPassword = true;
  }

  isValid(): boolean {
    const commonValid = this.form.companyId > 0 && !!this.form.department && !!this.form.position;

    if (this.isEdit) {
      return commonValid;
    }

    return commonValid
      && !!this.newUser.firstName
      && !!this.newUser.lastName
      && !!this.newUser.email
      && this.newUser.password.length >= 6
      && !!this.newUser.role;
  }

  onSubmit() {
    if (!this.isValid() || this.submitting) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.submitting = true;

    if (this.isEdit) {
      this.submitUpdate();
    } else {
      this.submitCreateWithAccount();
    }
  }

  /** Edit mode: only update employee fields */
  private submitUpdate() {
    const payload = { ...this.form };
    if (!payload.managerId) payload.managerId = null;

    this.employeeSvc.update(this.employeeId, payload).subscribe({
      next: () => {
        this.successMsg = 'Employee updated!';
        this.activityLog.logUpdate(
          this.currentUserEmail || 'unknown',
          this.userRole || 'unknown',
          'Employee',
          this.employeeId,
          `Updated employee #${this.employeeId}`
        );
        this.submitting = false;
        setTimeout(() => this.router.navigate([this.nav.basePath + '/employees']), 1200);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error while updating';
        this.submitting = false;
      }
    });
  }

  /** Create: 1) create user account  2) create employee record */
  private submitCreateWithAccount() {
    const userPayload: any = {
      nom: this.newUser.lastName,
      prenom: this.newUser.firstName,
      email: this.newUser.email,
      password: this.newUser.password,
      role: this.newUser.role,
      companyId: +this.form.companyId
    };

    // Step 1: Create user account
    this.usersSvc.create(userPayload).subscribe({
      next: (createdUser: any) => {
        const userId = createdUser.idUser || createdUser.id;

        // Step 2: Create employee record
        const empPayload: EmployeeRequest = {
          id: userId,
          companyId: +this.form.companyId,
          department: this.form.department,
          position: this.form.position,
          managerId: this.form.managerId || null
        };

        this.employeeSvc.create(empPayload).subscribe({
          next: () => {
            this.successMsg = `Employee ${this.newUser.firstName} ${this.newUser.lastName} created successfully!`;
            this.activityLog.logCreate(
              this.currentUserEmail || 'unknown',
              this.userRole || 'unknown',
              'Employee',
              userId,
              `Created account & employee for ${this.newUser.email} (${this.newUser.role})`
            );
            this.submitting = false;
            setTimeout(() => this.router.navigate([this.nav.basePath + '/employees']), 1500);
          },
          error: (err) => {
            this.errorMsg = 'User account created but failed to create employee: ' + (err.error?.message || err.message);
            this.submitting = false;
          }
        });
      },
      error: (err) => {
        this.errorMsg = err.error?.message || err.error || 'Failed to create user account';
        this.submitting = false;
      }
    });
  }
}
