import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bEmployeeService } from '../../services/employee.service';
import { B2bCompanyService } from '../../services/company.service';
import { Employee, Company } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { BackendUser, BackendRole } from '../../../../core/models/auth.model';
import { ActivityLogService } from '../../services/activity-log.service';
import { B2bNavService } from '../../services/b2b-nav.service';
import { ExportService } from '../../services/export.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>👥 Employee Management</h1>
          <p class="subtitle">{{ filteredEmployees.length }} employee(s) found</p>
        </div>
        <div class="header-actions">
          <div class="export-group">
            <button (click)="exportExcel()" class="btn btn-sm" title="Export Excel">📊 Excel</button>
            <button (click)="exportPdf()" class="btn btn-sm" title="Export PDF">📄 PDF</button>
          </div>
          <a [routerLink]="nav.basePath + '/employees/import'" class="btn btn-outline">📥 Excel Import</a>
          <a [routerLink]="nav.basePath + '/employees/new'" class="btn btn-primary">+ Add employee</a>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search by name, department, position...">
        </div>
        <select [(ngModel)]="filterDepartment" (ngModelChange)="applyFilters()" class="filter-select">
          <option value="">All departments</option>
          <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
        </select>
        <select [(ngModel)]="filterCompany" (ngModelChange)="applyFilters()" class="filter-select">
          <option value="0">All companies</option>
          <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-container" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Company</th>
              <th>Department</th>
              <th>Position</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emp of paginatedEmployees">
              <td class="id-cell">#{{ emp.id }}</td>
              <td>{{ emp.companyName }}</td>
              <td><span class="dept-badge">{{ emp.department }}</span></td>
              <td>{{ emp.position }}</td>
              <td>{{ emp.hireDate | date:'dd/MM/yyyy' }}</td>
              <td class="actions-cell">
                <a [routerLink]="[nav.basePath + '/employees', emp.id]" class="action-btn view" title="View">👁️</a>
                <a [routerLink]="[nav.basePath + '/employees', emp.id, 'edit']" class="action-btn edit" title="Edit">✏️</a>
                <button (click)="confirmDelete(emp)" class="action-btn delete" title="Delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="filteredEmployees.length === 0" class="empty">No employee found</p>
      </div>

      <!-- Loading spinner -->
      <div class="loading-container" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading employees...</p>
      </div>

      <!-- Delete confirmation modal -->
      <div class="modal-overlay" *ngIf="employeeToDelete" (click)="employeeToDelete = null">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3>⚠️ Confirm Deletion</h3>
          <p>Are you sure you want to delete employee <strong>#{{ employeeToDelete.id }}</strong>?</p>
          <p class="modal-sub">This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="btn btn-cancel" (click)="employeeToDelete = null">Cancel</button>
            <button class="btn btn-danger" (click)="deleteEmployee(employeeToDelete)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="page-btn">← Previous</button>
        <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
        <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="page-btn">Next →</button>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .export-group { display: flex; gap: 6px; }
    .btn-sm { padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #64748b); transition: all 0.2s; }
    .btn-sm:hover { border-color: #6366f1; color: #6366f1; }
    :root.dark-mode .btn-sm { background: #1e293b; border-color: #334155; color: #94a3b8; }
    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:hover { box-shadow: 0 4px 12px rgba(99,102,241,0.3); transform: translateY(-1px); }
    .btn-outline { background: transparent; border: 1.5px solid #6366f1; color: #6366f1; }
    .btn-outline:hover { background: rgba(99,102,241,0.08); }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 240px; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 16px; }
    .search-box input {
      width: 100%; padding: 10px 10px 10px 38px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid var(--border, #e2e8f0); background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
    }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select {
      padding: 10px 14px; border-radius: 10px; font-size: 14px;
      border: 1.5px solid var(--border, #e2e8f0); background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
    }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .table-container {
      background: var(--card-bg, #fff); border-radius: 16px; overflow: hidden;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06)); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    :root.dark-mode .table-container { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;
      background: var(--header-bg, #f8fafc); border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
    }
    :root.dark-mode .data-table th { background: #0f172a; }
    .data-table td { padding: 14px 16px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.03)); }
    :root.dark-mode .data-table td { color: #e2e8f0; }
    .data-table tr:hover td { background: var(--hover-bg, rgba(99,102,241,0.03)); }
    :root.dark-mode .data-table tr:hover td { background: rgba(99,102,241,0.08); }
    .id-cell { font-weight: 700; color: #6366f1 !important; }
    .dept-badge { background: #ede9fe; color: #6366f1; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    :root.dark-mode .dept-badge { background: rgba(99,102,241,0.15); }
    .actions-cell { display: flex; gap: 6px; }
    .action-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: background 0.2s; }
    .action-btn:hover { background: rgba(0,0,0,0.06); }
    :root.dark-mode .action-btn:hover { background: rgba(255,255,255,0.08); }
    .empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
    .page-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); cursor: pointer; font-size: 13px; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-btn:not(:disabled):hover { border-color: #6366f1; color: #6366f1; }
    :root.dark-mode .page-btn { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .page-info { font-size: 13px; color: #64748b; }

    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 16px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { background: var(--card-bg, #fff); border-radius: 16px; padding: 28px; max-width: 420px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    :root.dark-mode .modal-card { background: #1e293b; }
    .modal-card h3 { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .modal-card h3 { color: #f1f5f9; }
    .modal-card p { font-size: 14px; color: #64748b; margin: 0 0 6px; }
    .modal-sub { font-size: 12px; color: #94a3b8; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-cancel { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; padding: 8px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .btn-danger { background: #dc2626; color: #fff; border: none; padding: 8px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .btn-danger:hover { background: #b91c1c; }
    :root.dark-mode .btn-cancel { border-color: #334155; color: #94a3b8; }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  companies: Company[] = [];
  departments: string[] = [];
  loading = true;
  employeeToDelete: Employee | null = null;

  searchTerm = '';
  filterDepartment = '';
  filterCompany = 0;

  currentPage = 1;
  pageSize = 10;

  currentUser: BackendUser | null = null;
  userRole: BackendRole | null = null;
  userCompanyId: number | null = null;

  get isCompanyScoped(): boolean {
    return this.userRole === 'RH_ENTREPRISE' || this.userRole === 'MANAGER';
  }

  get totalPages() { return Math.ceil(this.filteredEmployees.length / this.pageSize) || 1; }
  get paginatedEmployees() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  constructor(
    private employeeSvc: B2bEmployeeService,
    private companySvc: B2bCompanyService,
    private authSvc: AuthService,
    private activityLog: ActivityLogService,
    private exportSvc: ExportService,
    private toast: ToastService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userRole = user?.role || null;
      this.userCompanyId = user?.companyId || null;

      if (this.isCompanyScoped && this.userCompanyId) {
        // RH/Manager: only see their company
        this.companySvc.getById(this.userCompanyId).subscribe(c => this.companies = c ? [c] : []);
      } else {
        this.companySvc.getAll().subscribe(c => this.companies = c || []);
      }
      this.loadEmployees();
    });
  }

  loadEmployees() {
    const obs = (this.isCompanyScoped && this.userCompanyId)
      ? this.employeeSvc.getByCompany(this.userCompanyId)
      : this.employeeSvc.getAll();

    obs.subscribe(data => {
      this.employees = data || [];
      this.departments = [...new Set(this.employees.map(e => e.department).filter(Boolean))];
      this.loading = false;
      this.applyFilters();
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(e => {
      const matchSearch = !term ||
        e.department?.toLowerCase().includes(term) ||
        e.position?.toLowerCase().includes(term) ||
        e.companyName?.toLowerCase().includes(term) ||
        String(e.id).includes(term);
      const matchDept = !this.filterDepartment || e.department === this.filterDepartment;
      const matchCompany = !this.filterCompany || e.companyId === +this.filterCompany;
      return matchSearch && matchDept && matchCompany;
    });
    this.currentPage = 1;
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  confirmDelete(emp: Employee) {
    this.employeeToDelete = emp;
  }

  deleteEmployee(emp: Employee) {
    this.employeeToDelete = null;
    this.employeeSvc.delete(emp.id).subscribe(() => {
      this.toast.success(`Employee #${emp.id} deleted successfully`);
      this.activityLog.logDelete(
        this.currentUser?.email || 'unknown',
        this.userRole || 'unknown',
        'Employee',
        emp.id,
        `Deleted employee #${emp.id}`
      );
      this.loadEmployees();
    });
  }

  exportExcel() {
    const data = this.filteredEmployees.map(e => ({
      ID: e.id,
      Company: e.companyName || '',
      Department: e.department || '',
      Position: e.position || '',
      'Hire Date': e.hireDate || ''
    }));
    this.exportSvc.exportToExcel(data, 'employees', 'Employees');
  }

  exportPdf() {
    const columns = ['ID', 'Company', 'Department', 'Position', 'Hire Date'];
    const rows = this.filteredEmployees.map(e => [
      e.id, e.companyName || '', e.department || '', e.position || '', e.hireDate || ''
    ]);
    this.exportSvc.exportToPdf(columns, rows, 'employees', 'Employee List');
  }
}
