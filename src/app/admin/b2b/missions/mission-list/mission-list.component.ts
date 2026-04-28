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
        <a *ngIf="canManageMissions" [routerLink]="nav.basePath + '/missions/new'" class="btn btn-primary">+ New mission</a>
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
        <div *ngFor="let m of filtered; trackBy: trackByMissionId" class="mission-card">
          <div class="mc-top">
            <span class="badge" [ngClass]="statusClass(m)">{{ statusLabel(m.status) }}</span>
            <span class="mc-budget">{{ missionBudget(m) | number:'1.0-0' }} €</span>
          </div>
          <h3>{{ missionTitle(m) }}</h3>
          <p class="mc-company">🏢 {{ missionCompany(m) }}</p>
          <p class="mc-desc">{{ missionDescriptionPreview(m) }}</p>
          <div class="mc-meta">
            <span>⏱ {{ missionDuration(m) }}</span>
            <span>👤 {{ missionApplications(m) }} application(s)</span>
          </div>
          <div class="mc-skills" *ngIf="missionSkills(m).length > 0">
            <span *ngFor="let s of missionSkills(m)" class="skill-tag">{{ s }}</span>
          </div>
          
          <!-- Applicants section for Admin/RH -->
          <div class="mc-applicants" *ngIf="canManageMissions && missionApplications(m) > 0">
            <button class="btn-applicants" [routerLink]="[nav.basePath + '/missions', m.id, 'candidates']">
              <span>👥 View {{ missionApplications(m) }} candidate(s)</span>
              <span class="arrow">→</span>
            </button>
          </div>

          <div class="card-actions" *ngIf="canManageMissions">
            <a class="btn btn-secondary" [routerLink]="nav.basePath + '/missions/' + m.id + '/edit'">Modify</a>
            <button class="btn btn-danger" type="button" (click)="deleteMission(m)">Delete</button>
          </div>
        </div>
      </div>
      <p *ngIf="filtered.length === 0" class="empty">No mission found</p>
    </div>
  `,
  styles: [`
    .page { max-width: none; }
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
    
    .mc-applicants { margin-top: 14px; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 14px; }
    :root.dark-mode .mc-applicants { border-color: rgba(255,255,255,0.06); }
    .btn-applicants { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05)); color: #6366f1; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; text-decoration: none; }
    :root.dark-mode .btn-applicants { border-color: #334155; background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); color: #a5b4fc; }
    .btn-applicants:hover { border-color: #6366f1; background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); transform: translateX(2px); }
    .arrow { font-size: 14px; font-weight: 700; }
    
    .card-actions { display: flex; gap: 8px; margin-top: 14px; }
    .btn-secondary { background: transparent; border: 1.5px solid #cbd5e1; color: #475569; }
    .btn-danger { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    :root.dark-mode .btn-secondary { border-color: #475569; color: #cbd5e1; }
    :root.dark-mode .btn-danger { background: rgba(185,28,28,0.18); color: #fca5a5; border-color: rgba(248,113,113,0.35); }
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

  get canManageMissions(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'RH_ENTREPRISE';
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
    obs.subscribe(d => {
      this.missions = d || [];
      this.filter();
    });
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.missions.filter(m => {
      const title = this.missionTitle(m).toLowerCase();
      const company = this.missionCompany(m).toLowerCase();
      const ms = !t || title.includes(t) || company.includes(t);
      const mf = !this.statusFilter || m.status === this.statusFilter;
      return ms && mf;
    });
  }

  statusLabel(s: string): string {
    return ({ 'OPEN': 'Open', 'IN_PROGRESS': 'In progress', 'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled' } as Record<string, string>)[s] || s;
  }

  missionBudget(m: Mission): number {
    return Number(m.dailyRate) || 0;
  }

  missionTitle(m: Mission): string {
    return m.title?.trim() || 'Untitled mission';
  }

  missionCompany(m: Mission): string {
    return m.companyName?.trim() || 'Unknown company';
  }

  missionDescriptionPreview(m: Mission): string {
    const desc = (m.description || '').trim();
    if (!desc) return 'No description provided yet.';
    return desc.length > 100 ? `${desc.slice(0, 100)}...` : desc;
  }

  missionDuration(m: Mission): string {
    if (!m.durationWeeks) return 'Not specified';
    if (m.durationWeeks === 1) return '1 week';
    if (m.durationWeeks < 4) return `${m.durationWeeks} weeks`;
    const months = Math.floor(m.durationWeeks / 4);
    return months === 1 ? '1 month' : `${months} months`;
  }

  missionApplications(m: Mission): number {
    return Number(m.applicationCount) || 0;
  }

  missionSkills(m: Mission): string[] {
    const skills = m.requiredSkills;
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
  }

  statusClass(m: Mission): string {
    return m.status ? m.status.toLowerCase() : 'open';
  }

  normalizeMission(m: Mission): Mission {
    return m; // Backend structure is correct
  }

  trackByMissionId(_index: number, mission: Mission): number {
    return Number((mission as any)?.id) || _index;
  }

  deleteMission(m: Mission) {
    if (!this.canManageMissions) return;
    if (!confirm(`Delete mission "${m.title}"?`)) return;
    this.svc.delete(m.id).subscribe({ next: () => this.loadMissions() });
  }
}
