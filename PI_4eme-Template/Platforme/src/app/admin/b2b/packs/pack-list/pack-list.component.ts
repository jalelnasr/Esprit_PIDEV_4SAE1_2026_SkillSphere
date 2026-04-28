import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bPackService } from '../../services/pack.service';
import { B2bPurchaseService } from '../../services/purchase.service';
import { B2bCompanyService } from '../../services/company.service';
import { Pack, Company } from '../../models/b2b.models';

@Component({
  selector: 'app-pack-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📦 Training Packs</h1>
          <p class="subtitle">Buy training credits for your employees</p>
        </div>
      </div>

      <!-- Pack Grid -->
      <div class="pack-grid">
        <div *ngFor="let p of packs" class="pack-card" [class.inactive]="!p.isActive">
          <div class="pack-badge" *ngIf="!p.isActive">Inactive</div>
          <div class="pack-icon">📦</div>
          <h3>{{ p.name }}</h3>
          <p class="pack-desc">{{ p.description }}</p>
          <div class="pack-stats">
            <div class="stat">
              <span class="stat-val">{{ p.formationsCount }}</span>
              <span class="stat-lbl">Trainings</span>
            </div>
            <div class="stat">
              <span class="stat-val">{{ p.price | number:'1.0-0' }} €</span>
              <span class="stat-lbl">Price</span>
            </div>
          </div>
          <button (click)="openPurchaseModal(p)" class="btn btn-primary" [disabled]="!p.isActive">
            🛒 Buy
          </button>
        </div>
      </div>

      <p *ngIf="packs.length === 0" class="empty">No packs available</p>

      <!-- Purchase History -->
      <div class="section" *ngIf="purchases.length > 0">
        <h2>📜 Purchase History</h2>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Pack</th><th>Company</th><th>Amount</th></tr></thead>
            <tbody>
              <tr *ngFor="let pur of purchases">
                <td>{{ pur.purchaseDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ pur.packName }}</td>
                <td>{{ pur.companyName }}</td>
                <td class="amount">{{ pur.totalAmount | number:'1.0-0' }} €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Purchase Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>🛒 Buy "{{ selectedPack?.name }}"</h3>
          <p>{{ selectedPack?.formationsCount }} trainings — <strong>{{ selectedPack?.price | number:'1.0-0' }} €</strong></p>
          <div class="form-group">
            <label>Company</label>
            <select [(ngModel)]="purchaseCompanyId" class="form-control">
              <option [value]="0" disabled>— Select —</option>
              <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button (click)="showModal = false" class="btn btn-cancel">Cancel</button>
            <button (click)="confirmPurchase()" class="btn btn-primary" [disabled]="purchaseCompanyId < 1">Confirm</button>
          </div>
          <div class="success-msg" *ngIf="purchaseSuccess">Purchase completed successfully! ✅</div>
          <div class="error-msg" *ngIf="purchaseError">{{ purchaseError }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: none; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }

    .pack-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .pack-card {
      position: relative; background: var(--card-bg, #fff); border-radius: 16px; padding: 28px; text-align: center;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06)); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: all 0.2s;
    }
    .pack-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    :root.dark-mode .pack-card { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .pack-card.inactive { opacity: 0.6; }
    .pack-badge { position: absolute; top: 12px; right: 12px; background: #fef2f2; color: #dc2626; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .pack-icon { font-size: 40px; margin-bottom: 12px; }
    .pack-card h3 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 8px; }
    :root.dark-mode .pack-card h3 { color: #f1f5f9; }
    .pack-desc { font-size: 14px; color: #64748b; margin-bottom: 16px; }
    .pack-stats { display: flex; justify-content: center; gap: 32px; margin-bottom: 20px; }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .stat-val { font-size: 22px; font-weight: 800; color: #6366f1; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; width: 100%; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; width: auto; }
    :root.dark-mode .btn-cancel { border-color: #334155; color: #94a3b8; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }

    .section { margin-top: 32px; }
    .section h2 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin-bottom: 16px; }
    :root.dark-mode .section h2 { color: #f1f5f9; }
    .table-container { background: var(--card-bg, #fff); border-radius: 16px; overflow: hidden; border: 1px solid var(--card-border, rgba(0,0,0,0.06)); }
    :root.dark-mode .table-container { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: #f8fafc; }
    :root.dark-mode .data-table th { background: #0f172a; }
    .data-table td { padding: 12px 16px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid rgba(0,0,0,0.03); }
    :root.dark-mode .data-table td { color: #e2e8f0; }
    .amount { font-weight: 700; color: #6366f1 !important; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--card-bg, #fff); border-radius: 16px; padding: 32px; width: 400px; max-width: 90vw; }
    :root.dark-mode .modal-content { --card-bg: #1e293b; }
    .modal-content h3 { font-size: 18px; font-weight: 700; margin: 0 0 8px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .modal-content h3 { color: #f1f5f9; }
    .modal-content p { color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 10px 14px; border-radius: 10px; font-size: 14px; border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a); }
    :root.dark-mode .form-control { background: #0f172a; border-color: #334155; color: #e2e8f0; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
    .modal-actions .btn { width: auto; }
    .success-msg { margin-top: 12px; padding: 10px; border-radius: 8px; background: #f0fdf4; color: #16a34a; font-size: 14px; text-align: center; }
    .error-msg { margin-top: 12px; padding: 10px; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 14px; text-align: center; }
  `]
})
export class PackListComponent implements OnInit {
  packs: Pack[] = [];
  companies: Company[] = [];
  purchases: any[] = [];

  showModal = false;
  selectedPack: Pack | null = null;
  purchaseCompanyId = 0;
  purchaseSuccess = false;
  purchaseError = '';

  constructor(
    private packSvc: B2bPackService,
    private purchaseSvc: B2bPurchaseService,
    private companySvc: B2bCompanyService
  ) {}

  ngOnInit() {
    this.packSvc.getAll().subscribe(p => this.packs = p || []);
    this.companySvc.getAll().subscribe(c => this.companies = c || []);
    this.purchaseSvc.getAll().subscribe(p => this.purchases = p || []);
  }

  openPurchaseModal(pack: Pack) {
    this.selectedPack = pack;
    this.purchaseCompanyId = 0;
    this.purchaseSuccess = false;
    this.purchaseError = '';
    this.showModal = true;
  }

  confirmPurchase() {
    if (!this.selectedPack || this.purchaseCompanyId < 1) return;
    this.purchaseSvc.purchase({ companyId: this.purchaseCompanyId, packId: this.selectedPack.id }).subscribe({
      next: () => {
        this.purchaseSuccess = true;
        this.purchaseError = '';
        this.purchaseSvc.getAll().subscribe(p => this.purchases = p || []);
        setTimeout(() => this.showModal = false, 1500);
      },
      error: (err) => {
        this.purchaseError = err.error?.message || 'Error during purchase';
      }
    });
  }
}
