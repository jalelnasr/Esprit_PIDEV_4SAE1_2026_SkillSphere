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
        <div class="header-stats">
          <div class="stat-chip stat-looking">🟢 {{ availableCount }} available</div>
          <div class="stat-chip stat-busy">🕓 {{ unavailableCount }} unavailable</div>
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
        <div *ngFor="let c of paginatedCandidates; trackBy: trackByCandidateId" class="candidate-card">
          <div class="card-top-line"></div>
          <div class="cc-header">
            <div class="cc-avatar-wrap">
              <div class="cc-avatar">{{ initials(c.title) }}</div>
            </div>
            <div class="cc-info">
              <h3>{{ c.title || 'Untitled profile' }}</h3>
              <span class="cc-exp">{{ c.experienceYears || 0 }} years of experience</span>
            </div>
            <span class="status-pill" [class.active]="c.isLookingForJob">
              {{ c.isLookingForJob ? 'Available' : 'Unavailable' }}
            </span>
          </div>

          <div class="experience-block">
            <div class="experience-label">Experience strength</div>
            <div class="experience-meter">
              <span class="experience-fill" [style.width.%]="experiencePercent(c.experienceYears)"></span>
            </div>
          </div>

          <div class="cc-skills" *ngIf="parseSkills(c.skills).length > 0; else noSkillsTpl">
            <span *ngFor="let s of visibleSkills(c.skills)" class="skill-tag">{{ s }}</span>
            <span *ngIf="hiddenSkillsCount(c.skills) > 0" class="skill-more">+{{ hiddenSkillsCount(c.skills) }}</span>
          </div>

          <ng-template #noSkillsTpl>
            <div class="no-skills">No skills provided</div>
          </ng-template>

          <div class="cc-footer">
            <a *ngIf="c.resumeUrl" [href]="c.resumeUrl" target="_blank" class="link">Open CV</a>
            <span *ngIf="!c.resumeUrl" class="link disabled">No CV</span>
            <span class="cc-id">Candidate #{{ c.id }}</span>
          </div>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" title="Previous">‹</button>
        <ng-container *ngFor="let p of visiblePages">
          <button class="page-btn" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
        </ng-container>
        <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" title="Next">›</button>
      </div>

      <p *ngIf="filtered.length === 0" class="empty">No candidate found</p>
    </div>
  `,
  styles: [`
    .page {
      max-width: 1240px;
      margin: 0 auto;
      width: 100%;
    }
    .page-header { margin-bottom: 24px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    .header-stats { display: flex; gap: 8px; flex-wrap: wrap; }
    .stat-chip { border-radius: 999px; padding: 7px 12px; font-size: 12px; font-weight: 700; }
    .stat-looking { background: #dcfce7; color: #166534; }
    .stat-busy { background: #f1f5f9; color: #475569; }
    :root.dark-mode .stat-looking { background: rgba(22,163,74,0.22); color: #86efac; }
    :root.dark-mode .stat-busy { background: rgba(100,116,139,0.25); color: #cbd5e1; }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 200px; position: relative; }
    .si { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; padding: 10px 10px 10px 38px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; }
    .filter-select { padding: 10px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .filter-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }

    .candidate-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      max-width: 1240px;
      margin: 0 auto;
      width: 100%;
    }
    .candidate-card {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 100% 0%, rgba(59,130,246,0.14), transparent 42%),
        radial-gradient(circle at 0% 100%, rgba(99,102,241,0.12), transparent 38%),
        var(--card-bg, #fff);
      border-radius: 18px;
      padding: 20px;
      border: 1px solid rgba(15,23,42,0.08);
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
      animation: cardReveal 0.35s ease both;
    }
    :root.dark-mode .candidate-card {
      background:
        radial-gradient(circle at 100% 0%, rgba(59,130,246,0.18), transparent 42%),
        radial-gradient(circle at 0% 100%, rgba(99,102,241,0.15), transparent 38%),
        #1e293b;
      border-color: rgba(148,163,184,0.2);
    }
    .candidate-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 22px rgba(15,23,42,0.12);
      border-color: rgba(99,102,241,0.45);
    }
    .card-top-line {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #22c55e, #3b82f6, #6366f1);
      opacity: 0.85;
    }
    .cc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .cc-avatar-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      padding: 2px;
      background: linear-gradient(135deg, #22c55e, #3b82f6, #6366f1);
      flex-shrink: 0;
    }
    .cc-avatar {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      background: rgba(15,23,42,0.92);
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.4px;
    }
    .cc-info { flex: 1; }
    .cc-info h3 { font-size: 16px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .cc-info h3 { color: #f1f5f9; }
    .cc-exp { font-size: 12px; color: #64748b; font-weight: 600; }
    .status-pill {
      border-radius: 999px;
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 700;
      background: #e2e8f0;
      color: #475569;
    }
    .status-pill.active { background: #dcfce7; color: #166534; }
    :root.dark-mode .status-pill { background: rgba(148,163,184,0.25); color: #cbd5e1; }
    :root.dark-mode .status-pill.active { background: rgba(22,163,74,0.22); color: #86efac; }

    .experience-block { margin-bottom: 14px; }
    .experience-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; margin-bottom: 6px; font-weight: 700; }
    .experience-meter { width: 100%; height: 8px; border-radius: 999px; background: rgba(148,163,184,0.3); overflow: hidden; }
    .experience-fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #22c55e 0%, #3b82f6 55%, #6366f1 100%);
      transition: width 0.3s ease;
    }

    .cc-skills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }
    .skill-tag {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      background: rgba(59,130,246,0.12);
      color: #1d4ed8;
      border: 1px solid rgba(59,130,246,0.2);
    }
    .skill-more {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      background: rgba(15,23,42,0.08);
      color: #334155;
    }
    :root.dark-mode .skill-tag { background: rgba(59,130,246,0.2); color: #bfdbfe; border-color: rgba(96,165,250,0.35); }
    :root.dark-mode .skill-more { background: rgba(148,163,184,0.22); color: #cbd5e1; }
    .no-skills {
      margin-bottom: 14px;
      font-size: 12px;
      color: #64748b;
      font-style: italic;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(148,163,184,0.16);
    }
    .cc-footer { display: flex; justify-content: space-between; align-items: center; }
    .link {
      font-size: 12px;
      color: #fff;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      text-decoration: none;
      font-weight: 700;
      border-radius: 9px;
      padding: 8px 12px;
      line-height: 1;
    }
    .link:hover { filter: brightness(1.05); }
    .link.disabled {
      background: #e2e8f0;
      color: #64748b;
      pointer-events: none;
    }
    :root.dark-mode .link.disabled { background: rgba(148,163,184,0.22); color: #cbd5e1; }
    .cc-id {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(148,163,184,0.18);
    }

    @keyframes cardReveal {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .candidate-grid { grid-template-columns: 1fr; }
      .status-pill { display: none; }
      .cc-info h3 { font-size: 15px; }
    }

    @media (max-width: 1180px) {
      .candidate-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 900px) {
      .candidate-grid { grid-template-columns: 1fr; }
    }

    .pagination {
      margin-top: 24px;
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .page-btn {
      min-width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      background: var(--card-bg, #fff);
      color: #475569;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0 10px;
    }
    .page-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
    .page-btn.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-color: transparent; color: #fff; }
    .page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    :root.dark-mode .page-btn { background: #1e293b; border-color: #334155; color: #cbd5e1; }

    .empty { text-align: center; padding: 40px; color: #94a3b8; }
  `]
})
export class CandidateListComponent implements OnInit {
  candidates: Candidate[] = [];
  filtered: Candidate[] = [];
  search = '';
  statusFilter = '';
  currentPage = 1;
  readonly pageSize = 6;

  get availableCount(): number {
    return this.candidates.filter(c => c.isLookingForJob).length;
  }

  get unavailableCount(): number {
    return this.candidates.filter(c => !c.isLookingForJob).length;
  }

  constructor(private svc: B2bCandidateService) {}

  ngOnInit() {
    this.svc.getAll().subscribe(d => { this.candidates = d || []; this.filter(); });
  }

  parseSkills(skills: any): string[] {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return (skills as string).split(',').map(s => s.trim()).filter(s => s);
  }

  visibleSkills(skills: any): string[] {
    return this.parseSkills(skills).slice(0, 5);
  }

  hiddenSkillsCount(skills: any): number {
    const total = this.parseSkills(skills).length;
    return total > 5 ? total - 5 : 0;
  }

  initials(title: string | undefined): string {
    if (!title) return '?';
    const words = title.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  experiencePercent(years: number | undefined): number {
    const y = Number(years || 0);
    const clamped = Math.max(0, Math.min(y, 12));
    return Math.round((clamped / 12) * 100);
  }

  trackByCandidateId(_: number, candidate: Candidate): number {
    return candidate.id;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginatedCandidates(): Candidate[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (this.currentPage <= 3) return [1, 2, 3, 4, 5];
    if (this.currentPage >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2];
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.candidates.filter(c => {
      const parsed = this.parseSkills(c.skills);
      const ms = !t || c.title?.toLowerCase().includes(t) || parsed.some(s => s.toLowerCase().includes(t));
      const mf = !this.statusFilter || (this.statusFilter === 'looking' ? c.isLookingForJob : !c.isLookingForJob);
      return ms && mf;
    });

    this.currentPage = 1;
  }
}
