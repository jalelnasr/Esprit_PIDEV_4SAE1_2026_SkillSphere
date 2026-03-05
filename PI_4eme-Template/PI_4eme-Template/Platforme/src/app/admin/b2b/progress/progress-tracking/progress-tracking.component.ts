import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bAssignmentService } from '../../services/assignment.service';
import { B2bEmployeeService } from '../../services/employee.service';
import { Assignment, Employee } from '../../models/b2b.models';

@Component({
  selector: 'app-progress-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>📊 Progress Tracking</h1>
        <p class="subtitle">Overview of employee progress</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#dbeafe,#bfdbfe)">📋</div>
          <div class="stat-info"><span class="stat-val">{{ assignments.length }}</span><span class="stat-lbl">Total assignments</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#dcfce7,#bbf7d0)">✅</div>
          <div class="stat-info"><span class="stat-val">{{ completedCount }}</span><span class="stat-lbl">Completed</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#fef3c7,#fde68a)">⏳</div>
          <div class="stat-info"><span class="stat-val">{{ inProgressCount }}</span><span class="stat-lbl">In progress</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#fce7f3,#fbcfe8)">📈</div>
          <div class="stat-info"><span class="stat-val">{{ avgProgress }}%</span><span class="stat-lbl">Avg. progress</span></div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search...">
        </div>
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="filter-select">
          <option value="">All</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()" class="filter-select">
          <option value="progress-asc">Progress ↑</option>
          <option value="progress-desc">Progress ↓</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>

      <!-- Progress Cards -->
      <div class="progress-list">
        <div *ngFor="let a of filtered" class="progress-card">
          <div class="pc-header">
            <div>
              <strong>{{ a.courseName }}</strong>
              <span class="pc-label">Employee #{{ a.employeeId }}</span>
            </div>
            <span class="badge" [ngClass]="a.status.toLowerCase()">{{ statusLabel(a.status) }}</span>
          </div>
          <div class="pc-bar-container">
            <div class="pc-bar">
              <div class="pc-fill" [style.width.%]="a.progressPercent"
                   [class.low]="a.progressPercent < 30"
                   [class.mid]="a.progressPercent >= 30 && a.progressPercent < 70"
                   [class.high]="a.progressPercent >= 70">
              </div>
            </div>
            <span class="pc-pct">{{ a.progressPercent }}%</span>
          </div>
          <div class="pc-meta">
            <span>📅 Deadline: {{ a.deadline | date:'dd/MM/yyyy' }}</span>
            <span *ngIf="isOverdue(a)" class="overdue-tag">⚠️ Overdue</span>
          </div>
        </div>
        <p *ngIf="filtered.length === 0" class="empty">No assignment found</p>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 14px; padding: 18px; border-radius: 14px; background: var(--card-bg, #fff); border: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .stat-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-val { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); }
    :root.dark-mode .stat-val { color: #f1f5f9; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 200px; position: relative; }
    .si { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; padding: 10px 10px 10px 38px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select { padding: 10px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .progress-list { display: flex; flex-direction: column; gap: 12px; }
    .progress-card { background: var(--card-bg, #fff); border-radius: 14px; padding: 18px 20px; border: 1px solid rgba(0,0,0,0.06); transition: box-shadow 0.2s; }
    :root.dark-mode .progress-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .progress-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .pc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .pc-header strong { font-size: 15px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .pc-header strong { color: #f1f5f9; }
    .pc-label { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.in_progress { background: #dbeafe; color: #2563eb; }
    .badge.completed { background: #dcfce7; color: #16a34a; }
    .badge.cancelled { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge.in_progress { background: rgba(37,99,235,0.2); }
    :root.dark-mode .badge.completed { background: rgba(22,163,106,0.2); }
    :root.dark-mode .badge.cancelled { background: rgba(220,38,38,0.2); }

    .pc-bar-container { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .pc-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    :root.dark-mode .pc-bar { background: #334155; }
    .pc-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }
    .pc-fill.low { background: linear-gradient(90deg, #ef4444, #f97316); }
    .pc-fill.mid { background: linear-gradient(90deg, #f59e0b, #eab308); }
    .pc-fill.high { background: linear-gradient(90deg, #22c55e, #10b981); }
    .pc-pct { font-size: 14px; font-weight: 700; color: var(--text-primary, #0f172a); min-width: 40px; text-align: right; }
    :root.dark-mode .pc-pct { color: #f1f5f9; }

    .pc-meta { display: flex; gap: 16px; font-size: 12px; color: #64748b; }
    .overdue-tag { color: #dc2626; font-weight: 600; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; }
  `]
})
export class ProgressTrackingComponent implements OnInit {
  assignments: Assignment[] = [];
  filtered: Assignment[] = [];
  searchTerm = '';
  filterStatus = '';
  sortBy = 'progress-asc';

  get completedCount() { return this.assignments.filter(a => a.status === 'COMPLETED').length; }
  get inProgressCount() { return this.assignments.filter(a => a.status === 'IN_PROGRESS').length; }
  get avgProgress() {
    if (!this.assignments.length) return 0;
    return Math.round(this.assignments.reduce((s, a) => s + a.progressPercent, 0) / this.assignments.length);
  }

  constructor(private assignmentSvc: B2bAssignmentService) {}

  ngOnInit() {
    this.assignmentSvc.getAll().subscribe(d => {
      this.assignments = d || [];
      this.applyFilters();
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    let result = this.assignments.filter(a => {
      const ms = !term || a.courseName?.toLowerCase().includes(term);
      const mf = !this.filterStatus || a.status === this.filterStatus;
      return ms && mf;
    });
    if (this.sortBy === 'progress-asc') result.sort((a, b) => a.progressPercent - b.progressPercent);
    else if (this.sortBy === 'progress-desc') result.sort((a, b) => b.progressPercent - a.progressPercent);
    else if (this.sortBy === 'deadline') result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    this.filtered = result;
  }

  isOverdue(a: Assignment): boolean {
    return a.status === 'IN_PROGRESS' && new Date(a.deadline) < new Date();
  }

  statusLabel(s: string): string {
    return ({ 'IN_PROGRESS': 'In progress', 'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled' } as Record<string, string>)[s] || s;
  }
}
