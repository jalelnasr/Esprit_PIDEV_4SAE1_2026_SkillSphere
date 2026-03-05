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
      <div class="page-header">
        <div>
          <h1>💼 Job Offers</h1>
          <p class="subtitle">{{ filtered.length }} offer(s)</p>
        </div>
        <a [routerLink]="nav.basePath + '/jobs/new'" class="btn btn-primary">+ Publish an offer</a>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search...">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="FILLED">Filled</option>
        </select>
      </div>

      <div class="job-grid">
        <div *ngFor="let j of filtered" class="job-card">
          <div class="job-top">
            <span class="badge" [ngClass]="j.status.toLowerCase()">{{ statusLabel(j.status) }}</span>
            <span class="job-date">{{ j.postedAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <h3>{{ j.title }}</h3>
          <p class="job-company">🏢 {{ j.companyName }}</p>
          <div class="job-meta">
            <span>📍 {{ j.location }}</span>
            <span>📋 {{ j.contractType }}</span>
          </div>
          <div class="job-skills">
            <span *ngFor="let s of parseSkills(j.requiredSkills)" class="skill-tag">{{ s }}</span>
          </div>
          <div class="job-footer">
            <span class="app-count">👤 {{ j.applicationCount }} application(s)</span>
            <div class="footer-actions">
              <a [routerLink]="[nav.basePath + '/jobs', j.id, 'edit']" class="btn-edit" title="Edit this offer">✏️</a>
              <button class="btn-delete" (click)="confirmDelete(j)" title="Delete this offer">🗑️</button>
              <a [routerLink]="[nav.basePath + '/jobs', j.id]" class="link">View details →</a>
            </div>
          </div>

          <!-- Delete confirmation modal -->
          <div class="modal-overlay" *ngIf="deleteTarget?.id === j.id" (click)="deleteTarget = null">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <h3>⚠️ Confirm deletion</h3>
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
      <p *ngIf="filtered.length === 0" class="empty">No offer found</p>
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

    .job-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
    .job-card { background: var(--card-bg, #fff); border-radius: 16px; padding: 22px; border: 1px solid rgba(0,0,0,0.06); transition: all 0.2s; }
    :root.dark-mode .job-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .job-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
    .job-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .job-date { font-size: 12px; color: #94a3b8; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.open { background: #dcfce7; color: #16a34a; }
    .badge.closed { background: #fef2f2; color: #dc2626; }
    .badge.filled { background: #dbeafe; color: #2563eb; }
    :root.dark-mode .badge.open { background: rgba(22,163,106,0.2); }
    :root.dark-mode .badge.closed { background: rgba(220,38,38,0.2); }
    :root.dark-mode .badge.filled { background: rgba(37,99,235,0.2); }
    .job-card h3 { font-size: 16px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 6px; }
    :root.dark-mode .job-card h3 { color: #f1f5f9; }
    .job-company { font-size: 13px; color: #64748b; margin-bottom: 10px; }
    .job-meta { display: flex; gap: 16px; font-size: 13px; color: #64748b; margin-bottom: 12px; }
    .job-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .skill-tag { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #ede9fe; color: #6366f1; }
    :root.dark-mode .skill-tag { background: rgba(99,102,241,0.15); }
    .job-footer { display: flex; justify-content: space-between; align-items: center; }
    .app-count { font-size: 13px; color: #64748b; }
    .link { font-size: 13px; color: #6366f1; text-decoration: none; font-weight: 600; }
    .link:hover { text-decoration: underline; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; }

    .footer-actions { display: flex; align-items: center; gap: 12px; }
    .btn-edit { text-decoration: none; font-size: 16px; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
    .btn-edit:hover { background: #ede9fe; }
    :root.dark-mode .btn-edit:hover { background: rgba(99,102,241,0.15); }
    .btn-delete { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
    .btn-delete:hover { background: #fef2f2; }
    :root.dark-mode .btn-delete:hover { background: rgba(220,38,38,0.15); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-box { background: var(--card-bg, #fff); border-radius: 16px; padding: 28px; max-width: 420px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    :root.dark-mode .modal-box { background: #1e293b; }
    .modal-box h3 { margin: 0 0 12px; font-size: 18px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .modal-box h3 { color: #f1f5f9; }
    .modal-box p { color: #64748b; font-size: 14px; margin: 0 0 6px; }
    .modal-sub { font-size: 12px !important; color: #94a3b8 !important; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .btn-cancel { background: #f1f5f9; color: #475569; }
    .btn-cancel:hover { background: #e2e8f0; }
    :root.dark-mode .btn-cancel { background: #334155; color: #cbd5e1; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
  `]
})
export class JobOfferListComponent implements OnInit {
  jobs: JobOffer[] = [];
  filtered: JobOffer[] = [];
  search = '';
  statusFilter = '';
  deleteTarget: JobOffer | null = null;

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
