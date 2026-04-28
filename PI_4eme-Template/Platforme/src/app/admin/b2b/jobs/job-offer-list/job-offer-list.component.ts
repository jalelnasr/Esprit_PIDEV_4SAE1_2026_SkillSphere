import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bJobOfferService } from '../../services/job-offer.service';
import { JobOffer } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { B2bNavService } from '../../services/b2b-nav.service';

@Component({
  selector: 'app-job-offer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <!-- Hero header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <span class="icon-glow">💼</span>
          </div>
          <div>
            <h1>Job Offers</h1>
            <p class="subtitle">
              <span class="count-badge">{{ filtered.length }}</span> offer{{ filtered.length !== 1 ? 's' : '' }} available
            </p>
          </div>
        </div>
        <a [routerLink]="nav.basePath + '/jobs/new'" class="btn btn-primary">
          <span class="btn-icon">+</span> Publish an offer
        </a>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search by title, company, location...">
        </div>
        <div class="status-pills">
          <button class="pill" [class.active]="statusFilter === ''" (click)="statusFilter=''; filter()">All</button>
          <button class="pill pill-open" [class.active]="statusFilter === 'OPEN'" (click)="statusFilter='OPEN'; filter()">
            <span class="pill-dot dot-open"></span> Open
          </button>
          <button class="pill pill-closed" [class.active]="statusFilter === 'CLOSED'" (click)="statusFilter='CLOSED'; filter()">
            <span class="pill-dot dot-closed"></span> Closed
          </button>
          <button class="pill pill-filled" [class.active]="statusFilter === 'FILLED'" (click)="statusFilter='FILLED'; filter()">
            <span class="pill-dot dot-filled"></span> Filled
          </button>
        </div>
      </div>

      <!-- Job cards grid -->
      <div class="job-grid">
        <div *ngFor="let j of paginatedJobs; let i = index" class="job-card" [style.animation-delay]="(i * 60) + 'ms'">
          <!-- Gradient accent bar -->
          <div class="card-accent" [ngClass]="'accent-' + j.status.toLowerCase()"></div>

          <div class="card-body">
            <!-- Top row: status + date + actions -->
            <div class="card-top">
              <span class="badge" [ngClass]="j.status.toLowerCase()">
                <span class="badge-dot"></span>
                {{ statusLabel(j.status) }}
              </span>
              <div class="card-actions">
                <a [routerLink]="[nav.basePath + '/jobs', j.id, 'edit']" class="action-btn action-edit" title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </a>
                <button class="action-btn action-delete" (click)="confirmDelete(j)" title="Delete">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>

            <!-- Title -->
            <h3 class="card-title">{{ j.title }}</h3>

            <!-- Company -->
            <div class="card-company">
              <div class="company-avatar">{{ j.companyName.charAt(0) || 'C' }}</div>
              <span>{{ j.companyName }}</span>
            </div>

            <!-- Meta chips -->
            <div class="card-meta">
              <span class="meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ j.location }}
              </span>
              <span class="meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                {{ j.contractType }}
              </span>
              <span class="meta-chip meta-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ j.postedAt | date:'dd MMM yyyy' }}
              </span>
            </div>

            <!-- Skills -->
            <div class="card-skills" *ngIf="parseSkills(j.requiredSkills).length">
              <span *ngFor="let s of parseSkills(j.requiredSkills).slice(0,5)" class="skill-tag">{{ s }}</span>
              <span *ngIf="parseSkills(j.requiredSkills).length > 5" class="skill-more">+{{ parseSkills(j.requiredSkills).length - 5 }}</span>
            </div>

            <!-- Footer -->
            <div class="card-footer">
              <div class="app-count">
                <div class="app-count-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <span>{{ j.applicationCount }} <small>application{{ j.applicationCount !== 1 ? 's' : '' }}</small></span>
              </div>
              <a [routerLink]="[nav.basePath + '/jobs', j.id]" class="btn-details">
                View details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
          </div>

          <!-- Delete confirmation modal -->
          <div class="modal-overlay" *ngIf="deleteTarget?.id === j.id" (click)="deleteTarget = null">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <div class="modal-icon">⚠️</div>
              <h3>Confirm deletion</h3>
              <p>Are you sure you want to delete <strong>{{ j.title }}</strong>?</p>
              <p class="modal-sub">This action cannot be undone.</p>
              <div class="modal-actions">
                <button class="btn btn-cancel" (click)="deleteTarget = null">Cancel</button>
                <button class="btn btn-danger" (click)="deleteJob(j.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="filtered.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No offers found</h3>
        <p>Try adjusting your filters or create a new job offer.</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" title="Previous">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <ng-container *ngFor="let p of visiblePages">
          <button class="page-btn" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
        </ng-container>
        <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" title="Next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* =========== PAGE LAYOUT =========== */
    .page { max-width: none; }

    /* =========== HEADER =========== */
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;
      padding: 24px 28px; border-radius: 20px;
      background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 50%, rgba(236,72,153,0.04) 100%);
      border: 1px solid rgba(99,102,241,0.12);
    }
    :root.dark-mode .page-header { background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08)); border-color: rgba(99,102,241,0.2); }
    .header-content { display: flex; align-items: center; gap: 16px; }
    .header-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(99,102,241,0.3); }
    .icon-glow { font-size: 22px; filter: brightness(1.2); }
    .page-header h1 { font-size: 26px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; letter-spacing: -0.5px; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 2px; display: flex; align-items: center; gap: 8px; }
    .count-badge {
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      font-size: 12px; font-weight: 700; min-width: 24px; height: 24px; border-radius: 8px; padding: 0 7px;
    }
    .btn { padding: 11px 22px; border-radius: 12px; font-weight: 600; font-size: 14px; text-decoration: none; border: none; cursor: pointer; transition: all 0.25s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.25); }
    .btn-primary:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.4); transform: translateY(-2px); }
    .btn-icon { font-size: 18px; font-weight: 300; }

    /* =========== FILTERS =========== */
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
    .search-box { flex: 1; min-width: 260px; position: relative; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-box input {
      width: 100%; padding: 12px 16px 12px 42px; border-radius: 14px; font-size: 14px;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
      transition: all 0.25s; box-sizing: border-box;
    }
    :root.dark-mode .search-box input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-box input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
    .status-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill {
      padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: #64748b;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
    }
    :root.dark-mode .pill { background: #1e293b; border-color: #334155; color: #94a3b8; }
    .pill:hover { border-color: #6366f1; color: #6366f1; }
    .pill.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-color: transparent; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
    .pill-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot-open { background: #22c55e; }
    .dot-closed { background: #ef4444; }
    .dot-filled { background: #3b82f6; }
    .pill.active .pill-dot { background: #fff; }

    /* =========== JOB GRID =========== */
    .job-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
      max-width: 1220px;
      margin: 0 auto;
    }

    @media (max-width: 1200px) {
      .job-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 768px) {
      .job-grid { grid-template-columns: 1fr; }
    }

    /* =========== JOB CARD =========== */
    @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .job-card {
      position: relative; border-radius: 20px; overflow: hidden;
      background: var(--card-bg, #fff); border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: cardIn 0.4s ease-out both;
    }
    :root.dark-mode .job-card { background: #1e293b; border-color: rgba(255,255,255,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .job-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.06);
      border-color: rgba(99,102,241,0.2);
    }
    :root.dark-mode .job-card:hover { box-shadow: 0 12px 40px rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); }

    /* Gradient accent bar */
    .card-accent { height: 4px; width: 100%; }
    .accent-open { background: linear-gradient(90deg, #22c55e, #4ade80); }
    .accent-closed { background: linear-gradient(90deg, #ef4444, #f87171); }
    .accent-filled { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

    .card-body { padding: 20px 22px 18px; }

    /* Top row */
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;
    }
    .badge-dot { width: 7px; height: 7px; border-radius: 50%; }
    .badge.open { background: rgba(34,197,94,0.1); color: #16a34a; }
    .badge.open .badge-dot { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
    .badge.closed { background: rgba(239,68,68,0.1); color: #dc2626; }
    .badge.closed .badge-dot { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.4); }
    .badge.filled { background: rgba(59,130,246,0.1); color: #2563eb; }
    .badge.filled .badge-dot { background: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.4); }
    :root.dark-mode .badge.open { background: rgba(34,197,94,0.15); }
    :root.dark-mode .badge.closed { background: rgba(239,68,68,0.15); }
    :root.dark-mode .badge.filled { background: rgba(59,130,246,0.15); }

    /* Card actions */
    .card-actions { display: flex; gap: 4px; }
    .action-btn {
      width: 32px; height: 32px; border-radius: 10px; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; color: #94a3b8; transition: all 0.2s;
    }
    .action-edit:hover { background: rgba(99,102,241,0.1); color: #6366f1; }
    .action-delete:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
    :root.dark-mode .action-edit:hover { background: rgba(99,102,241,0.2); }
    :root.dark-mode .action-delete:hover { background: rgba(239,68,68,0.2); }
    .action-btn a { text-decoration: none; color: inherit; display: flex; }

    /* Title */
    .card-title {
      font-size: 17px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 10px;
      line-height: 1.35; letter-spacing: -0.2px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    :root.dark-mode .card-title { color: #f1f5f9; }

    /* Company */
    .card-company { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .company-avatar {
      width: 30px; height: 30px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .card-company span { font-size: 13px; font-weight: 600; color: #64748b; }
    :root.dark-mode .card-company span { color: #94a3b8; }

    /* Meta chips */
    .card-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
    .meta-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 500;
      background: #f1f5f9; color: #475569;
    }
    :root.dark-mode .meta-chip { background: rgba(255,255,255,0.06); color: #94a3b8; }
    .meta-chip svg { opacity: 0.6; }

    /* Skills */
    .card-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .skill-tag {
      padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;
      background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
      color: #6366f1; border: 1px solid rgba(99,102,241,0.12);
      transition: all 0.2s;
    }
    :root.dark-mode .skill-tag { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.2); color: #a5b4fc; }
    .job-card:hover .skill-tag { border-color: rgba(99,102,241,0.25); }
    .skill-more {
      padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
      background: #e2e8f0; color: #64748b;
    }
    :root.dark-mode .skill-more { background: #334155; color: #94a3b8; }

    /* Footer */
    .card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 14px; border-top: 1px solid rgba(0,0,0,0.05);
    }
    :root.dark-mode .card-footer { border-color: rgba(255,255,255,0.06); }
    .app-count { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; font-weight: 500; }
    .app-count small { font-weight: 400; }
    :root.dark-mode .app-count { color: #94a3b8; }
    .app-count-icon {
      width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
      background: rgba(99,102,241,0.08); color: #6366f1;
    }
    :root.dark-mode .app-count-icon { background: rgba(99,102,241,0.15); }
    .btn-details {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
      color: #6366f1; text-decoration: none; background: rgba(99,102,241,0.06);
      transition: all 0.25s;
    }
    :root.dark-mode .btn-details { background: rgba(99,102,241,0.12); color: #a5b4fc; }
    .btn-details:hover { background: #6366f1; color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); transform: translateX(2px); }
    .btn-details svg { transition: transform 0.25s; }
    .btn-details:hover svg { transform: translateX(3px); }

    /* =========== EMPTY STATE =========== */
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 6px; }
    :root.dark-mode .empty-state h3 { color: #f1f5f9; }
    .empty-state p { color: #94a3b8; font-size: 14px; margin: 0; }

    /* =========== PAGINATION =========== */
    .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 32px; }
    .page-btn {
      min-width: 40px; height: 40px; border-radius: 12px; border: 1.5px solid #e2e8f0;
      background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;
    }
    :root.dark-mode .page-btn { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .page-btn:hover:not(:disabled):not(.active) { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.04); }
    .page-btn.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    /* =========== MODAL =========== */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-box {
      background: var(--card-bg, #fff); border-radius: 20px; padding: 32px; max-width: 420px; width: 90%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.2); text-align: center;
    }
    :root.dark-mode .modal-box { background: #1e293b; }
    .modal-icon { font-size: 40px; margin-bottom: 8px; }
    .modal-box h3 { margin: 0 0 12px; font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); }
    :root.dark-mode .modal-box h3 { color: #f1f5f9; }
    .modal-box p { color: #64748b; font-size: 14px; margin: 0 0 6px; }
    .modal-sub { font-size: 12px !important; color: #94a3b8 !important; }
    .modal-actions { display: flex; justify-content: center; gap: 10px; margin-top: 22px; }
    .btn-cancel { background: #f1f5f9; color: #475569; border-radius: 12px; }
    .btn-cancel:hover { background: #e2e8f0; }
    :root.dark-mode .btn-cancel { background: #334155; color: #cbd5e1; }
    .btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(239,68,68,0.25); }
    .btn-danger:hover { box-shadow: 0 6px 16px rgba(239,68,68,0.35); transform: translateY(-1px); }
  `]
})
export class JobOfferListComponent implements OnInit {
  jobs: JobOffer[] = [];
  filtered: JobOffer[] = [];
  search = '';
  statusFilter = '';
  deleteTarget: JobOffer | null = null;

  // Pagination
  currentPage = 1;
  readonly pageSize = 6;

  private userCompanyId: number | null = null;
  private userRole: string | null = null;

  get isCompanyScoped(): boolean {
    return this.userRole === 'RH_ENTREPRISE' || this.userRole === 'MANAGER';
  }

  constructor(private svc: B2bJobOfferService, private authSvc: AuthService, public nav: B2bNavService) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.userCompanyId = user?.companyId || null;
      this.loadJobs();
    });
  }

  loadJobs() {
    const obs = (this.isCompanyScoped && this.userCompanyId)
      ? this.svc.getByCompany(this.userCompanyId)
      : this.svc.getAll();
    obs.subscribe(d => { this.jobs = d || []; this.filter(); });
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.jobs.filter(j => {
      const ms = !t || j.title.toLowerCase().includes(t) || j.companyName?.toLowerCase().includes(t) || j.location?.toLowerCase().includes(t);
      const mf = !this.statusFilter || j.status === this.statusFilter;
      return ms && mf;
    });
    this.currentPage = 1;
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  statusLabel(s: string): string {
    return ({ 'OPEN': 'Open', 'CLOSED': 'Closed', 'FILLED': 'Filled' } as Record<string, string>)[s] || s;
  }

  parseSkills(skills: any): string[] {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    return [];
  }

  confirmDelete(job: JobOffer) {
    this.deleteTarget = job;
  }

  deleteJob(id: number) {
    this.svc.delete(id).subscribe({
      next: () => {
        this.deleteTarget = null;
        this.jobs = this.jobs.filter(j => j.id !== id);
        this.filter();
      },
      error: () => {
        this.deleteTarget = null;
        alert('Error deleting the offer. Please try again.');
      }
    });
  }
}
