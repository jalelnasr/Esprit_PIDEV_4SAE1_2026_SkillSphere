import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivityLogService, ActivityEntry } from '../services/activity-log.service';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="activity-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>📋 Activity Log</h1>
          <p class="subtitle">Track all actions performed on the platform</p>
        </div>
        <div class="header-actions">
          <span class="entry-count">{{ filteredActivities.length }} entries</span>
          <button class="btn-clear" (click)="clearAll()" *ngIf="activities.length > 0">
            🗑️ Clear All
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
                 placeholder="Search by user, description..." class="search-input" />
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterAction" (change)="applyFilters()" class="filter-select">
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="IMPORT">Import</option>
            <option value="ASSIGN">Assign</option>
            <option value="STATUS_CHANGE">Status Change</option>
            <option value="LOGIN">Login</option>
            <option value="EXPORT">Export</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterEntity" (change)="applyFilters()" class="filter-select">
            <option value="">All Entities</option>
            <option value="Company">Company</option>
            <option value="Employee">Employee</option>
            <option value="Assignment">Assignment</option>
            <option value="JobOffer">Job Offer</option>
            <option value="Application">Application</option>
            <option value="Mission">Mission</option>
            <option value="Contract">Contract</option>
            <option value="Session">Session</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterSeverity" (change)="applyFilters()" class="filter-select">
            <option value="">All Levels</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
        </div>
      </div>

      <!-- Timeline -->
      <div class="timeline" *ngIf="filteredActivities.length > 0">
        <div class="timeline-item" *ngFor="let activity of paginatedActivities"
             [class]="'severity-' + activity.severity">
          <div class="timeline-line"></div>
          <div class="timeline-dot" [class]="'dot-' + activity.severity">
            {{ activity.icon }}
          </div>
          <div class="timeline-card">
            <div class="card-header">
              <div class="card-meta">
                <span class="action-badge" [class]="'badge-' + activity.action.toLowerCase()">
                  {{ actionLabel(activity.action) }}
                </span>
                <span class="entity-tag">{{ activity.entity }}</span>
                <span class="entity-id" *ngIf="activity.entityId">#{{ activity.entityId }}</span>
              </div>
              <span class="card-time" [title]="activity.timestamp | date:'medium'">
                {{ timeAgo(activity.timestamp) }}
              </span>
            </div>
            <p class="card-description">{{ activity.description }}</p>
            <div class="card-footer">
              <span class="card-user">
                <span class="user-avatar">{{ activity.user.charAt(0).toUpperCase() }}</span>
                {{ activity.user }}
              </span>
              <span class="card-role">{{ roleLabel(activity.userRole) }}</span>
            </div>
            <div class="card-details" *ngIf="activity.details">
              <details>
                <summary>Details</summary>
                <pre>{{ activity.details }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="filteredActivities.length === 0">
        <span class="empty-icon">📭</span>
        <h3>No activity recorded yet</h3>
        <p>All actions you perform on the platform (create, edit, delete, import, assign) will automatically appear here in real-time.</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="filteredActivities.length > pageSize">
        <button (click)="page = page - 1" [disabled]="page === 0" class="page-btn">← Previous</button>
        <span class="page-info">Page {{ page + 1 }} of {{ totalPages }}</span>
        <button (click)="page = page + 1" [disabled]="page >= totalPages - 1" class="page-btn">Next →</button>
      </div>
    </div>
  `,
  styles: [`
    .activity-page { padding: 24px; max-width: none; margin: 0; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
    }
    .page-header h1 { font-size: 24px; font-weight: 700; margin: 0; color: var(--text-primary, #1e293b); }
    .subtitle { color: var(--text-secondary, #64748b); margin-top: 4px; font-size: 14px; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .entry-count {
      font-size: 13px; color: var(--text-secondary, #64748b);
      background: var(--bg-muted, #f1f5f9); padding: 6px 12px; border-radius: 20px;
    }
    .btn-clear {
      padding: 8px 16px; border-radius: 8px; border: 1px solid #fecaca;
      background: #fef2f2; color: #dc2626; font-size: 13px; cursor: pointer;
    }
    .btn-clear:hover { background: #fee2e2; }

    /* Filters */
    .filters-bar {
      display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .search-input {
      padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-primary, #1e293b);
      font-size: 14px; min-width: 220px;
    }
    .filter-select {
      padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-primary, #1e293b);
      font-size: 13px; cursor: pointer;
    }

    /* Timeline */
    .timeline { position: relative; }
    .timeline-item {
      display: flex; gap: 16px; position: relative; padding-bottom: 20px;
    }
    .timeline-line {
      position: absolute; left: 19px; top: 40px; bottom: 0;
      width: 2px; background: var(--border, #e2e8f0);
    }
    .timeline-item:last-child .timeline-line { display: none; }

    .timeline-dot {
      width: 40px; height: 40px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 18px;
      flex-shrink: 0; z-index: 1;
      background: var(--bg-card, #fff); border: 2px solid var(--border, #e2e8f0);
    }
    .dot-success { border-color: #22c55e; background: #f0fdf4; }
    .dot-info { border-color: #6366f1; background: #eef2ff; }
    .dot-warning { border-color: #f59e0b; background: #fffbeb; }
    .dot-danger { border-color: #ef4444; background: #fef2f2; }

    .timeline-card {
      flex: 1; background: var(--bg-card, #fff); border-radius: 12px;
      padding: 16px 20px; border: 1px solid var(--border, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: box-shadow 0.2s;
    }
    .timeline-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
    .card-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .action-badge {
      padding: 3px 10px; border-radius: 20px; font-size: 11px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge-create { background: #dcfce7; color: #16a34a; }
    .badge-update { background: #eef2ff; color: #6366f1; }
    .badge-delete { background: #fef2f2; color: #dc2626; }
    .badge-import { background: #e0f2fe; color: #0284c7; }
    .badge-assign { background: #f3e8ff; color: #9333ea; }
    .badge-status_change { background: #fef3c7; color: #d97706; }
    .badge-login { background: #f1f5f9; color: #475569; }
    .badge-export { background: #ecfdf5; color: #059669; }

    .entity-tag {
      font-size: 12px; color: var(--text-secondary, #64748b);
      background: var(--bg-muted, #f1f5f9); padding: 2px 8px; border-radius: 4px;
    }
    .entity-id { font-size: 12px; color: var(--text-secondary, #94a3b8); font-weight: 600; }
    .card-time { font-size: 12px; color: var(--text-secondary, #94a3b8); white-space: nowrap; }
    .card-description { font-size: 14px; color: var(--text-primary, #1e293b); margin: 0 0 10px; line-height: 1.5; }

    .card-footer { display: flex; align-items: center; gap: 12px; }
    .card-user { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary, #64748b); }
    .user-avatar {
      width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
    }
    .card-role {
      font-size: 11px; padding: 2px 8px; border-radius: 4px;
      background: var(--bg-muted, #f1f5f9); color: var(--text-secondary, #64748b);
    }

    .card-details { margin-top: 10px; }
    .card-details summary {
      font-size: 12px; color: #6366f1; cursor: pointer; font-weight: 600;
    }
    .card-details pre {
      font-size: 12px; background: var(--bg-muted, #f8fafc); padding: 10px;
      border-radius: 6px; overflow-x: auto; margin-top: 6px;
      color: var(--text-primary, #1e293b);
    }

    /* Empty */
    .empty-state {
      text-align: center; padding: 60px 20px;
      background: var(--bg-card, #fff); border-radius: 12px;
      border: 1px solid var(--border, #e2e8f0);
    }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    .empty-state h3 { margin: 0 0 8px; color: var(--text-primary, #1e293b); }
    .empty-state p { color: var(--text-secondary, #64748b); margin: 0 0 20px; }
    .btn-seed {
      padding: 10px 20px; border-radius: 8px; border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-primary, #1e293b);
      font-size: 14px; cursor: pointer;
    }
    .btn-seed:hover { background: var(--bg-muted, #f1f5f9); }

    /* Pagination */
    .pagination {
      display: flex; justify-content: center; align-items: center; gap: 16px;
      margin-top: 24px;
    }
    .page-btn {
      padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-primary, #1e293b);
      font-size: 13px; cursor: pointer;
    }
    .page-btn:hover:not(:disabled) { background: var(--bg-muted, #f1f5f9); }
    .page-btn:disabled { opacity: 0.4; cursor: default; }
    .page-info { font-size: 13px; color: var(--text-secondary, #64748b); }

    @media (max-width: 600px) {
      .activity-page { padding: 16px; }
      .filters-bar { flex-direction: column; }
      .search-input { min-width: 100%; }
    }
  `]
})
export class ActivityLogComponent implements OnInit, OnDestroy {
  activities: ActivityEntry[] = [];
  filteredActivities: ActivityEntry[] = [];
  searchQuery = '';
  filterAction = '';
  filterEntity = '';
  filterSeverity = '';
  page = 0;
  pageSize = 20;
  private sub?: Subscription;

  constructor(private activityLog: ActivityLogService) {}

  ngOnInit() {
    this.sub = this.activityLog.getActivities().subscribe(list => {
      this.activities = list;
      this.applyFilters();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredActivities.length / this.pageSize);
  }

  get paginatedActivities(): ActivityEntry[] {
    const start = this.page * this.pageSize;
    return this.filteredActivities.slice(start, start + this.pageSize);
  }

  applyFilters() {
    let result = [...this.activities];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a =>
        a.description.toLowerCase().includes(q) ||
        a.user.toLowerCase().includes(q) ||
        a.entity.toLowerCase().includes(q)
      );
    }
    if (this.filterAction) {
      result = result.filter(a => a.action === this.filterAction);
    }
    if (this.filterEntity) {
      result = result.filter(a => a.entity === this.filterEntity);
    }
    if (this.filterSeverity) {
      result = result.filter(a => a.severity === this.filterSeverity);
    }

    this.filteredActivities = result;
    this.page = 0;
  }

  timeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  actionLabel(action: string): string {
    const labels: Record<string, string> = {
      'CREATE': 'Create', 'UPDATE': 'Update', 'DELETE': 'Delete',
      'IMPORT': 'Import', 'ASSIGN': 'Assign', 'LOGIN': 'Login',
      'EXPORT': 'Export', 'STATUS_CHANGE': 'Status'
    };
    return labels[action] || action;
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Admin', 'RH_ENTREPRISE': 'HR Manager',
      'MANAGER': 'Manager', 'APPRENANT': 'Learner'
    };
    return labels[role] || role;
  }

  clearAll() {
    if (confirm('Clear all activity logs?')) {
      this.activityLog.clear();
    }
  }
}
