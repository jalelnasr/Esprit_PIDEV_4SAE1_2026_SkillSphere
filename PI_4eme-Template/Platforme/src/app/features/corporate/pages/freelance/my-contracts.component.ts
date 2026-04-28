import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { B2bContractService } from '../../../../admin/b2b/services/contract.service';
import { Contract } from '../../../../admin/b2b/models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-contracts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="contracts-page">
      <div class="page-header">
        <h1>📄 Mes Contrats</h1>
        <p>Contrats de missions freelance</p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement des contrats...</p>
      </div>

      <div class="contracts-grid" *ngIf="!loading">
        <div class="contract-card" *ngFor="let contract of contracts">
          <div class="contract-header">
            <div class="contract-info">
              <h3>{{ contract.missionTitle }}</h3>
              <p class="contract-number">{{ contract.contractNumber }}</p>
              <p class="company-name">{{ contract.companyName }}</p>
            </div>
            <span class="status-badge" [ngClass]="'status-' + contract.status.toLowerCase()">
              {{ getStatusLabel(contract.status) }}
            </span>
          </div>

          <div class="contract-details">
            <div class="detail-item">
              <span class="detail-icon">💰</span>
              <div class="detail-content">
                <span class="detail-label">Montant total</span>
                <span class="detail-value">{{ contract.amount | number:'1.2-2' }} €</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📅</span>
              <div class="detail-content">
                <span class="detail-label">Période</span>
                <span class="detail-value">
                  {{ contract.startDate | date:'dd/MM/yyyy' }} - {{ contract.endDate | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
          </div>

          <div class="contract-actions">
            <a 
              [routerLink]="['/corporate/contracts', contract.id, 'view']" 
              class="btn-view">
              👁️ Voir le contrat
            </a>
          </div>

          <div class="contract-status-info">
            <div class="status-message signed" *ngIf="contract.status === 'SIGNED'">
              <span class="status-icon">✅</span>
              <span>Contrat signé par l'entreprise le {{ contract.signedAt | date:'dd/MM/yyyy à HH:mm' }}</span>
            </div>
            <div class="status-message pending" *ngIf="contract.status === 'DRAFT'">
              <span class="status-icon">⏳</span>
              <span>Contrat en préparation par l'entreprise</span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && contracts.length === 0">
        <div class="empty-icon">📄</div>
        <h3>Aucun contrat</h3>
        <p>Vous n'avez pas encore de contrat de mission freelance.</p>
      </div>
    </div>
  `,
  styles: [`
    .contracts-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: var(--text-primary, #0f172a);
    }

    .page-header p {
      margin: 0;
      color: #64748b;
      font-size: 16px;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(99, 102, 241, 0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .contracts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .contract-card {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .contract-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .contract-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .contract-info h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .contract-number {
      margin: 0 0 4px 0;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .company-name {
      margin: 0;
      font-size: 14px;
      color: #6366f1;
      font-weight: 600;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-badge.status-draft {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    .status-badge.status-signed {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .status-badge.status-active {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }

    .status-badge.status-completed {
      background: rgba(168, 85, 247, 0.15);
      color: #a855f7;
    }

    .contract-details {
      display: grid;
      gap: 16px;
      margin-bottom: 20px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(99, 102, 241, 0.05);
      border-radius: 12px;
    }

    .detail-icon {
      font-size: 24px;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .detail-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }

    .detail-value {
      font-size: 14px;
      color: var(--text-primary, #0f172a);
      font-weight: 700;
    }

    .contract-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .btn-view {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s ease;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 2px solid rgba(99, 102, 241, 0.2);
    }

    .btn-view:hover {
      background: rgba(99, 102, 241, 0.15);
      transform: translateY(-2px);
    }

    .contract-status-info {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding-top: 16px;
    }

    .status-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
    }

    .status-message.pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .status-message.signed {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .status-icon {
      font-size: 18px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: var(--text-primary, #0f172a);
    }

    .empty-state p {
      margin: 0;
      color: #64748b;
      font-size: 15px;
    }

    @media (max-width: 768px) {
      .contracts-page {
        padding: 16px;
      }

      .contracts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyContractsComponent implements OnInit {
  contracts: Contract[] = [];
  loading = true;
  private currentUserId: number | null = null;

  constructor(
    private contractSvc: B2bContractService,
    private authSvc: AuthService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
      if (this.currentUserId) {
        this.loadMyContracts();
      }
    });
  }

  loadMyContracts() {
    if (!this.currentUserId) return;
    
    this.loading = true;
    // Supposons qu'il y a un endpoint pour récupérer les contrats par candidat
    this.contractSvc.getByCandidate(this.currentUserId).subscribe({
      next: (contracts) => {
        this.contracts = contracts || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'SIGNED': 'Signé',
      'ACTIVE': 'Actif',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }
}