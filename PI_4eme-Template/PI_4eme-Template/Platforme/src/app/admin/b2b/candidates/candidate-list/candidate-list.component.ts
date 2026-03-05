import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bCandidateService } from '../../services/candidate.service';
import { Candidate } from '../../models/b2b.models';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>👤 Candidates</h1>
          <p class="subtitle">{{ filtered.length }} candidate(s) in database</p>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search by skill, title...">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All</option>
          <option value="looking">Looking</option>
          <option value="not-looking">Not available</option>
        </select>
      </div>

      <div class="candidate-grid">
        <div *ngFor="let c of filtered" class="candidate-card">
          <div class="cc-header">
            <div class="cc-avatar">{{ c.title?.charAt(0) || '?' }}</div>
            <div class="cc-info">
              <h3>{{ c.title }}</h3>
              <span class="cc-exp">{{ c.experienceYears }} years of experience</span>
            </div>
            <span class="status-dot" [class.active]="c.isLookingForJob" [title]="c.isLookingForJob ? 'Looking for job' : 'Not available'"></span>
          </div>
          <div class="cc-skills">
            <span *ngFor="let s of parseSkills(c.skills)" class="skill-tag">{{ s }}</span>
          </div>
          <div class="cc-footer">
            <a *ngIf="c.resumeUrl" [href]="c.resumeUrl" target="_blank" class="link">📄 CV</a>
            <span class="cc-id">#{{ c.id }}</span>
          </div>
        </div>
      </div>
      <p *ngIf="filtered.length === 0" class="empty">No candidate found</p>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 200px; position: relative; }
    .si { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; padding: 10px 10px 10px 38px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select { padding: 10px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .candidate-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
    .candidate-card { background: var(--card-bg, #fff); border-radius: 16px; padding: 20px; border: 1px solid rgba(0,0,0,0.06); transition: all 0.2s; }
    :root.dark-mode .candidate-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .candidate-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .cc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .cc-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .cc-info { flex: 1; }
    .cc-info h3 { font-size: 15px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .cc-info h3 { color: #f1f5f9; }
    .cc-exp { font-size: 12px; color: #94a3b8; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #94a3b8; }
    .status-dot.active { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
    .cc-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .skill-tag { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #ede9fe; color: #6366f1; }
    :root.dark-mode .skill-tag { background: rgba(99,102,241,0.15); }
    .cc-footer { display: flex; justify-content: space-between; align-items: center; }
    .link { font-size: 13px; color: #6366f1; text-decoration: none; font-weight: 600; }
    .link:hover { text-decoration: underline; }
    .cc-id { font-size: 12px; color: #94a3b8; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; }
  `]
})
export class CandidateListComponent implements OnInit {
  candidates: Candidate[] = [];
  filtered: Candidate[] = [];
  search = '';
  statusFilter = '';

  constructor(private svc: B2bCandidateService) {}

  ngOnInit() {
    this.svc.getAll().subscribe(d => { this.candidates = d || []; this.filter(); });
  }

  parseSkills(skills: any): string[] {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return (skills as string).split(',').map(s => s.trim()).filter(s => s);
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.candidates.filter(c => {
      const parsed = this.parseSkills(c.skills);
      const ms = !t || c.title?.toLowerCase().includes(t) || parsed.some(s => s.toLowerCase().includes(t));
      const mf = !this.statusFilter || (this.statusFilter === 'looking' ? c.isLookingForJob : !c.isLookingForJob);
      return ms && mf;
    });
  }
}
