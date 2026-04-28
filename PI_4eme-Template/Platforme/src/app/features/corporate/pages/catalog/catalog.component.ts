import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bPackService } from '../../../../admin/b2b/services/pack.service';
import { Pack } from '../../../../admin/b2b/models/b2b.models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="catalog-page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-badge">📚 Training Catalog</div>
        <h1>Invest in your team's <span class="grad-text">growth</span></h1>
        <p>Browse premium training packs designed for professionals. Each pack contains carefully curated courses.</p>
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filterPacks()" placeholder="Search packs by name or description...">
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading training packs...</p>
      </div>

      <!-- Stats Banner -->
      <div class="stats-banner" *ngIf="!loading && allPacks.length > 0">
        <div class="sb-item">
          <strong>{{ allPacks.length }}</strong>
          <span>Total Packs</span>
        </div>
        <div class="sb-divider"></div>
        <div class="sb-item">
          <strong>{{ totalTrainings }}</strong>
          <span>Total Trainings</span>
        </div>
        <div class="sb-divider"></div>
        <div class="sb-item">
          <strong>{{ avgPrice | number:'1.0-0' }} TND</strong>
          <span>Avg. Price</span>
        </div>
        <div class="sb-divider"></div>
        <div class="sb-item">
          <strong>{{ packs.length }}</strong>
          <span>Showing</span>
        </div>
      </div>

      <!-- Sort bar -->
      <div class="sort-bar" *ngIf="!loading && packs.length > 0">
        <span class="results-count">{{ packs.length }} pack(s) found</span>
        <div class="sort-btns">
          <button [class.active]="sortBy === 'name'" (click)="sort('name')">Name</button>
          <button [class.active]="sortBy === 'price'" (click)="sort('price')">Price</button>
          <button [class.active]="sortBy === 'count'" (click)="sort('count')">Trainings</button>
        </div>
      </div>

      <!-- Pack Grid -->
      <div class="packs-grid" *ngIf="!loading">
        <div *ngFor="let p of packs; let i = index" class="pack-card" [class.featured]="p.formationsCount >= 10"
             [style.animation-delay.ms]="i * 60">
          <div class="pack-ribbon" *ngIf="p.formationsCount >= 10">⭐ Popular</div>
          <div class="pack-ribbon best" *ngIf="isBestValue(p)">🏆 Best Value</div>
          <div class="pack-header">
            <div class="pack-icon">{{ getPackIcon(p, i) }}</div>
            <h3>{{ p.name }}</h3>
          </div>
          <p class="pack-desc">{{ p.description }}</p>
          <div class="pack-details">
            <div class="detail-item">
              <span class="detail-icon">🎓</span>
              <div>
                <strong>{{ p.formationsCount }}</strong>
                <span>Included trainings</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon">💰</span>
              <div>
                <strong>{{ p.price | number:'1.0-0' }} TND</strong>
                <span>Pack price</span>
              </div>
            </div>
          </div>
          <div class="pack-price-per">
            {{ (p.price / (p.formationsCount || 1)) | number:'1.0-0' }} TND / training
          </div>
          <div class="pack-footer">
            <span class="availability active">✅ Available</span>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && packs.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <h3 *ngIf="search">No packs match "{{ search }}"</h3>
        <h3 *ngIf="!search">No packs available at the moment</h3>
        <p>Check back soon for new training offerings.</p>
        <button *ngIf="search" (click)="search=''; filterPacks()" class="btn-clear">Clear search</button>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <h2>💼 Are you a company?</h2>
        <p>Log in with your HR account to purchase packs and assign trainings to your employees.</p>
        <div class="info-actions">
          <a routerLink="/auth/login" class="cta-btn">Log in →</a>
          <a routerLink="/corporate-home" class="cta-btn secondary">Learn more</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-page { max-width: 1100px; margin: 0 auto; padding: 0 16px; }

    .hero {
      text-align: center; padding: 40px 20px 32px;
    }
    .hero-badge {
      display: inline-block; padding: 6px 16px; border-radius: 20px;
      background: rgba(99,102,241,0.1); color: #6366f1; font-size: 13px;
      font-weight: 600; margin-bottom: 16px;
    }
    :root.dark-mode .hero-badge { background: rgba(99,102,241,0.2); color: #a5b4fc; }
    .hero h1 { font-size: 36px; font-weight: 900; color: var(--text-primary, #0f172a); margin: 0 0 12px; }
    :root.dark-mode .hero h1 { color: #f1f5f9; }
    .grad-text { background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 16px; color: #64748b; max-width: 600px; margin: 0 auto 24px; }

    .search-wrap {
      max-width: 500px; margin: 0 auto; position: relative;
    }
    .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 18px; }
    .search-wrap input {
      width: 100%; padding: 14px 16px 14px 48px; border-radius: 16px; font-size: 15px;
      border: 2px solid #e2e8f0; background: var(--card-bg, #fff); color: var(--text-primary, #0f172a);
      transition: border-color 0.2s;
    }
    :root.dark-mode .search-wrap input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    .search-wrap input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }

    .loading-state { text-align: center; padding: 60px 20px; color: #64748b; }
    .spinner {
      width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .stats-banner {
      display: flex; justify-content: center; align-items: center; gap: 32px;
      padding: 20px; border-radius: 16px; margin-bottom: 24px;
      background: linear-gradient(135deg, #f0f0ff, #e0f2fe);
    }
    :root.dark-mode .stats-banner { background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.08)); }
    .sb-item { text-align: center; }
    .sb-item strong { display: block; font-size: 22px; font-weight: 800; color: var(--text-primary, #0f172a); }
    :root.dark-mode .sb-item strong { color: #f1f5f9; }
    .sb-item span { font-size: 12px; color: #64748b; }
    .sb-divider { width: 1px; height: 36px; background: rgba(0,0,0,0.1); }
    :root.dark-mode .sb-divider { background: rgba(255,255,255,0.1); }

    .sort-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .results-count { font-size: 13px; color: #94a3b8; }
    .sort-btns { display: flex; gap: 8px; }
    .sort-btns button {
      padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
      border: 1.5px solid #e2e8f0; background: var(--card-bg, #fff); color: #64748b;
      cursor: pointer; transition: all 0.2s;
    }
    :root.dark-mode .sort-btns button { background: #1e293b; border-color: #334155; color: #94a3b8; }
    .sort-btns button.active { background: #6366f1; color: #fff; border-color: #6366f1; }

    .packs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .pack-card {
      position: relative; background: var(--card-bg, #fff); border-radius: 20px;
      padding: 28px; border: 1.5px solid rgba(0,0,0,0.06);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.3s;
      animation: fadeInUp 0.4s ease both;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .pack-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
    :root.dark-mode .pack-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .pack-card.featured { border-color: #6366f1; }
    .pack-ribbon {
      position: absolute; top: 16px; right: 16px;
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
    }
    .pack-ribbon.best {
      background: linear-gradient(135deg, #22c55e, #16a34a); right: auto; left: 16px;
    }

    .pack-header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .pack-icon { font-size: 36px; }
    .pack-header h3 { font-size: 20px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .pack-header h3 { color: #f1f5f9; }
    .pack-desc { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 20px; min-height: 44px; }

    .pack-details { display: flex; gap: 24px; margin-bottom: 16px; }
    .detail-item { display: flex; gap: 10px; align-items: center; }
    .detail-icon { font-size: 24px; }
    .detail-item strong { display: block; font-size: 18px; font-weight: 800; color: var(--text-primary, #0f172a); }
    :root.dark-mode .detail-item strong { color: #f1f5f9; }
    .detail-item span { font-size: 12px; color: #94a3b8; }

    .pack-price-per {
      text-align: center; padding: 10px; border-radius: 10px;
      background: #f0f0ff; color: #6366f1; font-size: 14px; font-weight: 700;
      margin-bottom: 16px;
    }
    :root.dark-mode .pack-price-per { background: rgba(99,102,241,0.1); }

    .pack-footer { display: flex; justify-content: center; }
    .availability { font-size: 13px; font-weight: 600; color: #94a3b8; }
    .availability.active { color: #16a34a; }

    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { display: block; font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 8px; }
    :root.dark-mode .empty-state h3 { color: #f1f5f9; }
    .empty-state p { color: #64748b; margin-bottom: 16px; }
    .btn-clear {
      padding: 10px 20px; border-radius: 10px; border: 1.5px solid #6366f1;
      background: transparent; color: #6366f1; font-weight: 600; cursor: pointer;
    }
    .btn-clear:hover { background: #6366f1; color: #fff; }

    .info-section {
      text-align: center; padding: 40px; border-radius: 20px; margin-bottom: 40px;
      background: linear-gradient(135deg, #ede9fe, #dbeafe);
    }
    :root.dark-mode .info-section { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(37,99,235,0.15)); }
    .info-section h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
    :root.dark-mode .info-section h2 { color: #f1f5f9; }
    .info-section p { font-size: 15px; color: #475569; margin-bottom: 20px; }
    :root.dark-mode .info-section p { color: #94a3b8; }
    .info-actions { display: flex; gap: 12px; justify-content: center; }
    .cta-btn {
      display: inline-block; padding: 12px 28px; border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      font-weight: 700; font-size: 15px; text-decoration: none; transition: all 0.2s;
    }
    .cta-btn:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.3); transform: translateY(-2px); }
    .cta-btn.secondary { background: transparent; border: 2px solid #6366f1; color: #6366f1; }
    .cta-btn.secondary:hover { background: #6366f1; color: #fff; }

    @media (max-width: 640px) {
      .hero h1 { font-size: 28px; }
      .stats-banner { flex-direction: column; gap: 16px; }
      .sb-divider { width: 40px; height: 1px; }
      .sort-bar { flex-direction: column; gap: 8px; }
    }
  `]
})
export class CatalogComponent implements OnInit {
  allPacks: Pack[] = [];
  packs: Pack[] = [];
  loading = true;
  search = '';
  sortBy = 'name';
  totalTrainings = 0;
  avgPrice = 0;

  private readonly packIcons = ['📦', '🎯', '🚀', '⚡', '💎', '🌟', '🔥', '🎓', '📊', '🧠'];

  constructor(private packSvc: B2bPackService) {}

  ngOnInit() {
    this.packSvc.getAll().subscribe({
      next: data => {
        this.allPacks = (data || []).filter(p => p.isActive);
        this.totalTrainings = this.allPacks.reduce((s, p) => s + p.formationsCount, 0);
        this.avgPrice = this.allPacks.length > 0
          ? this.allPacks.reduce((s, p) => s + p.price, 0) / this.allPacks.length : 0;
        this.filterPacks();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterPacks() {
    const t = this.search.toLowerCase();
    this.packs = this.allPacks.filter(p =>
      !t || p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t)
    );
    this.applySorting();
  }

  sort(by: string) {
    this.sortBy = by;
    this.applySorting();
  }

  private applySorting() {
    switch (this.sortBy) {
      case 'price': this.packs.sort((a, b) => a.price - b.price); break;
      case 'count': this.packs.sort((a, b) => b.formationsCount - a.formationsCount); break;
      default: this.packs.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
  }

  isBestValue(p: Pack): boolean {
    if (this.packs.length < 2) return false;
    const ratios = this.packs.map(pk => pk.price / (pk.formationsCount || 1));
    const min = Math.min(...ratios);
    return (p.price / (p.formationsCount || 1)) === min && p.formationsCount < 10;
  }

  getPackIcon(p: Pack, idx: number): string {
    return this.packIcons[idx % this.packIcons.length];
  }
}
