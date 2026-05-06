import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CertificateApiService,
  CertificateRequestDetail,
  CertificateStatus
} from '../../../../services/certificate-api.service';

@Component({
  selector: 'app-certificate-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="cr-root">
  <div class="cr-container card">
    <div class="cr-header">
      <div>
        <h1>Certificate Requests</h1>
        <p class="muted">Manage learner certificate requests and issue PDFs.</p>
      </div>
      <div class="cr-toolbar">
        <div class="search-wrap">
          <svg class="icon search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 15a5 5 0 110-10 5 5 0 010 10z"/></svg>
          <input type="search" placeholder="Search by name or evaluation" [(ngModel)]="searchTerm" aria-label="Search requests" />
        </div>
        <select [(ngModel)]="statusFilter" (change)="loadRequests()" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button class="btn btn-ghost" (click)="loadRequests()">Refresh</button>
      </div>
    </div>

    <div *ngIf="error" class="cr-error" role="alert">{{ error }}</div>

    <div *ngIf="loading" class="cr-loading">Loading requests…</div>

    <div *ngIf="!loading && (!requests || requests.length === 0)" class="cr-empty">No certificate requests found.</div>

    <!-- Kanban columns -->
    <div class="kanban-wrap" *ngIf="!loading && requests.length">
      <div class="kanban-col" *ngFor="let status of ['PENDING','APPROVED','REJECTED']">
        <div class="col-head" [ngClass]="{'col-pending': status==='PENDING','col-approved': status==='APPROVED','col-rejected': status==='REJECTED'}">
          <div class="col-title">{{ status === 'PENDING' ? 'Pending' : (status === 'APPROVED' ? 'Approved' : 'Rejected') }}</div>
          <div class="col-count">{{ (grouped[status] || []).length }}</div>
        </div>
        <div class="col-body">
          <div *ngFor="let req of grouped[status]" class="kanban-card">
            <div class="card-top">
              <div class="avatar">{{ (req.apprenantFirstName?.charAt(0) || '') + (req.apprenantLastName?.charAt(0) || '') }}</div>
              <div class="card-meta">
                <div class="card-name">{{ req.apprenantFirstName }} {{ req.apprenantLastName }}</div>
                <div class="card-eval">{{ req.evaluationTitle }}</div>
              </div>
              <div class="card-score">{{ req.bestScore }}%</div>
            </div>
            <div class="card-body">
              <div class="small muted">Requested: {{ req.requestedAt | date:'short' }}</div>
              <div class="small muted">Attempts: {{ req.attemptHistory?.length || 0 }}</div>
            </div>
            <div class="card-actions">
              <button *ngIf="req.status === 'PENDING'" class="btn btn-primary" (click)="openConfirm(req,'APPROVE')">Approve</button>
              <button *ngIf="req.status === 'PENDING'" class="btn btn-danger" (click)="openConfirm(req,'REJECT')">Reject</button>
              <button *ngIf="req.status === 'APPROVED'" class="btn" (click)="download(req)">Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-controls" *ngIf="getTotalPages() > 1">
      <button class="btn btn-ghost" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">← Previous</button>
      <div class="page-info">Page {{ currentPage }} of {{ getTotalPages() }}</div>
      <button class="btn btn-ghost" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === getTotalPages()">Next →</button>
    </div>
    <!-- End Kanban columns -->

    <!-- Confirm modal -->
    <div class="cr-modal-backdrop" *ngIf="modalOpen">
      <div class="cr-modal" role="dialog" aria-modal="true">
        <h3>{{ modalAction === 'APPROVE' ? 'Approve Request' : 'Reject Request' }}</h3>
        <p *ngIf="modalRequest"><strong>{{ modalRequest.apprenantFirstName }} {{ modalRequest.apprenantLastName }}</strong> — {{ modalRequest.evaluationTitle }}</p>
        <label for="note">Note (optional)</label>
        <textarea id="note" [(ngModel)]="modalNote" rows="4" placeholder="Add a note to include with the decision"></textarea>
        <div class="modal-actions">
          <button class="btn btn-ghost" (click)="cancelModal()">Cancel</button>
          <button class="btn btn-primary" (click)="confirmAction()">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [ `
.cr-root { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:var(--text-primary,#0f172a); }
.card { background: var(--bg-primary,#ffffff); border-radius:12px; padding:18px; box-shadow: 0 6px 18px rgba(15,23,42,0.06); }
.cr-container { padding: 6px; }
.cr-header { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:16px; }
.cr-header h1 { margin:0; font-size:1.25rem; }
.muted { color:var(--text-secondary,#6b7280); margin:4px 0 0; font-size:0.95rem; }
.cr-toolbar { display:flex; gap:12px; align-items:center; }
.search-wrap { position:relative; display:flex; align-items:center; }
.search-wrap input[type="search"] { padding:10px 12px 10px 36px; border:1px solid rgba(15,23,42,0.06); border-radius:10px; min-width:260px; background:transparent; }
.search-icon { position:absolute; left:10px; pointer-events:none; }
.cr-toolbar select { padding:8px 10px; border-radius:8px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
.btn { padding:8px 10px; border-radius:8px; background:transparent; border:1px solid var(--color-primary,#0891b2); color:var(--color-primary,#0891b2); cursor:pointer; display:inline-flex; align-items:center; gap:8px; }
.btn-ghost { background:transparent; border:1px solid rgba(15,23,42,0.06); color:var(--text-primary,#0f172a); }
.btn-primary { background:var(--color-primary,#0891b2); color:#fff; border:none; }
.btn-danger { background:var(--color-error,#ef4444); color:#fff; border:none; }
.btn.small { padding:6px 8px; font-size:0.85rem; }
.icon { margin-right:6px; }
.icon-btn { width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:none; cursor:pointer; }
.icon-btn.approve { background: linear-gradient(90deg,#10b981,#059669); color:#fff; }
.icon-btn.reject { background: linear-gradient(90deg,#fb7185,#ef4444); color:#fff; }
.icon-btn svg path { opacity:0.95; }

.cr-error { color:var(--color-error,#ef4444); margin:8px 0; }
.cr-loading { color:var(--text-secondary,#6b7280); margin:8px 0; }
.cr-empty { color:var(--text-secondary,#6b7280); margin:16px 0; }

.table-wrap { overflow:auto; margin-top:6px; }
.cr-table { width:100%; border-collapse:collapse; min-width:900px; }
.cr-table th, .cr-table td { text-align:left; padding:14px 12px; border-bottom:1px solid rgba(15,23,42,0.04); }
.cr-table thead th { color:var(--text-primary,#0f172a); font-weight:600; background:transparent; position:sticky; top:0; }
.cr-table tbody tr { transition: background .12s ease, transform .08s ease; }
.cr-table tbody tr:hover { background: rgba(6,95,70,0.03); transform: translateY(-1px); }
.muted-left { color:var(--text-secondary,#475569); }
.center { text-align:center; }
.badge { padding:6px 10px; border-radius:999px; font-size:12px; display:inline-block; min-width:72px; text-align:center; font-weight:600; }
.badge-pending { background: #fffbeb; color:#92400e; border:1px solid #fef3c7; }
.badge-approved { background:#ecfdf5; color:#065f46; border:1px solid #bbf7d0; }
.badge-rejected { background:#fff1f2; color:#9f1239; border:1px solid #fecaca; }
.actions { display:flex; gap:8px; }
.actions-col { width:140px; text-align:right; }

/* Card list for small screens */
.cr-cards { display:none; gap:12px; margin-top:12px; }
.cr-card { background:#fff; border:1px solid rgba(15,23,42,0.04); border-radius:12px; padding:12px; box-shadow: 0 6px 12px rgba(2,6,23,0.04); }
.cr-card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
.cr-card .name { font-weight:700; }
.cr-card .eval { color:var(--text-secondary,#6b7280); font-size:13px; }
.cr-card-body { margin-top:8px; color:var(--text-secondary,#6b7280); }
.cr-card-actions { margin-top:12px; display:flex; gap:8px; }

/* Modal */
.cr-modal-backdrop { position:fixed; inset:0; background:rgba(2,6,23,0.5); display:flex; align-items:center; justify-content:center; z-index:60; }
.cr-modal { background:#fff; border-radius:10px; padding:18px; width:min(600px,95%); box-shadow:0 18px 40px rgba(2,6,23,0.12); }
.cr-modal h3 { margin:0 0 8px 0; }
.cr-modal textarea { width:100%; padding:10px; border-radius:8px; border:1px solid rgba(15,23,42,0.06); margin-top:8px; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }

/* Responsive rules */
@media (max-width: 900px) {
  .cr-table { min-width:700px; }
}
@media (max-width: 768px) {
  .cr-table { display:none; }
  .cr-cards { display:flex; flex-direction:column; }
  .search-wrap input[type="search"] { min-width:140px; }
}
/* Kanban styles */
.kanban-wrap { display:flex; gap:18px; margin-top:14px; align-items:flex-start; }
.kanban-col { background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.9)); border-radius:10px; padding:12px; width:33%; box-shadow:0 6px 18px rgba(2,6,23,0.04); display:flex; flex-direction:column; max-height:72vh; overflow:auto; }
.col-head { display:flex; justify-content:space-between; align-items:center; padding:6px 8px; margin-bottom:8px; border-radius:8px; }
.col-pending { background: linear-gradient(90deg,#fef3c7,#fffbeb); }
.col-approved { background: linear-gradient(90deg,#bbf7d0,#ecfdf5); }
.col-rejected { background: linear-gradient(90deg,#fecaca,#fff1f2); }
.col-title { font-weight:700; }
.col-count { padding:2px 6px; border-radius:6px; font-size:12px; background:rgba(0,0,0,0.05); }
.kanban-card { background:#fff; border-radius:10px; padding:10px; margin-bottom:8px; border:1px solid rgba(15,23,42,0.04); box-shadow:0 4px 12px rgba(2,6,23,0.04); }
.card-top { display:flex; gap:8px; align-items:flex-start; }
.avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(90deg,#0891b2,#06b6d4); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0; }
.card-meta { flex:1; min-width:0; }
.card-name { font-weight:700; font-size:14px; }
.card-eval { color:var(--text-secondary,#6b7280); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.card-score { font-weight:700; text-align:right; min-width:40px; }
.card-body { margin-top:6px; font-size:12px; }
.small { margin:2px 0; }
.card-actions { display:flex; gap:4px; margin-top:8px; }
.card-actions .btn { padding:4px 6px; font-size:12px; }

/* Pagination */
.pagination-controls { display:flex; justify-content:center; align-items:center; gap:12px; margin-top:24px; }
.page-info { font-weight:700; color:var(--text-primary,#0f172a); }
.btn[disabled] { opacity:0.5; cursor:not-allowed; }
.col-title { font-weight:700; }
.col-count { background:rgba(15,23,42,0.04); padding:6px 10px; border-radius:999px; font-weight:600; }
.col-pending { border-left:4px solid #f59e0b; }
.col-approved { border-left:4px solid #10b981; }
.col-rejected { border-left:4px solid #ef4444; }
.kanban-card { background:#fff; border-radius:10px; padding:12px; margin-bottom:10px; box-shadow:0 6px 12px rgba(2,6,23,0.04); transition:transform 0.12s, box-shadow 0.12s; }
.kanban-card:hover { transform:translateY(-4px); box-shadow:0 14px 30px rgba(2,6,23,0.08); }
.card-top { display:flex; gap:12px; align-items:center; }
.avatar { width:40px; height:40px; border-radius:8px; background:linear-gradient(135deg,#60a5fa,#7c3aed); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; }
.card-meta .card-name { font-weight:700; }
.card-eval { color:var(--text-secondary,#6b7280); font-size:13px; }
.card-score { margin-left:auto; font-weight:700; color:#0f766e; }
.card-body { margin-top:8px; display:flex; gap:12px; justify-content:flex-start; }
.small.muted { color:var(--text-secondary,#64748b); font-size:12px; }
.card-actions { margin-top:10px; display:flex; gap:8px; justify-content:flex-end; }

@media (max-width: 900px) {
  .kanban-wrap { flex-direction:column; }
  .kanban-col { width:100%; }
}
  ` ]
})
export class CertificateRequestsComponent implements OnInit {
  requests: CertificateRequestDetail[] = [];
  allRequests: CertificateRequestDetail[] = [];
  error: string | null = null;
  statusFilter: '' | CertificateStatus = '';
  loading = false;
  searchTerm = '';

  // modal / confirm flow
  modalOpen = false;
  modalAction: 'APPROVE' | 'REJECT' | null = null;
  modalRequest: CertificateRequestDetail | null = null;
  modalNote = '';

  // grouped view for kanban
  grouped: { [key: string]: CertificateRequestDetail[] } = { PENDING: [], APPROVED: [], REJECTED: [] };
  
  // Pagination
  pageSize = 12;
  currentPage = 1;
  totalRequests = 0;

  private rebuildGroups() {
    this.grouped = { PENDING: [], APPROVED: [], REJECTED: [] };
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = term
      ? this.requests.filter(r => (`${r.apprenantFirstName} ${r.apprenantLastName}`.toLowerCase().includes(term) || (r.evaluationTitle || '').toLowerCase().includes(term)))
      : this.requests;
    for (const r of filtered) {
      const s = r.status || 'PENDING';
      if (!this.grouped[s]) this.grouped[s] = [];
      this.grouped[s].push(r);
    }
  }

  constructor(private certificateService: CertificateApiService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.error = null;
    this.loading = true;
    this.certificateService.getFormateurRequests(this.statusFilter || undefined).subscribe({
      next: (data) => {
        this.allRequests = data;
        this.totalRequests = data.length;
        this.currentPage = 1;
        this.updatePaginatedRequests();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load certificate requests.';
        this.loading = false;
      }
    });
  }

  updatePaginatedRequests(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.requests = this.allRequests.slice(start, end);
    this.rebuildGroups();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.updatePaginatedRequests();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRequests / this.pageSize);
  }

  // Called from template when searchTerm changes
  onSearchChange() {
    this.rebuildGroups();
  }

  openConfirm(req: CertificateRequestDetail, action: 'APPROVE' | 'REJECT') {
    this.modalRequest = req;
    this.modalAction = action;
    this.modalNote = '';
    this.modalOpen = true;
  }

  cancelModal() {
    this.modalOpen = false;
    this.modalAction = null;
    this.modalRequest = null;
    this.modalNote = '';
  }

  confirmAction() {
    if (!this.modalRequest || !this.modalAction) return;
    const id = this.modalRequest.id;
    const note = this.modalNote?.trim() || undefined;
    if (this.modalAction === 'APPROVE') {
      this.certificateService.approveRequest(id, note).subscribe({
        next: () => { this.cancelModal(); this.loadRequests(); },
        error: (err) => { this.error = err?.error?.message || 'Failed to approve request.'; this.cancelModal(); }
      });
    } else {
      this.certificateService.rejectRequest(id, note).subscribe({
        next: () => { this.cancelModal(); this.loadRequests(); },
        error: (err) => { this.error = err?.error?.message || 'Failed to reject request.'; this.cancelModal(); }
      });
    }
  }

  download(req: CertificateRequestDetail): void {
    this.certificateService.downloadForFormateur(req.id).subscribe({
      next: (blob) => {
        const fileName = req.pdfFileName || `certificate-${req.id}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to download PDF.';
      }
    });
  }
}
