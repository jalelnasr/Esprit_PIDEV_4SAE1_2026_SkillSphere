import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bCompanyService } from '../../services/company.service';
import { Company } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🏢 Companies</h1>
          <p class="subtitle">Manage partner companies</p>
        </div>
        <div class="header-actions">
          <button (click)="exportExcel()" class="btn-export" title="Export Excel">📊 Excel</button>
          <button (click)="exportPdf()" class="btn-export" title="Export PDF">📄 PDF</button>
          <a [routerLink]="nav.basePath + '/companies/new'" class="btn-primary">
            <span>+</span> New company
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div><div class="stat-value">{{ companies.length }}</div><div class="stat-label">Total</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div><div class="stat-value">{{ totalEmployees }}</div><div class="stat-label">Employees</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div><div class="stat-value">{{ totalCredits }}</div><div class="stat-label">Remaining credits</div></div>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="toolbar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search by name, email, sector...">
        </div>
        <select [(ngModel)]="sectorFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All sectors</option>
          <option *ngFor="let s of sectors" [value]="s">{{ s }}</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Email</th>
              <th>SIRET</th>
              <th>Sector</th>
              <th>Employees</th>
              <th>Credits</th>
              <th>Created on</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filtered">
              <td>
                <div class="company-cell">
                  <div class="avatar">{{ c.name.charAt(0) }}</div>
                  <div>
                    <strong>{{ c.name }}</strong>
                    <div class="phone-sub">📞 {{ c.phone }}</div>
                  </div>
                </div>
              </td>
              <td>{{ c.email }}</td>
              <td><code>{{ c.siret }}</code></td>
              <td><span class="badge sector">{{ c.sector }}</span></td>
              <td class="center">{{ c.employeeCount }}</td>
              <td class="center">
                <span [class.low-credits]="c.creditsRemaining < 5">{{ c.creditsRemaining }}</span>
              </td>
              <td>{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
              <td>
                <div class="actions">
                  <a [routerLink]="[nav.basePath + '/companies', c.id, 'edit']" class="btn-icon" title="Edit">✏️</a>
                  <button (click)="confirmDelete(c)" class="btn-icon danger" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="filtered.length === 0" class="empty">No company found</p>
      </div>

      <!-- Delete Modal -->
      <div class="modal-backdrop" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>⚠️ Confirm deletion</h3>
          <p>Delete company <strong>{{ deleteTarget.name }}</strong>? This action is irreversible.</p>
          <div class="modal-actions">
            <button (click)="deleteTarget = null" class="btn-secondary">Cancel</button>
            <button (click)="deleteCompany()" class="btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; font-weight: 800; margin: 0; color: var(--text-primary, #0f172a); }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .btn-export { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: #64748b; transition: all 0.2s; }
    .btn-export:hover { border-color: #6366f1; color: #6366f1; }
    :root.dark-mode .btn-export { background: #1e293b; border-color: #334155; color: #94a3b8; }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 20px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      font-weight: 600; font-size: 14px; text-decoration: none; border: none; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { box-shadow: 0 4px 12px rgba(99,102,241,0.3); transform: translateY(-1px); }

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .stat-card {
      display: flex; align-items: center; gap: 14px; padding: 18px 20px;
      background: var(--card-bg, #fff); border-radius: 14px;
      border: 1.5px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .stat-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .stat-icon { font-size: 28px; }
    .stat-value { font-size: 22px; font-weight: 800; color: var(--text-primary, #0f172a); }
    :root.dark-mode .stat-value { color: #f1f5f9; }
    .stat-label { font-size: 12px; color: #64748b; }

    .toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; position: relative; }
    .si { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; }
    .search-box input {
      width: 100%; padding: 10px 10px 10px 42px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
    }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select {
      padding: 10px 14px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
    }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .table-wrap {
      background: var(--card-bg, #fff); border-radius: 16px;
      border: 1.5px solid rgba(0,0,0,0.06); overflow-x: auto;
    }
    :root.dark-mode .table-wrap { background: #1e293b; border-color: rgba(255,255,255,0.06); }

    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1.5px solid rgba(0,0,0,0.06); }
    :root.dark-mode thead tr { border-color: rgba(255,255,255,0.06); }
    th {
      padding: 12px 16px; text-align: left; font-size: 12px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
      color: #64748b;
    }
    td { padding: 14px 16px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid rgba(0,0,0,0.04); }
    :root.dark-mode td { color: #e2e8f0; border-color: rgba(255,255,255,0.04); }
    tr:hover td { background: rgba(99,102,241,0.03); }

    .company-cell { display: flex; gap: 10px; align-items: center; }
    .avatar {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 15px; flex-shrink: 0;
    }
    .phone-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

    code { background: rgba(99,102,241,0.08); padding: 2px 8px; border-radius: 6px; font-size: 13px; color: #6366f1; }
    :root.dark-mode code { background: rgba(99,102,241,0.15); }

    .badge.sector {
      padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;
      background: #ede9fe; color: #6366f1;
    }
    :root.dark-mode .badge.sector { background: rgba(99,102,241,0.15); }

    .center { text-align: center; }
    .low-credits { color: #ef4444; font-weight: 700; }

    .actions { display: flex; gap: 6px; }
    .btn-icon {
      background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;
      border-radius: 6px; transition: background 0.2s;
      text-decoration: none;
    }
    .btn-icon:hover { background: rgba(0,0,0,0.05); }
    .btn-icon.danger:hover { background: rgba(239,68,68,0.1); }

    .empty { text-align: center; padding: 40px; color: #94a3b8; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    }
    .modal {
      background: var(--card-bg, #fff); border-radius: 16px; padding: 28px;
      max-width: 420px; width: 90%;
    }
    :root.dark-mode .modal { background: #1e293b; }
    .modal h3 { margin: 0 0 12px; font-size: 18px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .modal h3 { color: #f1f5f9; }
    .modal p { color: #64748b; font-size: 14px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-secondary {
      padding: 8px 18px; border-radius: 8px; border: 1.5px solid #e2e8f0;
      background: transparent; color: var(--text-primary, #0f172a); cursor: pointer; font-weight: 600;
    }
    :root.dark-mode .btn-secondary { border-color: #334155; color: #e2e8f0; }
    .btn-danger {
      padding: 8px 18px; border-radius: 8px; border: none;
      background: #ef4444; color: #fff; cursor: pointer; font-weight: 600;
    }
    .btn-danger:hover { background: #dc2626; }
  `]
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];
  filtered: Company[] = [];
  sectors: string[] = [];
  search = '';
  sectorFilter = '';
  deleteTarget: Company | null = null;
  totalEmployees = 0;
  totalCredits = 0;
  private currentUserEmail = '';
  private currentUserRole = '';

  constructor(
    private companySvc: B2bCompanyService,
    private authSvc: AuthService,
    private activityLog: ActivityLogService,
    private exportSvc: ExportService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.currentUserEmail = user?.email || '';
      this.currentUserRole = user?.role || '';
    });
    this.load();
  }

  load() {
    this.companySvc.getAll().subscribe(data => {
      this.companies = data || [];
      this.sectors = [...new Set(this.companies.map(c => c.sector).filter(Boolean))].sort();
      this.totalEmployees = this.companies.reduce((s, c) => s + (c.employeeCount || 0), 0);
      this.totalCredits = this.companies.reduce((s, c) => s + (c.creditsRemaining || 0), 0);
      this.filter();
    });
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.companies.filter(c => {
      const ms = !t || c.name.toLowerCase().includes(t) || c.email.toLowerCase().includes(t)
        || c.sector?.toLowerCase().includes(t) || c.siret?.includes(t);
      const mc = !this.sectorFilter || c.sector === this.sectorFilter;
      return ms && mc;
    });
  }

  confirmDelete(c: Company) { this.deleteTarget = c; }

  deleteCompany() {
    if (!this.deleteTarget) return;
    const target = this.deleteTarget;
    this.companySvc.delete(target.id).subscribe({
      next: () => {
        this.activityLog.logDelete(
          this.currentUserEmail || 'unknown',
          this.currentUserRole || 'unknown',
          'Company',
          target.id,
          `Deleted company ${target.name}`
        );
        this.deleteTarget = null;
        this.load();
      },
      error: () => { this.deleteTarget = null; }
    });
  }

  exportExcel() {
    const data = this.filtered.map(c => ({
      Name: c.name, Email: c.email, SIRET: c.siret, Sector: c.sector,
      Employees: c.employeeCount, Credits: c.creditsRemaining, Phone: c.phone,
      'Created At': c.createdAt || ''
    }));
    this.exportSvc.exportToExcel(data, 'companies', 'Companies');
  }

  exportPdf() {
    const cols = ['Name', 'Email', 'Sector', 'Employees', 'Credits', 'Created At'];
    const rows = this.filtered.map(c => [
      c.name, c.email, c.sector, c.employeeCount, c.creditsRemaining, c.createdAt || ''
    ]);
    this.exportSvc.exportToPdf(cols, rows, 'companies', 'Company List');
  }
}
