import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bAssignmentService } from '../../services/assignment.service';
import { Assignment } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { B2bNavService } from '../../services/b2b-nav.service';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📋 Assignments</h1>
          <p class="subtitle">{{ filteredAssignments.length }} assignment(s)</p>
        </div>
        <a [routerLink]="nav.basePath + '/assignments/new'" class="btn btn-primary">+ New assignment</a>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search for a training...">
        </div>
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="filter-select">
          <option value="">All statuses</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Training</th>
              <th>Pack</th>
              <th>Employee</th>
              <th>Deadline</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of paginated">
              <td class="id-cell">#{{ a.id }}</td>
              <td>{{ a.courseName }}</td>
              <td>{{ a.packName }}</td>
              <td>#{{ a.employeeId }}</td>
              <td [class.overdue]="isOverdue(a)">{{ a.deadline | date:'dd/MM/yyyy' }}</td>
              <td>
                <div class="progress-bar"><div class="progress-fill" [style.width.%]="a.progressPercent"></div></div>
                <small>{{ a.progressPercent }}%</small>
              </td>
              <td><span class="badge" [ngClass]="a.status.toLowerCase()">{{ statusLabel(a.status) }}</span></td>
              <td class="actions-cell">
                <button *ngIf="a.status !== 'CANCELLED'" (click)="cancelAssignment(a)" class="action-btn" title="Cancel">❌</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="filteredAssignments.length === 0" class="empty">No assignment found</p>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="page = page - 1" [disabled]="page === 1" class="page-btn">←</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button (click)="page = page + 1" [disabled]="page === totalPages" class="page-btn">→</button>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: none; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; cursor: pointer; border: none; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:hover { box-shadow: 0 4px 12px rgba(99,102,241,0.3); }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 240px; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; padding: 10px 10px 10px 38px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select { padding: 10px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .table-container { background: var(--card-bg, #fff); border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .table-container { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: #f8fafc; border-bottom: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .data-table th { background: #0f172a; }
    .data-table td { padding: 12px 14px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid rgba(0,0,0,0.03); }
    :root.dark-mode .data-table td { color: #e2e8f0; }
    .id-cell { font-weight: 700; color: #6366f1 !important; }
    .overdue { color: #dc2626 !important; font-weight: 600; }
    .progress-bar { width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 6px; }
    :root.dark-mode .progress-bar { background: #334155; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 3px; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.in_progress { background: #dbeafe; color: #2563eb; }
    .badge.completed { background: #dcfce7; color: #16a34a; }
    .badge.cancelled { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge.in_progress { background: rgba(37,99,235,0.2); }
    :root.dark-mode .badge.completed { background: rgba(22,163,106,0.2); }
    :root.dark-mode .badge.cancelled { background: rgba(220,38,38,0.2); }
    .actions-cell { text-align: center; }
    .action-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px; }
    .action-btn:hover { background: rgba(220,38,38,0.1); }
    .empty { text-align: center; padding: 40px; color: #94a3b8; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
    .page-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); cursor: pointer; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    :root.dark-mode .page-btn { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .page-info { font-size: 13px; color: #64748b; }
  `]
})
export class AssignmentListComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  searchTerm = '';
  filterStatus = '';
  page = 1;
  pageSize = 10;

  private userCompanyId: number | null = null;
  private userRole: string | null = null;

  get isCompanyScoped(): boolean {
    return this.userRole === 'RH_ENTREPRISE' || this.userRole === 'MANAGER';
  }

  get totalPages() { return Math.ceil(this.filteredAssignments.length / this.pageSize) || 1; }
  get paginated() { const s = (this.page - 1) * this.pageSize; return this.filteredAssignments.slice(s, s + this.pageSize); }

  constructor(private svc: B2bAssignmentService, private authSvc: AuthService, public nav: B2bNavService) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.userCompanyId = user?.companyId || null;
      this.load();
    });
  }

  load() {
    const obs = (this.isCompanyScoped && this.userCompanyId)
      ? this.svc.getByCompany(this.userCompanyId)
      : this.svc.getAll();
    obs.subscribe(d => { this.assignments = d || []; this.applyFilters(); });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredAssignments = this.assignments.filter(a => {
      const matchSearch = !term || a.courseName?.toLowerCase().includes(term) || a.packName?.toLowerCase().includes(term);
      const matchStatus = !this.filterStatus || a.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
    this.page = 1;
  }

  isOverdue(a: Assignment): boolean {
    return a.status === 'IN_PROGRESS' && new Date(a.deadline) < new Date();
  }

  cancelAssignment(a: Assignment) {
    if (confirm(`Cancel assignment #${a.id}?`)) {
      this.svc.delete(a.id).subscribe(() => this.load());
    }
  }

  statusLabel(s: string): string {
    return ({ 'IN_PROGRESS': 'In progress', 'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled' } as Record<string, string>)[s] || s;
  }
}
