import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bMissionService } from '../../../../admin/b2b/services/mission.service';
import { Mission } from '../../../../admin/b2b/models/b2b.models';

@Component({
  selector: 'app-freelance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="freelance-page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-badge">🚀 Freelance</div>
        <h1>Find your next <span class="grad-text">mission</span></h1>
        <p>Discover available missions and put your skills at the service of our partner companies</p>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading missions...</p>
      </div>

      <div *ngIf="!loading">
      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search for a mission, a skill...">
        </div>
        <select [(ngModel)]="skillFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All skills</option>
          <option *ngFor="let s of allSkills" [value]="s">{{ s }}</option>
        </select>
      </div>

      <p class="results-count">{{ filtered.length }} mission(s) available</p>

      <!-- Mission Cards -->
      <div class="missions-grid">
        <div *ngFor="let m of filtered" class="mission-card">
          <div class="mission-header">
            <div class="mission-icon">🎯</div>
            <div>
              <h3>{{ m.title }}</h3>
              <p class="company-name">🏢 {{ m.companyName }}</p>
            </div>
          </div>

          <p class="mission-desc">{{ m.description | slice:0:150 }}{{ (m.description?.length || 0) > 150 ? '...' : '' }}</p>

          <div class="mission-meta">
            <span *ngIf="m.budget" class="meta-item">💰 {{ m.budget | number:'1.0-0' }} TND</span>
            <span *ngIf="m.duration" class="meta-item">⏱ {{ m.duration }}</span>
            <span class="meta-item">� {{ m.status }}</span>
          </div>

          <div class="mission-skills" *ngIf="m.requiredSkills?.length">
            <span *ngFor="let s of m.requiredSkills?.slice(0,3)" class="skill">{{ s }}</span>
            <span *ngIf="(m.requiredSkills?.length || 0) > 3" class="skill more">+{{ m.requiredSkills!.length - 3 }}</span>
          </div>

          <a [routerLink]="['/freelance', m.id]" class="view-btn">View mission →</a>
        </div>
      </div>

      <div *ngIf="filtered.length === 0" class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>No missions match your criteria</p>
      </div>
      </div>
    </div>
  `,
  styles: [`
    .freelance-page { max-width: 1000px; margin: 0 auto; padding: 0 16px; }

    .hero { text-align: center; padding: 40px 20px 24px; }
    .hero-badge {
      display: inline-block; padding: 6px 16px; border-radius: 20px;
      background: rgba(245,158,11,0.1); color: #d97706; font-size: 13px;
      font-weight: 600; margin-bottom: 16px;
    }
    :root.dark-mode .hero-badge { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .hero h1 { font-size: 36px; font-weight: 900; color: var(--text-primary, #0f172a); margin: 0 0 12px; }
    :root.dark-mode .hero h1 { color: #f1f5f9; }
    .grad-text { background: linear-gradient(135deg, #f59e0b, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 16px; color: #64748b; max-width: 520px; margin: 0 auto; }

    .loading-state { text-align: center; padding: 60px 20px; color: #64748b; }
    .spinner {
      width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #f59e0b;
      border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 260px; position: relative; }
    .si { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; }
    .search-box input {
      width: 100%; padding: 12px 12px 12px 42px; border-radius: 12px; font-size: 15px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
    }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select {
      padding: 12px 16px; border-radius: 12px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
    }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .results-count { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }

    .missions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; margin-bottom: 40px; }
    .mission-card {
      background: var(--card-bg, #fff); border-radius: 18px; padding: 24px;
      border: 1.5px solid rgba(0,0,0,0.06); transition: all 0.2s;
      display: flex; flex-direction: column;
    }
    .mission-card:hover { border-color: #6366f1; box-shadow: 0 6px 20px rgba(99,102,241,0.08); transform: translateY(-2px); }
    :root.dark-mode .mission-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }

    .mission-header { display: flex; gap: 12px; margin-bottom: 12px; }
    .mission-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .mission-header h3 { font-size: 16px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .mission-header h3 { color: #f1f5f9; }
    .company-name { font-size: 13px; color: #64748b; margin: 0; }

    .mission-desc { font-size: 14px; color: #64748b; line-height: 1.5; flex: 1; margin-bottom: 12px; }

    .mission-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
    .meta-item { font-size: 12px; color: #64748b; }

    .mission-skills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
    .skill { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #d97706; }
    :root.dark-mode .skill { background: rgba(217,119,6,0.15); }
    .skill.more { background: #f1f5f9; color: #64748b; }
    :root.dark-mode .skill.more { background: #334155; }

    .view-btn {
      display: inline-block; padding: 10px 0; color: #6366f1; font-weight: 600;
      font-size: 14px; text-decoration: none; transition: color 0.2s;
    }
    .view-btn:hover { color: #4f46e5; }

    .empty-state { text-align: center; padding: 60px; color: #94a3b8; }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
    .empty-state p { font-size: 16px; margin: 0; }
  `]
})
export class FreelanceComponent implements OnInit {
  missions: Mission[] = [];
  filtered: Mission[] = [];
  allSkills: string[] = [];
  search = '';
  skillFilter = '';
  loading = true;

  constructor(private missionSvc: B2bMissionService) {}

  ngOnInit() {
    this.missionSvc.getOpen().subscribe({
      next: data => {
        this.missions = data || [];
        const skillSet = new Set<string>();
        this.missions.forEach(m => m.requiredSkills?.forEach(s => skillSet.add(s)));
        this.allSkills = [...skillSet].sort();
        this.filter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.missions.filter(m => {
      const ms = !t || m.title.toLowerCase().includes(t) || m.companyName?.toLowerCase().includes(t)
        || m.requiredSkills?.some(s => s.toLowerCase().includes(t));
      const mk = !this.skillFilter || m.requiredSkills?.includes(this.skillFilter);
      return ms && mk;
    });
  }
}
