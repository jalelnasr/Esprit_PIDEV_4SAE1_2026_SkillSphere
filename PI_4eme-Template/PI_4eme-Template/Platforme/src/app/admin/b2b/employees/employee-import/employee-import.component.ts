import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { B2bEmployeeService } from '../../services/employee.service';
import { B2bCompanyService } from '../../services/company.service';
import { Company } from '../../models/b2b.models';
import { AdminUsersApiService, AdminCreateUserRequest } from '../../../../admin/admin-users-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BackendRole } from '../../../../core/models/auth.model';
import { firstValueFrom } from 'rxjs';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';

interface ImportRow {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  department: string;
  position: string;
  // Generated after account creation
  generatedUserId?: number;
  status?: 'pending' | 'success' | 'error';
  step?: string;
  errorMsg?: string;
}

@Component({
  selector: 'app-employee-import',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <a [routerLink]="nav.basePath + '/employees'" class="back-link">← Back to employees</a>
        <h1>📥 Bulk employee import</h1>
        <p class="subtitle">
          Import your employees via a CSV file — user accounts are
          <strong>created automatically</strong>
        </p>
      </div>

      <!-- Step 1: Select Company -->
      <div class="company-select" *ngIf="!rows.length">
        <label>Target company *</label>
        <select [(ngModel)]="selectedCompanyId" class="form-control" [disabled]="isCompanyScoped">
          <option [value]="0" disabled>— Select a company —</option>
          <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Upload Zone -->
      <div class="upload-zone" *ngIf="!rows.length && selectedCompanyId > 0"
           (dragover)="$event.preventDefault()" (drop)="onDrop($event)"
           (click)="fileInput.click()">
        <input type="file" #fileInput (change)="onFileSelect($event)" accept=".csv,.txt,.xlsx" hidden>
        <div class="upload-icon">📁</div>
        <h3>Drag and drop your CSV file here</h3>
        <p>or click to browse</p>
        <div class="format-help">
          <strong>Expected format (CSV):</strong><br>
          nom, prenom, email, password, role, department, position<br>
          <code>Ben Ali, Mohamed, mali&#64;test.com, Pass1234, APPRENANT, IT, Developer</code><br><br>
          <strong>Available roles:</strong> APPRENANT, MANAGER, FORMATEUR
        </div>
      </div>

      <div class="upload-zone disabled" *ngIf="!rows.length && selectedCompanyId === 0">
        <div class="upload-icon">⬆️</div>
        <h3>Select a company first</h3>
      </div>

      <!-- Download Template -->
      <div class="template-download" *ngIf="!rows.length && selectedCompanyId > 0">
        <button (click)="downloadTemplate()" class="btn btn-outline">
          📄 Download CSV template
        </button>
      </div>

      <!-- Preview -->
      <div *ngIf="rows.length > 0">
        <div class="preview-header">
          <div>
            <h2>Preview ({{ rows.length }} employee(s))</h2>
            <p class="preview-company">Company: <strong>{{ selectedCompanyName }}</strong></p>
          </div>
          <div class="preview-actions">
            <button (click)="resetImport()" class="btn btn-cancel">Cancel</button>
            <button (click)="startImport()" class="btn btn-primary" [disabled]="importing">
              {{ importing ? 'Importing...' : '🚀 Start import' }}
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="info-banner" *ngIf="!importing && !importDone">
          <strong>ℹ️ What will happen:</strong>
          For each row, the system will automatically:
          <ol>
            <li>Create the <strong>user account</strong> (email + password)</li>
            <li>Create the <strong>employee</strong> in the company {{ selectedCompanyName }}</li>
          </ol>
        </div>

        <!-- Progress -->
        <div class="progress-section" *ngIf="importing || importDone">
          <div class="progress-bar-lg">
            <div class="progress-fill-lg" [style.width.%]="(processed / rows.length) * 100"></div>
          </div>
          <div class="progress-stats">
            <span>{{ processed }}/{{ rows.length }} processed</span>
            <span class="success-count">✅ {{ successCount }}</span>
            <span class="error-count">❌ {{ errorCount }}</span>
          </div>
        </div>

        <!-- Summary when done -->
        <div class="success-banner" *ngIf="importDone && successCount > 0">
          ✅ <strong>{{ successCount }}</strong> employee(s) imported successfully!
          Accounts were created automatically.
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Last Name</th><th>First Name</th><th>Email</th><th>Role</th>
                <th>Department</th><th>Position</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of rows"
                  [class.row-success]="r.status === 'success'"
                  [class.row-error]="r.status === 'error'">
                <td>{{ r.nom }}</td>
                <td>{{ r.prenom }}</td>
                <td>{{ r.email }}</td>
                <td><span class="role-tag">{{ r.role }}</span></td>
                <td>{{ r.department }}</td>
                <td>{{ r.position }}</td>
                <td>
                  <span *ngIf="r.status === 'pending'" class="badge pending">⏳ Pending</span>
                  <span *ngIf="r.status === 'success'" class="badge success">
                    ✅ OK (ID: {{ r.generatedUserId }})
                  </span>
                  <span *ngIf="r.status === 'error'" class="badge error"
                        [title]="r.errorMsg || ''">❌ {{ r.step }}: {{ r.errorMsg }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Error Report -->
        <div class="error-report" *ngIf="importDone && errorCount > 0">
          <h3>⚠️ Error report</h3>
          <div *ngFor="let r of rows" class="error-line" [hidden]="r.status !== 'error'">
            <strong>{{ r.prenom }} {{ r.nom }} ({{ r.email }})</strong>
            — Step "{{ r.step }}": {{ r.errorMsg }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 960px; }
    .page-header { margin-bottom: 24px; }
    .back-link { color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; }
    .back-link:hover { text-decoration: underline; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 8px 0 4px; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; line-height: 1.5; }

    .company-select { margin-bottom: 20px; }
    .company-select label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; }
    .form-control {
      width: 100%; max-width: 400px; padding: 12px 14px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: #fff; color: #0f172a;
    }
    :root.dark-mode .form-control { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .form-control:focus { outline: none; border-color: #6366f1; }

    .upload-zone {
      border: 2px dashed #cbd5e1; border-radius: 16px; padding: 48px 40px; text-align: center;
      cursor: pointer; transition: all 0.2s; background: var(--card-bg, #fff);
    }
    .upload-zone.disabled { opacity: 0.5; cursor: not-allowed; border-color: #e2e8f0; }
    :root.dark-mode .upload-zone { border-color: #334155; background: #1e293b; }
    .upload-zone:not(.disabled):hover { border-color: #6366f1; background: rgba(99,102,241,0.02); }
    .upload-icon { font-size: 48px; margin-bottom: 12px; }
    .upload-zone h3 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 4px; }
    :root.dark-mode .upload-zone h3 { color: #f1f5f9; }
    .upload-zone p { color: #94a3b8; font-size: 14px; margin: 0 0 20px; }
    .format-help { background: #f8fafc; border-radius: 8px; padding: 16px; font-size: 13px; color: #64748b; display: inline-block; text-align: left; line-height: 1.6; }
    :root.dark-mode .format-help { background: #0f172a; }
    .format-help code { color: #6366f1; font-size: 12px; }

    .template-download { margin-top: 16px; text-align: center; }
    .btn-outline {
      padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px;
      cursor: pointer; border: 1.5px solid #6366f1; color: #6366f1; background: transparent;
    }
    .btn-outline:hover { background: rgba(99,102,241,0.06); }

    .preview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .preview-header h2 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .preview-header h2 { color: #f1f5f9; }
    .preview-company { font-size: 13px; color: #64748b; margin: 4px 0 0; }
    .preview-actions { display: flex; gap: 10px; }
    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
    :root.dark-mode .btn-cancel { border-color: #334155; color: #94a3b8; }

    .info-banner {
      background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 16px;
      font-size: 13px; color: #1e40af; line-height: 1.6;
    }
    :root.dark-mode .info-banner { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); color: #a5b4fc; }
    .info-banner ol { margin: 8px 0 0 20px; padding: 0; }

    .success-banner {
      background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 16px;
      font-size: 14px; color: #16a34a;
    }
    :root.dark-mode .success-banner { background: rgba(22,163,106,0.08); border-color: rgba(22,163,106,0.2); }

    .progress-section { margin-bottom: 20px; }
    .progress-bar-lg { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin-bottom: 8px; }
    :root.dark-mode .progress-bar-lg { background: #334155; }
    .progress-fill-lg { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 5px; transition: width 0.3s; }
    .progress-stats { display: flex; gap: 16px; font-size: 13px; color: #64748b; }
    .success-count { color: #16a34a; }
    .error-count { color: #dc2626; }

    .table-container { background: var(--card-bg, #fff); border-radius: 16px; overflow: hidden; border: 1px solid var(--card-border, rgba(0,0,0,0.06)); overflow-x: auto; }
    :root.dark-mode .table-container { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { text-align: left; padding: 12px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: var(--header-bg, #f8fafc); white-space: nowrap; }
    :root.dark-mode .data-table th { background: #0f172a; }
    .data-table td { padding: 10px 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid rgba(0,0,0,0.03); }
    :root.dark-mode .data-table td { color: #e2e8f0; }
    .row-success td { background: rgba(22,163,106,0.04); }
    .row-error td { background: rgba(220,38,38,0.04); }
    .role-tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; background: #ede9fe; color: #6d28d9; text-transform: uppercase; }
    :root.dark-mode .role-tag { background: rgba(109,40,217,0.15); }
    .badge { padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge.pending { background: #fef3c7; color: #d97706; }
    .badge.success { background: #dcfce7; color: #16a34a; }
    .badge.error { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge.pending { background: rgba(217,119,6,0.15); }
    :root.dark-mode .badge.success { background: rgba(22,163,106,0.15); }
    :root.dark-mode .badge.error { background: rgba(220,38,38,0.15); }

    .error-report { margin-top: 20px; background: #fef2f2; border-radius: 12px; padding: 16px; }
    :root.dark-mode .error-report { background: rgba(220,38,38,0.08); }
    .error-report h3 { margin: 0 0 10px; font-size: 15px; color: #dc2626; }
    .error-line { font-size: 13px; color: #dc2626; padding: 4px 0; }
  `]
})
export class EmployeeImportComponent implements OnInit {
  rows: ImportRow[] = [];
  companies: Company[] = [];
  selectedCompanyId = 0;
  selectedCompanyName = '';
  importing = false;
  importDone = false;
  processed = 0;
  successCount = 0;
  errorCount = 0;
  isCompanyScoped = false;
  private currentUserEmail = '';
  private currentUserRole = '';

  constructor(
    private employeeSvc: B2bEmployeeService,
    private companySvc: B2bCompanyService,
    private usersSvc: AdminUsersApiService,
    private authSvc: AuthService,
    private router: Router,
    private activityLog: ActivityLogService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.currentUserEmail = user?.email || '';
      this.currentUserRole = user?.role || '';
      const role = user?.role;
      const companyId = user?.companyId;

      if ((role === 'RH_ENTREPRISE' || role === 'MANAGER') && companyId) {
        this.isCompanyScoped = true;
        this.selectedCompanyId = companyId;
        this.companySvc.getById(companyId).subscribe(c => {
          this.companies = c ? [c] : [];
          this.selectedCompanyName = c?.name || '';
        });
      } else {
        this.companySvc.getAll().subscribe(c => this.companies = c || []);
      }
    });
  }

  onCompanyChange() {
    const company = this.companies.find(c => c.id === +this.selectedCompanyId);
    this.selectedCompanyName = company?.name || '';
  }

  onDrop(evt: DragEvent) {
    evt.preventDefault();
    const file = evt.dataTransfer?.files?.[0];
    if (file) this.parseFile(file);
  }

  onFileSelect(evt: any) {
    const file = evt.target.files?.[0];
    if (file) this.parseFile(file);
  }

  parseFile(file: File) {
    // Update company name
    this.onCompanyChange();

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => {
        if (!l) return false;
        const lower = l.toLowerCase();
        return !lower.startsWith('nom') && !lower.startsWith('#');
      });

      this.rows = lines.map(line => {
        // Support both comma and semicolon separators
        const sep = line.includes(';') ? ';' : ',';
        const parts = line.split(sep).map(p => p.trim());
        return {
          nom: parts[0] || '',
          prenom: parts[1] || '',
          email: parts[2] || '',
          password: parts[3] || 'Default123',
          role: (parts[4] || 'APPRENANT').toUpperCase(),
          department: parts[5] || '',
          position: parts[6] || '',
          status: 'pending' as const
        };
      }).filter(r => r.nom && r.email);
    };
    reader.readAsText(file);
  }

  async startImport() {
    this.importing = true;
    this.processed = 0;
    this.successCount = 0;
    this.errorCount = 0;

    for (const row of this.rows) {
      try {
        // ===== STEP 1: Create user account =====
        row.step = 'Account creation';
        const validRoles: BackendRole[] = ['APPRENANT', 'MANAGER', 'FORMATEUR'];
        const role = validRoles.includes(row.role as BackendRole) ? row.role as BackendRole : 'APPRENANT';

        const createReq: AdminCreateUserRequest = {
          nom: row.nom,
          prenom: row.prenom,
          email: row.email,
          password: row.password,
          role: role,
          companyId: +this.selectedCompanyId
        };

        const userResponse = await firstValueFrom(this.usersSvc.create(createReq));
        row.generatedUserId = userResponse.idUser;

        // ===== STEP 2: Create employee record =====
        row.step = 'Employee creation';
        await firstValueFrom(this.employeeSvc.create({
          id: userResponse.idUser,
          companyId: +this.selectedCompanyId,
          department: row.department,
          position: row.position,
          managerId: null
        }));

        row.status = 'success';
        row.step = 'Completed';
        this.successCount++;
      } catch (err: any) {
        row.status = 'error';
        const msg = err?.error?.message || err?.error?.error || err?.message || 'Unknown error';
        row.errorMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
        this.errorCount++;
      }
      this.processed++;
    }

    this.importing = false;
    this.importDone = true;

    if (this.successCount > 0) {
      this.activityLog.logImport(
        this.currentUserEmail || 'unknown',
        this.currentUserRole || 'unknown',
        `Imported ${this.successCount} employees via CSV`,
        `Company: ${this.selectedCompanyName}, Total: ${this.rows.length}, Success: ${this.successCount}, Errors: ${this.errorCount}`
      );
    }
  }

  downloadTemplate() {
    const header = 'nom,prenom,email,password,role,department,position';
    const example1 = 'Ben Ali,Mohamed,mali@test.com,Pass1234,APPRENANT,IT,Developer';
    const example2 = 'Trabelsi,Salma,salma@test.com,Pass1234,MANAGER,Marketing,Project Manager';
    const example3 = 'Hammami,Ahmed,ahmed@test.com,Pass1234,APPRENANT,HR,HR Assistant';
    const csv = [header, example1, example2, example3].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  resetImport() {
    this.rows = [];
    this.importing = false;
    this.importDone = false;
    this.processed = 0;
    this.successCount = 0;
    this.errorCount = 0;
  }
}
