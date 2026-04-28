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
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-bg">
          <div class="hero-shape shape-1"></div>
          <div class="hero-shape shape-2"></div>
          <div class="hero-shape shape-3"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
            Career Hub
          </div>
          <h1>Find your next<br><span class="grad-text">dream opportunity</span></h1>
          <p class="hero-sub">Explore open positions from top companies.<br>Your next career move starts here.</p>

          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-num">{{ jobs.length }}</span>
              <span class="stat-label">Open positions</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ companyCount }}</span>
              <span class="stat-label">Companies</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ locations.length }}</span>
              <span class="stat-label">Locations</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading opportunities...</p>
      </div>

      <div *ngIf="!loading" class="main-content">

        <!-- Search & Filters -->
        <div class="filters-section">
          <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search by job title, skill, or company...">
            <span class="search-shortcut" *ngIf="!search">⌘K</span>
          </div>

          <div class="filter-row">
            <!-- Contract pills -->
            <div class="filter-pills">
              <button class="pill" [class.active]="contractFilter === ''" (click)="contractFilter=''; filter()">
                All types
              </button>
              <button class="pill" [class.active]="contractFilter === 'CDI'" (click)="contractFilter='CDI'; filter()">
                CDI
              </button>
              <button class="pill" [class.active]="contractFilter === 'CDD'" (click)="contractFilter='CDD'; filter()">
                CDD
              </button>
              <button class="pill" [class.active]="contractFilter === 'Stage'" (click)="contractFilter='Stage'; filter()">
                Internship
              </button>
              <button class="pill" [class.active]="contractFilter === 'Alternance'" (click)="contractFilter='Alternance'; filter()">
                Apprenticeship
              </button>
              <button class="pill" [class.active]="contractFilter === 'Freelance'" (click)="contractFilter='Freelance'; filter()">
                Freelance
              </button>
            </div>

            <!-- Location -->
            <div class="location-select-wrap">
              <svg class="loc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <select [(ngModel)]="locationFilter" (ngModelChange)="filter()" class="location-select">
                <option value="">All locations</option>
                <option *ngFor="let l of locations" [value]="l">{{ l }}</option>
              </select>
            </div>
          </div>

          <div class="results-bar">
            <span class="results-count">
              <span class="results-num">{{ filtered.length }}</span>
              position{{ filtered.length !== 1 ? 's' : '' }} found
            </span>
            <span class="results-clear" *ngIf="search || contractFilter || locationFilter" (click)="clearFilters()">
              Clear filters ✕
            </span>
          </div>
        </div>

        <!-- Job Cards -->
        <div class="jobs-list">
          <a *ngFor="let j of paginatedJobs; let i = index"
             [routerLink]="['/careers', j.id]"
             class="job-card"
             [style.animation-delay]="(i * 50) + 'ms'">

            <!-- Status indicator -->
            <div class="card-status-bar" [ngClass]="'bar-' + (j.contractType || 'CDI').toLowerCase()"></div>

            <div class="card-inner">
              <!-- Left: Avatar + Info -->
              <div class="card-left">
                <div class="company-avatar" [style.background]="getAvatarGradient(j.companyName)">
                  {{ j.companyName.charAt(0).toUpperCase() || '?' }}
                </div>

                <div class="card-info">
                  <div class="card-header-row">
                    <h3 class="job-title">{{ j.title }}</h3>
                    <span class="contract-badge" [ngClass]="'badge-' + (j.contractType || 'CDI').toLowerCase()">
                      {{ j.contractType }}
                    </span>
                  </div>

                  <div class="company-row">
                    <span class="company-name">{{ j.companyName }}</span>
                    <span class="separator-dot">·</span>
                    <span class="location-text">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ j.location }}
                    </span>
                    <span class="separator-dot">·</span>
                    <span class="date-text">{{ j.postedAt | date:'dd MMM yyyy' }}</span>
                  </div>

                  <!-- Skills -->
                  <div class="skills-row" *ngIf="parseSkills(j.requiredSkills).length">
                    <span *ngFor="let s of parseSkills(j.requiredSkills).slice(0,5)" class="skill-chip">{{ s }}</span>
                    <span *ngIf="parseSkills(j.requiredSkills).length > 5" class="skill-more">+{{ parseSkills(j.requiredSkills).length - 5 }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: CTA -->
              <div class="card-right">
                <div class="cta-btn">
                  <span>View details</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
            </div>
          </a>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <ng-container *ngFor="let p of visiblePages">
            <button class="page-btn" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
          </ng-container>
          <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Empty state -->
        <div *ngIf="filtered.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3>No positions found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button class="btn-reset" (click)="clearFilters()">Reset filters</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ============ PAGE ============ */
    .careers-page { max-width: 960px; margin: 0 auto; padding: 0 20px 60px; }

    /* ============ HERO ============ */
    .hero {
      position: relative; text-align: center; padding: 56px 24px 44px;
      margin: -20px -20px 0; overflow: hidden;
      background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #faf5ff 100%);
      border-bottom: 1px solid rgba(99,102,241,0.08);
    }
    :root.dark-mode .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e1338 100%);
      border-bottom-color: rgba(99,102,241,0.15);
    }

    .hero-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
    .hero-shape {
      position: absolute; border-radius: 50%; opacity: 0.12;
      animation: float 20s ease-in-out infinite;
    }
    .shape-1 { width: 300px; height: 300px; top: -100px; right: -80px; background: #6366f1; animation-delay: 0s; }
    .shape-2 { width: 200px; height: 200px; bottom: -60px; left: -40px; background: #8b5cf6; animation-delay: -7s; }
    .shape-3 { width: 150px; height: 150px; top: 20px; left: 30%; background: #ec4899; animation-delay: -14s; }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }
    :root.dark-mode .hero-shape { opacity: 0.08; }

    .hero-content { position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 18px; border-radius: 50px;
      background: rgba(99,102,241,0.1); color: #6366f1;
      font-size: 13px; font-weight: 700; margin-bottom: 20px;
      border: 1px solid rgba(99,102,241,0.15);
      letter-spacing: 0.3px; text-transform: uppercase;
    }
    :root.dark-mode .hero-badge { background: rgba(99,102,241,0.2); color: #a5b4fc; border-color: rgba(99,102,241,0.25); }

    .hero h1 { font-size: 42px; font-weight: 900; color: var(--text-primary, #0f172a); margin: 0 0 16px; line-height: 1.15; letter-spacing: -1px; }
    :root.dark-mode .hero h1 { color: #f1f5f9; }
    .grad-text {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero-sub { font-size: 17px; color: #64748b; max-width: 440px; margin: 0 auto; line-height: 1.6; }
    :root.dark-mode .hero-sub { color: #94a3b8; }

    /* Hero stats */
    .hero-stats {
      display: inline-flex; align-items: center; gap: 0;
      margin-top: 32px; padding: 16px 32px; border-radius: 16px;
      background: var(--card-bg, #fff); border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    :root.dark-mode .hero-stats { background: #1e293b; border-color: rgba(255,255,255,0.06); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .stat-item { display: flex; flex-direction: column; align-items: center; padding: 0 24px; }
    .stat-num { font-size: 24px; font-weight: 800; color: #6366f1; }
    .stat-label { font-size: 12px; color: #94a3b8; font-weight: 500; margin-top: 2px; }
    .stat-divider { width: 1px; height: 36px; background: #e2e8f0; }
    :root.dark-mode .stat-divider { background: #334155; }

    /* ============ LOADING ============ */
    .loading-state { text-align: center; padding: 80px 20px; color: #64748b; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ============ MAIN CONTENT ============ */
    .main-content { margin-top: 32px; }

    /* ============ FILTERS ============ */
    .filters-section { margin-bottom: 28px; }
    .search-box {
      position: relative; margin-bottom: 16px;
    }
    .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-box input {
      width: 100%; padding: 16px 16px 16px 50px; border-radius: 16px; font-size: 15px;
      border: 2px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
      transition: all 0.3s; box-sizing: border-box;
    }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
    .search-box input::placeholder { color: #94a3b8; }
    .search-shortcut {
      position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
      padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
      background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0;
    }
    :root.dark-mode .search-shortcut { background: #334155; border-color: #475569; color: #64748b; }

    .filter-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .filter-pills { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
    .pill {
      padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 600;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: #64748b;
      cursor: pointer; transition: all 0.25s; white-space: nowrap;
    }
    :root.dark-mode .pill { background: #1e293b; border-color: #334155; color: #94a3b8; }
    .pill:hover { border-color: #6366f1; color: #6366f1; }
    .pill.active {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-color: transparent;
      box-shadow: 0 3px 10px rgba(99,102,241,0.3);
    }

    .location-select-wrap { position: relative; }
    .loc-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; z-index: 1; }
    .location-select {
      padding: 10px 16px 10px 36px; border-radius: 12px; font-size: 13px; font-weight: 600;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
      cursor: pointer; appearance: auto;
    }
    :root.dark-mode .location-select { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .location-select:focus { outline: none; border-color: #6366f1; }

    .results-bar { display: flex; justify-content: space-between; align-items: center; }
    .results-count { font-size: 14px; color: #94a3b8; font-weight: 500; }
    .results-num { font-weight: 800; color: #6366f1; font-size: 16px; }
    .results-clear { font-size: 13px; color: #6366f1; font-weight: 600; cursor: pointer; transition: color 0.2s; }
    .results-clear:hover { color: #4f46e5; }

    /* ============ JOB LIST ============ */
    .jobs-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }

    @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .job-card {
      display: block; text-decoration: none; position: relative; overflow: hidden;
      background: var(--card-bg, #fff); border-radius: 18px;
      border: 1.5px solid rgba(0,0,0,0.05);
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: slideIn 0.35s ease-out both;
    }
    :root.dark-mode .job-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .job-card:hover {
      border-color: rgba(99,102,241,0.25);
      box-shadow: 0 8px 30px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.04);
      transform: translateY(-2px);
    }
    :root.dark-mode .job-card:hover { box-shadow: 0 8px 30px rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.35); }

    .card-status-bar { height: 3px; width: 100%; }
    .bar-cdi { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
    .bar-cdd { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .bar-stage { background: linear-gradient(90deg, #22c55e, #4ade80); }
    .bar-alternance { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .bar-freelance { background: linear-gradient(90deg, #ec4899, #f472b6); }

    .card-inner { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }

    .card-left { display: flex; gap: 18px; flex: 1; min-width: 0; }
    .company-avatar {
      width: 50px; height: 50px; border-radius: 14px; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card-info { flex: 1; min-width: 0; }
    .card-header-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
    .job-title {
      font-size: 17px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    :root.dark-mode .job-title { color: #f1f5f9; }
    .contract-badge {
      padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.3px; flex-shrink: 0;
    }
    .badge-cdi { background: rgba(99,102,241,0.1); color: #6366f1; }
    .badge-cdd { background: rgba(245,158,11,0.1); color: #d97706; }
    .badge-stage { background: rgba(34,197,94,0.1); color: #16a34a; }
    .badge-alternance { background: rgba(59,130,246,0.1); color: #2563eb; }
    .badge-freelance { background: rgba(236,72,153,0.1); color: #db2777; }
    :root.dark-mode .badge-cdi { background: rgba(99,102,241,0.2); color: #a5b4fc; }
    :root.dark-mode .badge-cdd { background: rgba(245,158,11,0.15); color: #fbbf24; }
    :root.dark-mode .badge-stage { background: rgba(34,197,94,0.15); color: #4ade80; }
    :root.dark-mode .badge-alternance { background: rgba(59,130,246,0.15); color: #60a5fa; }
    :root.dark-mode .badge-freelance { background: rgba(236,72,153,0.15); color: #f472b6; }

    .company-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; margin-bottom: 10px; flex-wrap: wrap; }
    :root.dark-mode .company-row { color: #94a3b8; }
    .company-name { font-weight: 600; }
    .separator-dot { color: #cbd5e1; }
    :root.dark-mode .separator-dot { color: #475569; }
    .location-text, .date-text { display: inline-flex; align-items: center; gap: 4px; }
    .location-text svg { color: #94a3b8; }

    .skills-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .skill-chip {
      padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600;
      background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06));
      color: #6366f1; border: 1px solid rgba(99,102,241,0.1);
      transition: all 0.2s;
    }
    :root.dark-mode .skill-chip { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.2); color: #a5b4fc; }
    .job-card:hover .skill-chip { border-color: rgba(99,102,241,0.25); background: rgba(99,102,241,0.1); }
    .skill-more {
      padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
      background: #f1f5f9; color: #64748b;
    }
    :root.dark-mode .skill-more { background: #334155; color: #94a3b8; }

    /* CTA */
    .card-right { flex-shrink: 0; margin-left: 20px; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600;
      color: #6366f1; background: rgba(99,102,241,0.06);
      transition: all 0.3s;
    }
    :root.dark-mode .cta-btn { background: rgba(99,102,241,0.12); color: #a5b4fc; }
    .cta-btn svg { transition: transform 0.3s; }
    .job-card:hover .cta-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    }
    .job-card:hover .cta-btn svg { transform: translateX(4px); }

    /* ============ PAGINATION ============ */
    .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; margin-bottom: 16px; }
    .page-btn {
      min-width: 42px; height: 42px; border-radius: 12px; border: 1.5px solid #e2e8f0;
      background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.25s; display: inline-flex; align-items: center; justify-content: center;
    }
    :root.dark-mode .page-btn { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .page-btn:hover:not(:disabled):not(.active) { border-color: #6366f1; color: #6366f1; }
    .page-btn.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    /* ============ EMPTY STATE ============ */
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-illustration { margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 8px; }
    :root.dark-mode .empty-state h3 { color: #f1f5f9; }
    .empty-state p { color: #94a3b8; font-size: 15px; margin: 0 0 20px; }
    .btn-reset {
      padding: 10px 24px; border-radius: 12px; font-weight: 600; font-size: 14px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none;
      cursor: pointer; transition: all 0.25s;
    }
    .btn-reset:hover { box-shadow: 0 4px 14px rgba(99,102,241,0.3); transform: translateY(-1px); }

    /* ============ RESPONSIVE ============ */
    @media (max-width: 768px) {
      .hero h1 { font-size: 30px; }
      .hero-stats { padding: 12px 20px; }
      .stat-item { padding: 0 16px; }
      .stat-num { font-size: 20px; }
      .card-inner { flex-direction: column; align-items: stretch; gap: 16px; }
      .card-right { margin-left: 0; text-align: center; }
      .filter-row { flex-direction: column; }
    }
    @media (max-width: 480px) {
      .hero h1 { font-size: 26px; }
      .card-left { flex-direction: column; align-items: flex-start; }
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

  // Pagination
  currentPage = 1;
  pageSize = 6;

  // Avatar color palette
  private gradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #3b82f6, #2dd4bf)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #22c55e, #14b8a6)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #0ea5e9, #6366f1)',
  ];

  get companyCount(): number {
    return new Set(this.jobs.map(j => j.companyName).filter(Boolean)).size;
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  get paginatedJobs(): JobOffer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

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
    this.currentPage = 1;
  }

  clearFilters() {
    this.search = '';
    this.contractFilter = '';
    this.locationFilter = '';
    this.filter();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  getAvatarGradient(name: string | undefined): string {
    if (!name) return this.gradients[0];
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return this.gradients[hash % this.gradients.length];
  }

  parseSkills(skills: any): string[] {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    return [];
  }
}
