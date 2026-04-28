import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { B2bCompanyService } from '../../services/company.service';
import { Company, CompanyRequest } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminUsersApiService, AdminCreateUserRequest } from '../../../../admin/admin-users-api.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <a [routerLink]="nav.basePath + '/companies'" class="back-link">← Back to companies</a>

      <div class="form-card">
        <h1>{{ isEdit ? '✏️ Edit company' : '🏢 New company' }}</h1>
        <p class="subtitle">{{ isEdit ? 'Update the information' : 'Create the company + HR account automatically' }}</p>

        <!-- Stepper (creation only) -->
        <div class="stepper" *ngIf="!isEdit">
          <div class="step" [class.active]="step === 1" [class.done]="step > 1">
            <div class="step-num">{{ step > 1 ? '✓' : '1' }}</div>
            <span>Company info</span>
          </div>
          <div class="step-line" [class.done]="step > 1"></div>
          <div class="step" [class.active]="step === 2" [class.done]="step > 2">
            <div class="step-num">{{ step > 2 ? '✓' : '2' }}</div>
            <span>HR Account</span>
          </div>
          <div class="step-line" [class.done]="step > 2"></div>
          <div class="step" [class.active]="step === 3">
            <div class="step-num">3</div>
            <span>Confirmation</span>
          </div>
        </div>

        <form (ngSubmit)="isEdit ? save() : null" #f="ngForm">

          <!-- ========== STEP 1: Company Info ========== -->
          <div *ngIf="step === 1 || isEdit">
            <h2 class="section-title" *ngIf="!isEdit">🏢 Company information</h2>

            <div class="form-row">
              <div class="form-group">
                <label>Company name *</label>
                <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Ex: TechCorp Tunisia">
              </div>
              <div class="form-group">
                <label>Company email *</label>
                <input type="email" [(ngModel)]="form.email" name="email" required placeholder="contact&#64;techcorp.tn">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>SIRET / Tax ID *</label>
                <input type="text" [(ngModel)]="form.siret" name="siret" required placeholder="123 456 789 00012">
              </div>
              <div class="form-group">
                <label>Industry sector *</label>
                <select [(ngModel)]="form.sector" name="sector" required>
                  <option value="">-- Select --</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Industry">Industry</option>
                  <option value="Services">Services</option>
                  <option value="Construction">Construction</option>
                  <option value="Food & Agriculture">Food & Agriculture</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full">
                <label>Address *</label>
                <input type="text" [(ngModel)]="form.address" name="address" required placeholder="12 Liberty Street, Tunis 1000">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Phone *</label>
                <input type="tel" [(ngModel)]="form.phone" name="phone" required placeholder="+216 71 234 567">
              </div>
            </div>

            <div class="form-actions" *ngIf="!isEdit">
              <a [routerLink]="nav.basePath + '/companies'" class="btn-secondary">Cancel</a>
              <button type="button" (click)="nextStep()" class="btn-primary"
                      [disabled]="!form.name || !form.email || !form.siret || !form.sector || !form.address || !form.phone">
                Next →
              </button>
            </div>
          </div>

          <!-- ========== STEP 2: RH Account ========== -->
          <div *ngIf="step === 2 && !isEdit">
            <h2 class="section-title">👤 HR Manager Account</h2>
            <p class="info-box">📌 This account will be automatically linked to the company <strong>{{ form.name }}</strong>. The HR manager will be able to manage employees, training, and recruitment.</p>

            <div class="form-row">
              <div class="form-group">
                <label>HR First name *</label>
                <input type="text" [(ngModel)]="rhUser.prenom" name="rhPrenom" required placeholder="Ex: Mohamed">
              </div>
              <div class="form-group">
                <label>HR Last name *</label>
                <input type="text" [(ngModel)]="rhUser.nom" name="rhNom" required placeholder="Ex: Ben Ali">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>HR Email *</label>
                <input type="email" [(ngModel)]="rhUser.email" name="rhEmail" required placeholder="rh&#64;techcorp.tn">
              </div>
              <div class="form-group">
                <label>Password *</label>
                <input type="password" [(ngModel)]="rhUser.password" name="rhPassword" required minlength="6" placeholder="Min. 6 characters">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>HR Phone</label>
                <input type="tel" [(ngModel)]="rhUser.phone" name="rhPhone" placeholder="+216 22 333 444">
              </div>
            </div>

            <div class="form-actions">
              <button type="button" (click)="prevStep()" class="btn-secondary">← Back</button>
              <button type="button" (click)="createAll()" class="btn-primary"
                      [disabled]="!rhUser.nom || !rhUser.prenom || !rhUser.email || !rhUser.password || saving">
                {{ saving ? 'Creating...' : '🚀 Create company + HR' }}
              </button>
            </div>
          </div>

          <!-- ========== STEP 3: Confirmation ========== -->
          <div *ngIf="step === 3 && !isEdit">
            <div class="success-block">
              <div class="success-icon">✅</div>
              <h2>Company created successfully!</h2>
              <p>The company and HR account have been created.</p>

              <div class="recap-card">
                <h3>🏢 Company</h3>
                <div class="recap-row"><span>Name:</span> <strong>{{ createdCompany?.name }}</strong></div>
                <div class="recap-row"><span>Sector:</span> <strong>{{ createdCompany?.sector }}</strong></div>
                <div class="recap-row"><span>ID :</span> <strong>#{{ createdCompany?.id }}</strong></div>
              </div>

              <div class="recap-card">
                <h3>👤 HR Manager</h3>
                <div class="recap-row"><span>Name:</span> <strong>{{ rhUser.prenom }} {{ rhUser.nom }}</strong></div>
                <div class="recap-row"><span>Email:</span> <strong>{{ rhUser.email }}</strong></div>
                <div class="recap-row"><span>Password:</span> <strong>••••••••</strong></div>
                <div class="recap-row"><span>Role:</span> <span class="role-badge">RH_ENTREPRISE</span></div>
              </div>

              <p class="info-box mt">💡 The HR manager can now log in with <strong>{{ rhUser.email }}</strong> and manage their company from the B2B Corporate module.</p>

              <div class="form-actions center">
                <a [routerLink]="nav.basePath + '/companies'" class="btn-secondary">Back to list</a>
                <button type="button" (click)="resetForm()" class="btn-primary">+ Create another company</button>
              </div>
            </div>
          </div>

          <!-- ========== EDIT MODE Actions ========== -->
          <div *ngIf="isEdit">
            <div class="error-banner" *ngIf="errorMsg">❌ {{ errorMsg }}</div>
            <div class="success-banner" *ngIf="successMsg">✅ {{ successMsg }}</div>
            <div class="form-actions">
              <a [routerLink]="nav.basePath + '/companies'" class="btn-secondary">Cancel</a>
              <button type="submit" class="btn-primary" [disabled]="saving || f.invalid">
                {{ saving ? 'Saving...' : 'Update' }}
              </button>
            </div>
          </div>
        </form>

        <div class="error-banner" *ngIf="errorMsg && !isEdit">❌ {{ errorMsg }}</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 960px; margin: 0 auto; width: 100%; }

    .back-link { display: inline-block; margin-bottom: 16px; color: #6366f1; font-weight: 600; text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }

    .form-card { background: var(--card-bg, #fff); border-radius: 18px; padding: 32px; border: 1.5px solid rgba(0,0,0,0.06); }
    :root.dark-mode .form-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }

    .form-card h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-card h1 { color: #f1f5f9; }
    .subtitle { font-size: 14px; color: #64748b; margin: 0 0 24px; }

    .stepper { display: flex; align-items: center; margin-bottom: 28px; padding: 16px 0; }
    .step { display: flex; align-items: center; gap: 8px; }
    .step-num {
      width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; background: #e2e8f0; color: #64748b; transition: all 0.3s;
    }
    .step span { font-size: 13px; font-weight: 600; color: #94a3b8; }
    .step.active .step-num { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .step.active span { color: #6366f1; }
    .step.done .step-num { background: #22c55e; color: #fff; }
    .step.done span { color: #22c55e; }
    .step-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 12px; }
    .step-line.done { background: #22c55e; }
    :root.dark-mode .step-num { background: #334155; }
    :root.dark-mode .step-line { background: #334155; }

    .section-title { font-size: 18px; font-weight: 700; margin: 0 0 18px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .section-title { color: #f1f5f9; }

    .form-row { display: flex; gap: 16px; margin-bottom: 18px; }
    .form-group { flex: 1; }
    .form-group.full { flex: 1 1 100%; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-group label { color: #e2e8f0; }
    .form-group input, .form-group select {
      width: 100%; padding: 10px 14px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); font-family: inherit;
    }
    :root.dark-mode .form-group input, :root.dark-mode .form-group select { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #6366f1; }
    .form-group input.ng-invalid.ng-touched { border-color: #ef4444; }

    .info-box {
      padding: 14px 18px; border-radius: 12px; background: #eff6ff; color: #1e40af;
      font-size: 14px; margin-bottom: 20px; line-height: 1.5;
    }
    .info-box.mt { margin-top: 20px; }
    :root.dark-mode .info-box { background: rgba(99,102,241,0.08); color: #93c5fd; }

    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .form-actions.center { justify-content: center; }

    .btn-primary {
      padding: 11px 24px; border-radius: 10px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      font-size: 14px; font-weight: 700; transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(99,102,241,0.3); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-secondary {
      padding: 11px 24px; border-radius: 10px; cursor: pointer;
      border: 1.5px solid #e2e8f0; background: transparent;
      color: var(--text-primary, #0f172a); font-size: 14px; font-weight: 600;
      text-decoration: none; display: inline-flex; align-items: center;
    }
    :root.dark-mode .btn-secondary { border-color: #334155; color: #e2e8f0; }

    .success-block { text-align: center; padding: 20px 0; }
    .success-icon { font-size: 56px; margin-bottom: 12px; }
    .success-block h2 { font-size: 22px; font-weight: 800; color: #16a34a; margin: 0 0 8px; }
    .success-block > p { color: #64748b; font-size: 15px; margin-bottom: 24px; }

    .recap-card {
      text-align: left; background: var(--card-bg, #f8fafc); border-radius: 14px;
      padding: 20px; margin-bottom: 16px; border: 1px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .recap-card { background: #0f172a; border-color: rgba(255,255,255,0.06); }
    .recap-card h3 { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: var(--text-primary, #0f172a); }
    :root.dark-mode .recap-card h3 { color: #f1f5f9; }
    .recap-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #64748b; }
    .recap-row strong { color: var(--text-primary, #0f172a); }
    :root.dark-mode .recap-row strong { color: #e2e8f0; }

    .role-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; background: #dbeafe; color: #2563eb; }
    :root.dark-mode .role-badge { background: rgba(37,99,235,0.15); }

    .error-banner { padding: 12px 16px; border-radius: 10px; margin-top: 12px; background: #fef2f2; color: #dc2626; font-size: 14px; }
    :root.dark-mode .error-banner { background: rgba(220,38,38,0.12); }
    .success-banner { padding: 12px 16px; border-radius: 10px; margin-top: 12px; background: #f0fdf4; color: #16a34a; font-size: 14px; font-weight: 600; }
    :root.dark-mode .success-banner { background: rgba(22,163,74,0.12); }

    @media (max-width: 640px) { .form-row { flex-direction: column; } .stepper { flex-wrap: wrap; gap: 8px; } }
  `]
})
export class CompanyFormComponent implements OnInit {
  isEdit = false;
  companyId: number | null = null;
  saving = false;
  errorMsg = '';
  successMsg = '';
  step = 1;
  createdCompany: Company | null = null;
  private currentUserEmail = '';
  private currentUserRole = '';

  form: CompanyRequest = {
    name: '', email: '', siret: '', sector: '', address: '', phone: '', createdBy: 0
  };

  rhUser = {
    nom: '', prenom: '', email: '', password: '', phone: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companySvc: B2bCompanyService,
    private adminUsersSvc: AdminUsersApiService,
    private authSvc: AuthService,
    private activityLog: ActivityLogService,
    private toast: ToastService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.companyId = +id;
      this.companySvc.getById(this.companyId).subscribe({
        next: (c) => {
          this.form = {
            name: c.name, email: c.email, siret: c.siret,
            sector: c.sector, address: c.address, phone: c.phone, createdBy: c.createdBy
          };
        },
        error: () => { this.errorMsg = 'Company not found.'; }
      });
    }

    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserEmail = user.email || '';
        this.currentUserRole = user.role || '';
        if (!this.isEdit) {
          this.form.createdBy = user.idUser;
        }
      }
    });
  }

  nextStep() { this.step = 2; this.errorMsg = ''; }
  prevStep() { this.step = 1; this.errorMsg = ''; }

  createAll() {
    this.saving = true;
    this.errorMsg = '';

    // Step 1: Create the company
    this.companySvc.create(this.form).subscribe({
      next: (company) => {
        this.createdCompany = company;
        this.activityLog.logCreate(
          this.currentUserEmail || 'unknown',
          this.currentUserRole || 'unknown',
          'Company',
          company.id,
          `Created company ${company.name}`
        );

        // Step 2: Create the RH user linked to this company
        const rhReq: AdminCreateUserRequest = {
          nom: this.rhUser.nom,
          prenom: this.rhUser.prenom,
          email: this.rhUser.email,
          password: this.rhUser.password,
          role: 'RH_ENTREPRISE',
          phone: this.rhUser.phone || null,
          companyId: company.id,
          isActive: true
        };

        this.adminUsersSvc.create(rhReq).subscribe({
          next: () => {
            this.saving = false;
            this.step = 3;
            this.toast.success('Company and HR account created successfully!');
          },
          error: (e) => {
            this.errorMsg = 'Company created, but error creating the HR account: '
              + (e.error?.message || 'Check that the email is not already in use.');
            this.saving = false;
            this.step = 3;
          }
        });
      },
      error: (e) => {
        this.errorMsg = e.error?.message || 'Error creating the company.';
        this.saving = false;
      }
    });
  }

  save() {
    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.companySvc.update(this.companyId!, this.form).subscribe({
      next: () => {
        this.successMsg = 'Company updated!';
        this.saving = false;
        this.toast.success('Company updated successfully!');
        setTimeout(() => this.router.navigate([this.nav.basePath + '/companies']), 1200);
      },
      error: (e) => {
        this.errorMsg = e.error?.message || 'Error updating the company.';
        this.saving = false;
      }
    });
  }

  resetForm() {
    this.step = 1;
    this.form = { name: '', email: '', siret: '', sector: '', address: '', phone: '', createdBy: 0 };
    this.rhUser = { nom: '', prenom: '', email: '', password: '', phone: '' };
    this.createdCompany = null;
    this.errorMsg = '';

    this.authSvc.currentUser$.subscribe(user => {
      if (user) this.form.createdBy = user.idUser;
    });
  }
}
