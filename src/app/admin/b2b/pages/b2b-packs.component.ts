import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { B2bPackService } from '../services/pack.service';
import { B2bPurchaseService } from '../services/purchase.service';
import { B2bCompanyService } from '../services/company.service';
import { Pack, PackRequest, PackPurchase, Company } from '../models/b2b.models';

@Component({
  selector: 'app-b2b-packs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="b2b-container">
      <div class="page-header">
        <div><h1>Packs & Purchases</h1><p>Training pack catalog and purchase history</p></div>
        <button class="btn-primary" (click)="openCreatePack()">➕ New Pack</button>
      </div>

      <div class="tabs">
        <button class="tab-btn" [class.active]="tab==='packs'" (click)="tab='packs'">📦 Packs</button>
        <button class="tab-btn" [class.active]="tab==='purchases'" (click)="tab='purchases';loadPurchases()">🛒 Purchases</button>
      </div>

      <!-- PACKS TAB -->
      <div *ngIf="tab==='packs'">
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let p of packs">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
                <span style="font-weight:800;font-size:1.1rem;color:var(--text-primary)">{{ p.name }}</span>
                <span class="badge" [ngClass]="p.isActive?'success':'danger'">{{ p.isActive?'Active':'Inactive' }}</span>
              </div>
              <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:.75rem">{{ p.description }}</p>
              <div style="display:flex;gap:1rem;align-items:center">
                <span style="font-weight:700;color:#0891b2;font-size:1.2rem">{{ p.price }} DT</span>
                <span style="font-size:.85rem;color:var(--text-secondary)">{{ p.formationsCount }} trainings</span>
              </div>
              <div style="display:flex;gap:.4rem;margin-top:.75rem">
                <button class="btn-icon" (click)="openEditPack(p)">✏️</button>
                <button class="btn-icon danger" (click)="removePack(p)">🗑️</button>
                <button class="btn-primary btn-sm" (click)="openBuy(p)">🛒 Buy</button>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="packs.length===0" class="empty-state"><div class="empty-icon">📦</div><p>No pack</p></div>
      </div>

      <!-- PURCHASES TAB -->
      <div *ngIf="tab==='purchases'">
        <div class="filters-section">
          <select class="filter-select" [(ngModel)]="purchaseCompanyId" (change)="filterPurchases()">
            <option [ngValue]="0">All companies</option>
            <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Company</th><th>Pack</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of filteredPurchases">
                <td>{{ p.id }}</td>
                <td>{{ p.companyName }}</td>
                <td><span class="badge info">{{ p.packName }}</span></td>
                <td style="font-weight:700">{{ p.totalAmount }} DT</td>
                <td>{{ p.purchaseDate | date:'yyyy-MM-dd' }}</td>
                <td><button class="btn-icon danger" (click)="removePurchase(p)">🗑️</button></td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="filteredPurchases.length===0" class="empty-state"><div class="empty-icon">🛒</div><p>No purchase</p></div>
        </div>
      </div>
    </div>

    <!-- Pack modal -->
    <div *ngIf="showPackModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editingPack ? 'Edit' : 'Create' }} Pack</h2>
        <div class="form-grid">
          <input class="filter-select" placeholder="Nom" [(ngModel)]="packForm.name" />
          <input class="filter-select" type="number" placeholder="Number of trainings" [(ngModel)]="packForm.formationsCount" />
          <input class="filter-select" type="number" placeholder="Price (DT)" [(ngModel)]="packForm.price" />
          <select class="filter-select" [(ngModel)]="packForm.isActive">
            <option [ngValue]="true">Active</option><option [ngValue]="false">Inactive</option>
          </select>
          <textarea class="filter-select form-full" rows="2" placeholder="Description" [(ngModel)]="packForm.description"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showPackModal=false">Cancel</button>
          <button class="btn-primary" (click)="submitPack()">{{ editingPack ? 'Save' : 'Create' }}</button>
        </div>
      </div>
    </div>

    <!-- Buy modal -->
    <div *ngIf="showBuyModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Buy pack: {{ buyPack?.name }}</h2>
        <div class="form-grid cols-1">
          <select class="filter-select" [(ngModel)]="buyCompanyId">
            <option [ngValue]="0" disabled>-- Select a company --</option>
            <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showBuyModal=false">Cancel</button>
          <button class="btn-primary" (click)="submitBuy()">Confirm purchase</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./b2b-shared.css']
})
export class B2bPacksComponent implements OnInit {
  tab: 'packs'|'purchases' = 'packs';
  packs: Pack[] = [];
  purchases: PackPurchase[] = [];
  filteredPurchases: PackPurchase[] = [];
  companies: Company[] = [];
  purchaseCompanyId = 0;

  showPackModal = false;
  editingPack: Pack | null = null;
  packForm: PackRequest = { name:'', description:'', formationsCount:0, price:0, isActive:true };

  showBuyModal = false;
  buyPack: Pack | null = null;
  buyCompanyId = 0;

  constructor(private packSvc: B2bPackService, private purchaseSvc: B2bPurchaseService, private compSvc: B2bCompanyService) {}

  ngOnInit() {
    this.compSvc.getAll().subscribe({ next: d => this.companies = d??[] });
    this.loadPacks();
  }

  loadPacks() { this.packSvc.getAll().subscribe({ next: d => this.packs = d??[] }); }
  loadPurchases() { this.purchaseSvc.getAll().subscribe({ next: d => { this.purchases = d??[]; this.filterPurchases(); } }); }
  filterPurchases() {
    this.filteredPurchases = this.purchaseCompanyId ? this.purchases.filter(p => p.companyId===this.purchaseCompanyId) : this.purchases;
  }

  openCreatePack() { this.editingPack=null; this.packForm={ name:'', description:'', formationsCount:0, price:0, isActive:true }; this.showPackModal=true; }
  openEditPack(p: Pack) { this.editingPack=p; this.packForm={ name:p.name, description:p.description, formationsCount:p.formationsCount, price:p.price, isActive:p.isActive }; this.showPackModal=true; }
  submitPack() {
    const obs = this.editingPack ? this.packSvc.update(this.editingPack.id, this.packForm) : this.packSvc.create(this.packForm);
    obs.subscribe({ next: () => { this.showPackModal=false; this.loadPacks(); }, error: e => alert(e?.error?.message||'Error') });
  }
  removePack(p: Pack) { if(!confirm(`Delete ${p.name}?`)) return; this.packSvc.delete(p.id).subscribe({ next: () => this.loadPacks() }); }

  openBuy(p: Pack) { this.buyPack=p; this.buyCompanyId=0; this.showBuyModal=true; }
  submitBuy() {
    if (!this.buyCompanyId||!this.buyPack) { alert('Select a company'); return; }
    this.purchaseSvc.purchase({ companyId: this.buyCompanyId, packId: this.buyPack.id }).subscribe({
      next: () => { this.showBuyModal=false; alert('Purchase completed!'); this.loadPurchases(); },
      error: e => alert(e?.error?.message||'Error')
    });
  }
  removePurchase(p: PackPurchase) { if(!confirm('Delete this purchase?')) return; this.purchaseSvc.delete(p.id).subscribe({ next: () => this.loadPurchases() }); }
}
