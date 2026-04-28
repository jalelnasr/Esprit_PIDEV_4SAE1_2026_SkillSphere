import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminUsersApiService, AdminCreateUserRequest, UserResponse } from '../../../admin/admin-users-api.service';
import { BackendUser } from '../../../core/models/auth.model';
import { ActivityLogService } from '../services/activity-log.service';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>👤 Account Management</h1>
          <p class="subtitle">Manage Manager and Employee accounts for your company</p>
        </div>
        <button (click)="showForm = !showForm" class="btn btn-primary">
          {{ showForm ? '✕ Close' : '+ New account' }}
        </button>
      </div>

      <!-- Create Form -->
      <div class="form-card" *ngIf="showForm">
        <h2>➕ Create a new account</h2>

        <form (ngSubmit)="createAccount()">
          <div class="form-row">
            <div class="form-group">
              <label>First Name *</label>
              <input type="text" [(ngModel)]="newUser.prenom" name="prenom" required placeholder="First Name">
            </div>
            <div class="form-group">
              <label>Last Name *</label>
              <input type="text" [(ngModel)]="newUser.nom" name="nom" required placeholder="Last Name">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="newUser.email" name="email" required placeholder="email@company.tn">
            </div>
            <div class="form-group">
              <label>Password *</label>
              <input type="password" [(ngModel)]="newUser.password" name="password" required minlength="6" placeholder="Min. 6 characters">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="newUser.role" name="role" required>
                <option value="">-- Select --</option>
                <option value="MANAGER">Manager</option>
                <option value="APPRENANT">Learner / Employee</option>
              </select>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="newUser.phone" name="phone" placeholder="+216 XX XXX XXX">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" (click)="showForm = false" class="btn btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary"
                    [disabled]="saving || !newUser.nom || !newUser.prenom || !newUser.email || !newUser.password || !newUser.role">
              {{ saving ? 'Creating...' : '🚀 Create account' }}
            </button>
          </div>

          <div class="error-msg" *ngIf="errorMsg">❌ {{ errorMsg }}</div>
          <div class="success-msg" *ngIf="successMsg">✅ {{ successMsg }}</div>
        </form>
      </div>

      <!-- Users List -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of companyUsers">
              <td class="id-cell">#{{ u.idUser }}</td>
              <td class="name-cell">{{ u.prenom }} {{ u.nom }}</td>
              <td>{{ u.email }}</td>
              <td><span class="role-badge" [ngClass]="u.role.toLowerCase()">{{ roleLabel(u.role) }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="u.isActive ? 'active' : 'inactive'">
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions-cell">
                <button *ngIf="u.role !== 'RH_ENTREPRISE'" (click)="toggleActive(u)" class="action-btn" [title]="u.isActive ? 'Disable' : 'Enable'">
                  {{ u.isActive ? '🔒' : '🔓' }}
                </button>
                <button *ngIf="u.role !== 'RH_ENTREPRISE'" (click)="deleteUser(u)" class="action-btn delete" title="Delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="companyUsers.length === 0" class="empty">No account found for your company</p>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: none; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }

    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(99,102,241,0.3); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
    :root.dark-mode .btn-cancel { border-color: #334155; color: #94a3b8; }

    .form-card {
      background: var(--card-bg, #fff); border-radius: 16px; padding: 28px;
      border: 1px solid rgba(0,0,0,0.06); margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    :root.dark-mode .form-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .form-card h2 { font-size: 18px; font-weight: 700; margin: 0 0 20px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-card h2 { color: #f1f5f9; }

    .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .form-group { flex: 1; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-group label { color: #e2e8f0; }
    .form-group input, .form-group select {
      width: 100%; padding: 10px 14px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); font-family: inherit;
    }
    :root.dark-mode .form-group input, :root.dark-mode .form-group select { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #6366f1; }

    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

    .table-container {
      background: var(--card-bg, #fff); border-radius: 16px; overflow: hidden;
      border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    :root.dark-mode .table-container { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;
      background: #f8fafc; border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .data-table th { background: #0f172a; }
    .data-table td { padding: 14px 16px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid rgba(0,0,0,0.03); }
    :root.dark-mode .data-table td { color: #e2e8f0; }
    .data-table tr:hover td { background: rgba(99,102,241,0.03); }
    :root.dark-mode .data-table tr:hover td { background: rgba(99,102,241,0.08); }
    .id-cell { font-weight: 700; color: #6366f1 !important; }
    .name-cell { font-weight: 600; }

    .role-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .role-badge.rh_entreprise { background: #dbeafe; color: #2563eb; }
    .role-badge.manager { background: #ede9fe; color: #6366f1; }
    .role-badge.apprenant { background: #dcfce7; color: #16a34a; }
    :root.dark-mode .role-badge.rh_entreprise { background: rgba(37,99,235,0.15); }
    :root.dark-mode .role-badge.manager { background: rgba(99,102,241,0.15); }
    :root.dark-mode .role-badge.apprenant { background: rgba(22,163,74,0.15); }

    .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.inactive { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .status-badge.active { background: rgba(22,163,74,0.15); }
    :root.dark-mode .status-badge.inactive { background: rgba(220,38,38,0.15); }

    .actions-cell { display: flex; gap: 6px; }
    .action-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: background 0.2s; }
    .action-btn:hover { background: rgba(0,0,0,0.06); }
    :root.dark-mode .action-btn:hover { background: rgba(255,255,255,0.08); }

    .empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
    .error-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 14px; }
    :root.dark-mode .error-msg { background: rgba(220,38,38,0.1); }
    .success-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: #f0fdf4; color: #16a34a; font-size: 14px; font-weight: 600; }
    :root.dark-mode .success-msg { background: rgba(22,163,74,0.1); }

    @media (max-width: 640px) { .form-row { flex-direction: column; } }
  `]
})
export class AccountManagementComponent implements OnInit {
  companyUsers: UserResponse[] = [];
  currentUser: BackendUser | null = null;
  showForm = false;
  saving = false;
  errorMsg = '';
  successMsg = '';

  newUser = {
    nom: '', prenom: '', email: '', password: '', role: '', phone: ''
  };

  constructor(
    private authSvc: AuthService,
    private adminUsersSvc: AdminUsersApiService,
    private activityLog: ActivityLogService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.companyId) {
        this.loadCompanyUsers(user.companyId);
      }
    });
  }

  loadCompanyUsers(companyId: number) {
    this.adminUsersSvc.getUsersByCompany(companyId).subscribe({
      next: (users) => { this.companyUsers = users || []; },
      error: () => { this.companyUsers = []; }
    });
  }

  createAccount() {
    if (!this.currentUser?.companyId) return;
    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    const req: AdminCreateUserRequest = {
      nom: this.newUser.nom,
      prenom: this.newUser.prenom,
      email: this.newUser.email,
      password: this.newUser.password,
      role: this.newUser.role as any,
      phone: this.newUser.phone || null,
      companyId: this.currentUser.companyId,
      isActive: true
    };

    this.adminUsersSvc.create(req).subscribe({
      next: () => {
        this.successMsg = `${this.roleLabel(this.newUser.role)} account created successfully!`;
        if (this.currentUser) {
          this.activityLog.logCreate(this.currentUser.email, this.currentUser.role, 'Account', 0, `Created account ${this.newUser.email} with role ${this.roleLabel(this.newUser.role)}`);
        }
        this.saving = false;
        this.newUser = { nom: '', prenom: '', email: '', password: '', role: '', phone: '' };
        this.loadCompanyUsers(this.currentUser!.companyId!);
        setTimeout(() => this.showForm = false, 1500);
      },
      error: (e) => {
        this.errorMsg = e.error?.message || 'Error — please verify the email is not already in use.';
        this.saving = false;
      }
    });
  }

  toggleActive(user: UserResponse) {
    const newStatus = !user.isActive;
    this.adminUsersSvc.setActive(user.idUser, newStatus).subscribe({
      next: () => { user.isActive = newStatus; },
      error: () => { }
    });
  }

  deleteUser(user: UserResponse) {
    if (confirm(`Delete the account of ${user.prenom} ${user.nom}?`)) {
      this.adminUsersSvc.delete(user.idUser).subscribe({
        next: () => {
          this.companyUsers = this.companyUsers.filter(u => u.idUser !== user.idUser);
        },
        error: () => {}
      });
    }
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      'RH_ENTREPRISE': 'Company HR',
      'MANAGER': 'Manager',
      'APPRENANT': 'Learner',
      'FORMATEUR': 'Trainer',
      'ADMIN': 'Administrator'
    };
    return map[role] || role;
  }
}
