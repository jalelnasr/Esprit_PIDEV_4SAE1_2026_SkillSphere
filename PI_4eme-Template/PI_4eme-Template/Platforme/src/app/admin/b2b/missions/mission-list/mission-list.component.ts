import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bMissionService } from '../../services/mission.service';
import { Mission } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { B2bNavService } from '../../services/b2b-nav.service';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🎯 Freelance Missions</h1>
          <p class="subtitle">{{ filtered.length }} mission(s)</p>
        </div>
        <a [routerLink]="nav.basePath + '/missions/new'" class="btn btn-primary">+ New mission</a>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search...">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div class="mission-grid">
        <div *ngFor="let m of filtered" class="mission-card">
          <div class="mc-top">
            <span class="badge" [ngClass]="m.status.toLowerCase()">{{ statusLabel(m.status) }}</span>
            <span class="mc-budget">{{ m.budget | number:'1.0-0' }} €</span>
          </div>
          <h3>{{ m.title }}</h3>
          <p class="mc-company">🏢 {{ m.companyName }}</p>
          <p class="mc-desc">{{ m.description | slice:0:100 }}{{ m.description.length > 100 ? '...' : '' }}</p>
          <div class="mc-meta">
            <span>⏱ {{ m.duration }}</span>
            <span>👤 {{ m.applicationCount }} application(s)</span>
          </div>
          <div class="mc-skills">
            <span *ngFor="let s of m.requiredSkills" class="skill-tag">{{ s }}</span>
          </div>
        </div>
      </div>
      <p *ngIf="filtered.length === 0" class="empty">No mission found</p>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; border: none; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 200px; position: relative; }
    .si { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; padding: 10px 10px 10px 38px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select { padding: 10px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .mission-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
    .mission-card { background: var(--card-bg, #fff); border-radius: 16px; padding: 22px; border: 1px solid rgba(0,0,0,0.06); transition: all 0.2s; }
    :root.dark-mode .mission-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .mission-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
    .mc-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .mc-budget { font-size: 16px; font-weight: 800; color: #16a34a; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.open { background: #dcfce7; color: #16a34a; }
    .badge.in_progress { background: #dbeafe; color: #2563eb; }
    .badge.completed { background: #ede9fe; color: #6366f1; }
    .badge.cancelled { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge.open { background: rgba(22,163,106,0.2); }
    :root.dark-mode .badge.in_progress { background: rgba(37,99,235,0.2); }
    :root.dark-mode .badge.completed { background: rgba(99,102,241,0.2); }
    :root.dark-mode .badge.cancelled { background: rgba(220,38,38,0.2); }
    .mission-card h3 { font-size: 16px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 4px; }
    :root.dark-mode .mission-card h3 { color: #f1f5f9; }
    .mc-company { font-size: 13px; color: #64748b; margin-bottom: 8px; }
    .mc-desc { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px; }
    .mc-meta { display: flex; gap: 16px; font-size: 13px; color: #64748b; margin-bottom: 12px; }
    .mc-skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #ede9fe; color: #6366f1; }
    :root.dark-mode .skill-tag { background: rgba(99,102,241,0.15); }
    .empty { text-align: center; padding: 40px; color: #94a3b8; }
  `]
})
export class MissionListComponent implements OnInit {
  missions: Mission[] = [];
  filtered: Mission[] = [];
  search = '';
  statusFilter = '';

  private userCompanyId: number | null = null;
  private userRole: string | null = null;

  get isCompanyScoped(): boolean {
    return this.userRole === 'RH_ENTREPRISE' || this.userRole === 'MANAGER';
  }

  constructor(private svc: B2bMissionService, private authSvc: AuthService, public nav: B2bNavService) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.userCompanyId = user?.companyId || null;
      this.loadMissions();
    });
  }

  loadMissions() {
    const obs = (this.isCompanyScoped && this.userCompanyId)
      ? this.svc.getByCompany(this.userCompanyId)
      : this.svc.getAll();
    obs.subscribe(d => { this.missions = d || []; this.filter(); });
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.missions.filter(m => {
      const ms = !t || m.title.toLowerCase().includes(t) || m.companyName?.toLowerCase().includes(t);
      const mf = !this.statusFilter || m.status === this.statusFilter;
      return ms && mf;
    });
  }

  statusLabel(s: string): string {
    return ({ 'OPEN': 'Open', 'IN_PROGRESS': 'In progress', 'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled' } as Record<string, string>)[s] || s;
  }
}
