import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bContractService } from '../../services/contract.service';
import { Contract } from '../../models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivityLogService } from '../../services/activity-log.service';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📄 Contracts</h1>
          <p class="subtitle">{{ filtered.length }} contract(s)</p>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <span class="si">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search by number, freelancer, mission...">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filter()" class="filter-select">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="SIGNED">Signed</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="TERMINATED">Terminated</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Contract #</th>
              <th>Mission</th>
              <th>Freelancer</th>
              <th>Company</th>
              <th>Amount</th>
              <th>Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filtered">
              <td class="contract-num">{{ c.contractNumber }}</td>
              <td>{{ c.missionTitle }}</td>
              <td>{{ c.freelancerName }}</td>
              <td>{{ c.companyName }}</td>
              <td class="amount">{{ c.amount | number:'1.0-0' }} €</td>
              <td class="period">{{ c.startDate | date:'dd/MM/yy' }} → {{ c.endDate | date:'dd/MM/yy' }}</td>
              <td><span class="badge" [ngClass]="c.status.toLowerCase()">{{ statusLabel(c.status) }}</span></td>
              <td class="actions-cell">
                <button *ngIf="c.status === 'DRAFT' || c.status === 'PENDING'" (click)="signContract(c)" class="action-btn sign" title="Sign">✍️</button>
                <button *ngIf="c.status === 'ACTIVE' || c.status === 'SIGNED'" (click)="terminateContract(c)" class="action-btn terminate" title="Terminate">🚫</button>
                <a *ngIf="c.contractUrl" [href]="c.contractUrl" target="_blank" class="action-btn" title="Download">📥</a>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="filtered.length === 0" class="empty">No contracts found</p>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
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

    .table-container { background: var(--card-bg, #fff); border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    :root.dark-mode .table-container { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 14px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: #f8fafc; border-bottom: 1px solid rgba(0,0,0,0.06); }
    :root.dark-mode .data-table th { background: #0f172a; }
    .data-table td { padding: 14px 14px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid rgba(0,0,0,0.03); }
    :root.dark-mode .data-table td { color: #e2e8f0; }
    .contract-num { font-weight: 700; color: #6366f1 !important; font-family: monospace; }
    .amount { font-weight: 700; color: #16a34a !important; }
    .period { font-size: 12px; color: #64748b !important; white-space: nowrap; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.draft { background: #f1f5f9; color: #64748b; }
    .badge.pending { background: #fef3c7; color: #d97706; }
    .badge.signed { background: #dbeafe; color: #2563eb; }
    .badge.active { background: #dcfce7; color: #16a34a; }
    .badge.completed { background: #ede9fe; color: #6366f1; }
    .badge.terminated { background: #fef2f2; color: #dc2626; }
    .badge.cancelled { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge.draft { background: rgba(100,116,139,0.2); }
    :root.dark-mode .badge.pending { background: rgba(217,119,6,0.2); }
    :root.dark-mode .badge.signed { background: rgba(37,99,235,0.2); }
    :root.dark-mode .badge.active { background: rgba(22,163,106,0.2); }
    :root.dark-mode .badge.completed { background: rgba(99,102,241,0.2); }
    :root.dark-mode .badge.terminated { background: rgba(220,38,38,0.2); }
    :root.dark-mode .badge.cancelled { background: rgba(220,38,38,0.15); }
    .actions-cell { display: flex; gap: 4px; }
    .action-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 6px; text-decoration: none; }
    .action-btn:hover { background: rgba(0,0,0,0.06); }
    :root.dark-mode .action-btn:hover { background: rgba(255,255,255,0.08); }
    .empty { text-align: center; padding: 40px; color: #94a3b8; }
  `]
})
export class ContractListComponent implements OnInit {
  contracts: Contract[] = [];
  filtered: Contract[] = [];
  search = '';
  statusFilter = '';

  private userCompanyId: number | null = null;
  private userRole: string | null = null;

  get isCompanyScoped(): boolean {
    return this.userRole === 'RH_ENTREPRISE' || this.userRole === 'MANAGER';
  }

  constructor(private svc: B2bContractService, private authSvc: AuthService, private activityLog: ActivityLogService) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.userCompanyId = user?.companyId || null;
      this.loadContracts();
    });
  }

  loadContracts() {
    const obs = (this.isCompanyScoped && this.userCompanyId)
      ? this.svc.getByCompany(this.userCompanyId)
      : this.svc.getAll();
    obs.subscribe(d => { this.contracts = d || []; this.filter(); });
  }

  filter() {
    const t = this.search.toLowerCase();
    this.filtered = this.contracts.filter(c => {
      const ms = !t || c.contractNumber?.toLowerCase().includes(t) || c.freelancerName?.toLowerCase().includes(t) ||
        c.missionTitle?.toLowerCase().includes(t) || c.companyName?.toLowerCase().includes(t);
      const mf = !this.statusFilter || c.status === this.statusFilter;
      return ms && mf;
    });
  }

  signContract(c: Contract) {
    if (confirm(`Sign contract ${c.contractNumber}?`)) {
      this.svc.sign(c.id).subscribe(() => {
        c.status = 'SIGNED';
        this.authSvc.currentUser$.subscribe(u => {
          if (u) {
            this.activityLog.logStatusChange(u.email, u.role, 'Contract', c.id, `Contract #${c.contractNumber} signed`);
          }
        }).unsubscribe();
      });
    }
  }

  terminateContract(c: Contract) {
    if (confirm(`Terminate contract ${c.contractNumber}?`)) {
      this.svc.updateStatus(c.id, 'TERMINATED').subscribe(() => {
        c.status = 'TERMINATED';
        this.authSvc.currentUser$.subscribe(u => {
          if (u) {
            this.activityLog.logStatusChange(u.email, u.role, 'Contract', c.id, `Contract #${c.contractNumber} terminated`);
          }
        }).unsubscribe();
      });
    }
  }

  statusLabel(s: string): string {
    return ({
      'DRAFT': 'Draft', 'PENDING': 'Pending', 'SIGNED': 'Signed', 'ACTIVE': 'Active',
      'COMPLETED': 'Completed', 'TERMINATED': 'Terminated', 'CANCELLED': 'Cancelled'
    } as Record<string, string>)[s] || s;
  }
}
