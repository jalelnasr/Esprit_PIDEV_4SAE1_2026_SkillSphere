import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bJobOfferService } from '../../../../admin/b2b/services/job-offer.service';
import { JobOffer } from '../../../../admin/b2b/models/b2b.models';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="careers-page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-badge">💼 Careers</div>
        <h1>Find your next <span class="grad-text">opportunity</span></h1>
        <p>Browse job offers from our partner companies. Apply directly and start your career.</p>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading job offers...</p>
      </div>

      <div *ngIf="!loading">
      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search for a position, a skill...">
        </div>
        <select [(ngModel)]="contractFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All contracts</option>
          <option value="CDI">Permanent</option>
          <option value="CDD">Fixed-term</option>
          <option value="Stage">Internship</option>
          <option value="Alternance">Apprenticeship</option>
          <option value="Freelance">Freelance</option>
        </select>
        <select [(ngModel)]="locationFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All cities</option>
          <option *ngFor="let l of locations" [value]="l">{{ l }}</option>
        </select>
      </div>

      <p class="results-count">{{ filtered.length }} offer(s) found</p>

      <!-- Job Cards -->
      <div class="jobs-list">
        <div *ngFor="let j of filtered" class="job-card">
          <div class="job-left">
            <div class="company-avatar">{{ j.companyName?.charAt(0) || '?' }}</div>
            <div class="job-info">
              <h3>{{ j.title }}</h3>
              <p class="company-name">🏢 {{ j.companyName }}</p>
              <div class="job-tags">
                <span class="tag location">📍 {{ j.location }}</span>
                <span class="tag contract">📋 {{ j.contractType }}</span>
                <span class="tag date">📅 {{ j.postedAt | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="job-skills">
                <span *ngFor="let s of parseSkills(j.requiredSkills)?.slice(0,4)" class="skill">{{ s }}</span>
                <span *ngIf="(parseSkills(j.requiredSkills)?.length || 0) > 4" class="skill more">+{{ parseSkills(j.requiredSkills).length - 4 }}</span>
              </div>
            </div>
          </div>
          <div class="job-right">
            <a [routerLink]="['/careers', j.id]" class="apply-btn">View offer →</a>
          </div>
        </div>
      </div>

      <p *ngIf="filtered.length === 0" class="empty-state">
        <span class="empty-icon">🔍</span>
        No offers match your criteria
      </p>
      </div>
    </div>
  `,
  styles: [`
    .careers-page { max-width: 900px; margin: 0 auto; padding: 0 16px; }

    .hero { text-align: center; padding: 40px 20px 24px; }
    .hero-badge {
      display: inline-block; padding: 6px 16px; border-radius: 20px;
      background: rgba(59,130,246,0.1); color: #3b82f6; font-size: 13px;
      font-weight: 600; margin-bottom: 16px;
    }
    :root.dark-mode .hero-badge { background: rgba(59,130,246,0.2); color: #93c5fd; }
    .hero h1 { font-size: 36px; font-weight: 900; color: var(--text-primary, #0f172a); margin: 0 0 12px; }
    :root.dark-mode .hero h1 { color: #f1f5f9; }
    .grad-text { background: linear-gradient(135deg, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 16px; color: #64748b; max-width: 500px; margin: 0 auto; }

    .loading-state { text-align: center; padding: 60px 20px; color: #64748b; }
    .spinner {
      width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
      border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 240px; position: relative; }
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

    .jobs-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px; }
    .job-card {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--card-bg, #fff); border-radius: 16px; padding: 22px 24px;
      border: 1.5px solid rgba(0,0,0,0.06); transition: all 0.2s;
    }
    .job-card:hover { border-color: #6366f1; box-shadow: 0 6px 20px rgba(99,102,241,0.08); transform: translateY(-1px); }
    :root.dark-mode .job-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .job-left { display: flex; gap: 16px; flex: 1; }
    .company-avatar {
      width: 52px; height: 52px; border-radius: 14px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 700; flex-shrink: 0;
    }
    .job-info h3 { font-size: 17px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 4px; }
    :root.dark-mode .job-info h3 { color: #f1f5f9; }
    .company-name { font-size: 13px; color: #64748b; margin: 0 0 8px; }

    .job-tags { display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .tag { font-size: 12px; color: #64748b; }
    .job-skills { display: flex; gap: 6px; flex-wrap: wrap; }
    .skill { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #ede9fe; color: #6366f1; }
    :root.dark-mode .skill { background: rgba(99,102,241,0.15); }
    .skill.more { background: #f1f5f9; color: #64748b; }
    :root.dark-mode .skill.more { background: #334155; }

    .apply-btn {
      display: inline-block; padding: 10px 22px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap;
      transition: all 0.2s;
    }
    .apply-btn:hover { box-shadow: 0 4px 12px rgba(99,102,241,0.3); transform: translateY(-1px); }

    .empty-state { text-align: center; padding: 60px; color: #94a3b8; font-size: 16px; }
    .empty-icon { display: block; font-size: 48px; margin-bottom: 12px; }

    @media (max-width: 640px) {
      .job-card { flex-direction: column; gap: 16px; align-items: stretch; }
      .job-right { text-align: center; }
    }
  `]
})
export class CareersComponent implements OnInit {
  jobs: JobOffer[] = [];
  filtered: JobOffer[] = [];
  locations: string[] = [];
  search = '';
  contractFilter = '';
  locationFilter = '';
  loading = true;

  constructor(private jobSvc: B2bJobOfferService) {}

  ngOnInit() {
    this.jobSvc.getOpen().subscribe({
      next: data => {
        this.jobs = data || [];
        this.locations = [...new Set(this.jobs.map(j => j.location).filter(Boolean))];
        this.filter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.jobs.filter(j => {
      const skills = this.parseSkills(j.requiredSkills);
      const ms = !t || j.title.toLowerCase().includes(t) || j.companyName?.toLowerCase().includes(t)
        || skills.some(s => s.toLowerCase().includes(t));
      const mc = !this.contractFilter || j.contractType === this.contractFilter;
      const ml = !this.locationFilter || j.location === this.locationFilter;
      return ms && mc && ml;
    });
  }

  parseSkills(skills: any): string[] {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    return [];
  }
}
