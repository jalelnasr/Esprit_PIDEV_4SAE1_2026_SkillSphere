import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2bMissionService } from '../../../../admin/b2b/services/mission.service';
import { B2bContractService } from '../../../../admin/b2b/services/contract.service';
import { MissionApplication, Contract } from '../../../../admin/b2b/models/b2b.models';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="applications-page">
      <div class="page-header">
        <div class="header-content">
          <a routerLink="/freelance" class="back-link">← Back to missions</a>
          <h1>📋 Mes Candidatures</h1>
          <p class="subtitle">Suivez l'état de toutes vos candidatures aux missions freelance</p>
        </div>
      </div>

      <div class="stats-cards" *ngIf="!loading">
        <div class="stat-card">
          <div class="stat-icon pending">📤</div>
          <div class="stat-content">
            <div class="stat-value">{{ getCountByStatus('PENDING') }}</div>
            <div class="stat-label">En attente</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon accepted">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ getCountByStatus('ACCEPTED') }}</div>
            <div class="stat-label">Acceptées</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rejected">❌</div>
          <div class="stat-content">
            <div class="stat-value">{{ getCountByStatus('REJECTED') }}</div>
            <div class="stat-label">Refusées</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ applications.length }}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="filterApplications()"
            placeholder="Rechercher par titre de mission ou entreprise...">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filterApplications()" class="filter-select">
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="ACCEPTED">Acceptées</option>
          <option value="REJECTED">Refusées</option>
        </select>
        <select [(ngModel)]="sortBy" (ngModelChange)="sortApplications()" class="filter-select">
          <option value="date-desc">Plus récentes</option>
          <option value="date-asc">Plus anciennes</option>
          <option value="rate-desc">Taux décroissant</option>
          <option value="rate-asc">Taux croissant</option>
          <option value="match-desc">Meilleur match</option>
        </select>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement de vos candidatures...</p>
      </div>

      <div class="applications-list" *ngIf="!loading && filteredApplications.length > 0">
        <div *ngFor="let app of filteredApplications" class="application-card">
          <div class="card-header">
            <div class="mission-info">
              <h3>{{ app.missionTitle }}</h3>
              <p class="company-name">🏢 {{ getCompanyName(app) }}</p>
            </div>
            <span class="status-badge" [ngClass]="getStatusClass(app.status)">
              {{ getStatusLabel(app.status) }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">💰 Taux proposé</span>
                <span class="info-value">{{ app.proposedRate }} TND/jour</span>
              </div>
              <div class="info-item">
                <span class="info-label">📊 Score de match</span>
                <span class="info-value">
                  <span class="match-score" [ngClass]="getMatchClass(app.matchScore)">
                    {{ app.matchScore }}%
                  </span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 Date de candidature</span>
                <span class="info-value">{{ formatDate(app.appliedAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">👤 Votre profil</span>
                <span class="info-value">{{ app.candidateName }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <a [routerLink]="['/freelance', getMissionId(app)]" class="btn btn-secondary">
              Voir la mission
            </a>
            <button 
              *ngIf="app.status === 'ACCEPTED' && hasContract(app)" 
              (click)="viewContract(app)"
              class="btn btn-contract">
              📄 Voir le contrat
            </button>
            <button 
              *ngIf="app.status === 'PENDING'" 
              (click)="cancelApplication(app)"
              class="btn btn-danger">
              Annuler la candidature
            </button>
            <div class="status-message" *ngIf="app.status === 'ACCEPTED' && !hasContract(app)">
              🎉 Félicitations! L'entreprise vous contactera bientôt.
            </div>
            <div class="status-message" *ngIf="app.status === 'ACCEPTED' && hasContract(app)">
              ✅ Contrat disponible - Cliquez pour voir les détails
            </div>
            <div class="status-message rejected" *ngIf="app.status === 'REJECTED'">
              Malheureusement, votre candidature n'a pas été retenue.
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && filteredApplications.length === 0 && applications.length > 0">
        <div class="empty-icon">🔍</div>
        <h3>Aucune candidature trouvée</h3>
        <p>Essayez de modifier vos filtres de recherche</p>
        <button (click)="clearFilters()" class="btn btn-primary">Réinitialiser les filtres</button>
      </div>

      <div class="empty-state" *ngIf="!loading && applications.length === 0">
        <div class="empty-icon">📭</div>
        <h3>Aucune candidature pour le moment</h3>
        <p>Vous n'avez pas encore postulé à des missions freelance</p>
        <a routerLink="/freelance" class="btn btn-primary">Parcourir les missions</a>
      </div>

      <!-- Modal pour afficher le contrat -->
      <div class="modal-overlay" *ngIf="showContractModal" (click)="closeContractModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📄 Détails du Contrat</h2>
            <button class="close-btn" (click)="closeContractModal()">✕</button>
          </div>

          <div class="modal-body" *ngIf="selectedContract">
            <div class="contract-header">
              <div class="contract-number">
                <span class="label">Numéro de contrat</span>
                <span class="value">{{ selectedContract.contractNumber }}</span>
              </div>
              <span class="status-badge" [ngClass]="getContractStatusClass(selectedContract.status)">
                {{ getContractStatusLabel(selectedContract.status) }}
              </span>
            </div>

            <div class="contract-info-grid">
              <div class="contract-info-item">
                <span class="label">🏢 Entreprise</span>
                <span class="value">{{ selectedContract.companyName }}</span>
              </div>
              <div class="contract-info-item">
                <span class="label">💰 Montant</span>
                <span class="value">{{ selectedContract.amount }} TND</span>
              </div>
              <div class="contract-info-item">
                <span class="label">📅 Date de début</span>
                <span class="value">{{ formatDate(selectedContract.startDate) }}</span>
              </div>
              <div class="contract-info-item">
                <span class="label">📅 Date de fin</span>
                <span class="value">{{ formatDate(selectedContract.endDate) }}</span>
              </div>
            </div>

            <div class="contract-terms" *ngIf="selectedContract.terms">
              <h3>📋 Termes du contrat</h3>
              <div class="terms-content">{{ selectedContract.terms }}</div>
            </div>

            <div class="contract-dates">
              <div class="date-item" *ngIf="selectedContract.signedAt">
                <span class="label">✍️ Signé le</span>
                <span class="value">{{ formatDate(selectedContract.signedAt) }}</span>
              </div>
            </div>

            <div class="signature-section" *ngIf="selectedContract.signatureData">
              <h3>✍️ Signature du RH</h3>
              <div class="signature-image-container">
                <img [src]="selectedContract.signatureData" alt="Signature RH" class="signature-image">
              </div>
            </div>

            <div class="contract-url" *ngIf="selectedContract.contractUrl">
              <a [href]="selectedContract.contractUrl" target="_blank" class="btn btn-primary">
                📥 Télécharger le contrat PDF
              </a>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeContractModal()">
              Fermer
            </button>
          </div>
        </div>
      </div>

      <!-- Composant de signature (retiré car c'est le RH qui signe) -->
    </div>
  `,
  styles: [`
    .applications-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px 60px;
    }

    .page-header {
      margin: 32px 0 28px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6366f1;
      font-weight: 700;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .page-header h1 {
      font-size: clamp(2rem, 4vw, 2.5rem);
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }

    :root.dark-mode .page-header h1 {
      color: #f8fafc;
    }

    .subtitle {
      color: #64748b;
      font-size: 15px;
      margin: 0;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(15,23,42,0.08);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(15,23,42,0.04);
      transition: all 0.2s ease;
    }

    :root.dark-mode .stat-card {
      background: rgba(15,23,42,0.82);
      border-color: rgba(148,163,184,0.14);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(15,23,42,0.08);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-icon.pending {
      background: rgba(59,130,246,0.12);
    }

    .stat-icon.accepted {
      background: rgba(34,197,94,0.12);
    }

    .stat-icon.rejected {
      background: rgba(239,68,68,0.12);
    }

    .stat-icon.total {
      background: rgba(168,85,247,0.12);
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      line-height: 1;
      margin-bottom: 4px;
    }

    :root.dark-mode .stat-value {
      color: #f8fafc;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filters-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 280px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
    }

    .search-box input {
      width: 100%;
      padding: 12px 14px 12px 42px;
      border-radius: 14px;
      font-size: 14px;
      border: 1.5px solid #e2e8f0;
      background: rgba(255,255,255,0.92);
      color: var(--text-primary, #0f172a);
      transition: all 0.2s ease;
    }

    :root.dark-mode .search-box input {
      background: rgba(15,23,42,0.92);
      border-color: #334155;
      color: #e2e8f0;
    }

    .search-box input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
    }

    .filter-select {
      padding: 12px 16px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      border: 1.5px solid #e2e8f0;
      background: rgba(255,255,255,0.92);
      color: var(--text-primary, #0f172a);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :root.dark-mode .filter-select {
      background: rgba(15,23,42,0.92);
      border-color: #334155;
      color: #e2e8f0;
    }

    .filter-select:focus {
      outline: none;
      border-color: #6366f1;
    }

    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .application-card {
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(15,23,42,0.08);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(15,23,42,0.04);
      transition: all 0.2s ease;
    }

    :root.dark-mode .application-card {
      background: rgba(15,23,42,0.82);
      border-color: rgba(148,163,184,0.14);
    }

    .application-card:hover {
      box-shadow: 0 8px 24px rgba(15,23,42,0.08);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(148,163,184,0.16);
    }

    .mission-info h3 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 6px;
    }

    :root.dark-mode .mission-info h3 {
      color: #f8fafc;
    }

    .company-name {
      color: #64748b;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-badge.pending {
      background: rgba(59,130,246,0.14);
      color: #1d4ed8;
    }

    .status-badge.accepted {
      background: rgba(34,197,94,0.14);
      color: #15803d;
    }

    .status-badge.rejected {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    :root.dark-mode .status-badge.pending {
      color: #93c5fd;
    }

    :root.dark-mode .status-badge.accepted {
      color: #4ade80;
    }

    :root.dark-mode .status-badge.rejected {
      color: #fca5a5;
    }

    .card-body {
      margin-bottom: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .info-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .info-value {
      color: #e2e8f0;
    }

    .match-score {
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
    }

    .match-score.excellent {
      background: rgba(34,197,94,0.14);
      color: #15803d;
    }

    .match-score.good {
      background: rgba(59,130,246,0.14);
      color: #1d4ed8;
    }

    .match-score.average {
      background: rgba(245,158,11,0.14);
      color: #b45309;
    }

    .match-score.low {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    .card-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      border: none;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(99,102,241,0.24);
    }

    .btn-secondary {
      background: transparent;
      border: 1.5px solid #cbd5e1;
      color: #475569;
    }

    :root.dark-mode .btn-secondary {
      border-color: #475569;
      color: #cbd5e1;
    }

    .btn-secondary:hover {
      background: rgba(99,102,241,0.08);
      border-color: #6366f1;
      color: #6366f1;
    }

    .btn-danger {
      background: rgba(239,68,68,0.12);
      color: #b91c1c;
      border: 1px solid rgba(239,68,68,0.24);
    }

    .btn-danger:hover {
      background: rgba(239,68,68,0.18);
    }

    .btn-contract {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
    }

    .btn-contract:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(99,102,241,0.24);
    }

    .status-message {
      flex: 1;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      background: rgba(34,197,94,0.12);
      color: #15803d;
    }

    .status-message.rejected {
      background: rgba(239,68,68,0.12);
      color: #b91c1c;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #64748b;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 8px;
    }

    :root.dark-mode .empty-state h3 {
      color: #f8fafc;
    }

    .empty-state p {
      font-size: 15px;
      margin: 0 0 24px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: var(--card-bg, #fff);
      border-radius: 20px;
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    :root.dark-mode .modal-content {
      background: #1e293b;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(148,163,184,0.16);
    }

    .modal-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    :root.dark-mode .modal-header h2 {
      color: #f8fafc;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(148,163,184,0.12);
      color: #64748b;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    .modal-body {
      padding: 24px;
    }

    .contract-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(148,163,184,0.16);
    }

    .contract-number {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .contract-number .label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .contract-number .value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .contract-number .value {
      color: #f8fafc;
    }

    .contract-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .contract-info-item {
      padding: 16px;
      border-radius: 14px;
      background: rgba(148,163,184,0.08);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    :root.dark-mode .contract-info-item {
      background: rgba(148,163,184,0.12);
    }

    .contract-info-item .label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .contract-info-item .value {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .contract-info-item .value {
      color: #e2e8f0;
    }

    .contract-terms {
      margin-bottom: 24px;
    }

    .contract-terms h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 12px;
    }

    :root.dark-mode .contract-terms h3 {
      color: #f8fafc;
    }

    .terms-content {
      padding: 16px;
      border-radius: 14px;
      background: rgba(148,163,184,0.08);
      color: #475569;
      line-height: 1.7;
      white-space: pre-wrap;
      font-size: 14px;
    }

    :root.dark-mode .terms-content {
      background: rgba(148,163,184,0.12);
      color: #94a3b8;
    }

    .contract-dates {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .date-item {
      flex: 1;
      min-width: 200px;
      padding: 12px 16px;
      border-radius: 12px;
      background: rgba(99,102,241,0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    :root.dark-mode .date-item {
      background: rgba(99,102,241,0.12);
    }

    .date-item .label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
    }

    .date-item .value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .date-item .value {
      color: #e2e8f0;
    }

    .contract-url {
      text-align: center;
    }

    .signature-section {
      margin-bottom: 24px;
      padding: 20px;
      border-radius: 14px;
      background: rgba(99,102,241,0.08);
      border: 2px solid rgba(99,102,241,0.2);
    }

    :root.dark-mode .signature-section {
      background: rgba(99,102,241,0.12);
    }

    .signature-section h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 16px;
      text-align: center;
    }

    :root.dark-mode .signature-section h3 {
      color: #f8fafc;
    }

    .signature-image-container {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 150px;
      border: 2px dashed rgba(99,102,241,0.3);
    }

    :root.dark-mode .signature-image-container {
      background: rgba(15,23,42,0.4);
    }

    .signature-image {
      max-width: 100%;
      max-height: 200px;
      height: auto;
      display: block;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid rgba(148,163,184,0.16);
    }

    .status-badge.draft {
      background: rgba(148,163,184,0.14);
      color: #475569;
    }

    .status-badge.signed {
      background: rgba(34,197,94,0.14);
      color: #15803d;
    }

    .status-badge.active {
      background: rgba(59,130,246,0.14);
      color: #1d4ed8;
    }

    .status-badge.completed {
      background: rgba(168,85,247,0.14);
      color: #7e22ce;
    }

    .status-badge.terminated,
    .status-badge.cancelled {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    @media (max-width: 768px) {
      .applications-page {
        padding: 0 12px 40px;
      }

      .stats-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-bar {
        flex-direction: column;
      }

      .search-box {
        min-width: 100%;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .card-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .btn {
        justify-content: center;
      }

      .contract-info-grid {
        grid-template-columns: 1fr;
      }

      .contract-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class MyApplicationsComponent implements OnInit {
  applications: MissionApplication[] = [];
  filteredApplications: MissionApplication[] = [];
  contracts: Contract[] = [];
  contractsByMission: Map<number, Contract> = new Map();
  loading = true;
  searchTerm = '';
  statusFilter = '';
  sortBy = 'date-desc';
  candidateId: number | null = null;
  
  showContractModal = false;
  selectedContract: Contract | null = null;

  constructor(
    private missionService: B2bMissionService,
    private contractService: B2bContractService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.idUser) {
        this.candidateId = user.idUser;
        this.loadApplications();
      }
    });
  }

  loadApplications() {
    if (!this.candidateId) return;

    this.missionService.getApplicationsByCandidate(this.candidateId).subscribe({
      next: (data) => {
        this.applications = data || [];
        this.filterApplications();
        this.loadContracts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadContracts() {
    if (!this.candidateId) return;

    this.contractService.getByCandidate(this.candidateId).subscribe({
      next: (contracts) => {
        this.contracts = contracts || [];
        this.contractsByMission.clear();
        this.contracts.forEach(contract => {
          this.contractsByMission.set(contract.missionId, contract);
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  hasContract(app: MissionApplication): boolean {
    return this.contractsByMission.has(app.missionId);
  }

  getContract(app: MissionApplication): Contract | undefined {
    return this.contractsByMission.get(app.missionId);
  }

  viewContract(app: MissionApplication) {
    const contract = this.getContract(app);
    if (contract) {
      this.selectedContract = contract;
      this.showContractModal = true;
    }
  }

  closeContractModal() {
    this.showContractModal = false;
    this.selectedContract = null;
  }

  getContractStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'PENDING': 'En attente',
      'SIGNED': 'Signé',
      'ACTIVE': 'Actif',
      'COMPLETED': 'Terminé',
      'TERMINATED': 'Résilié',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  getContractStatusClass(status: string): string {
    return status.toLowerCase();
  }

  filterApplications() {
    let filtered = [...this.applications];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.missionTitle?.toLowerCase().includes(term) ||
        this.getCompanyName(app).toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

    this.filteredApplications = filtered;
    this.sortApplications();
  }

  sortApplications() {
    switch (this.sortBy) {
      case 'date-desc':
        this.filteredApplications.sort((a, b) => 
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
        break;
      case 'date-asc':
        this.filteredApplications.sort((a, b) => 
          new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
        );
        break;
      case 'rate-desc':
        this.filteredApplications.sort((a, b) => b.proposedRate - a.proposedRate);
        break;
      case 'rate-asc':
        this.filteredApplications.sort((a, b) => a.proposedRate - b.proposedRate);
        break;
      case 'match-desc':
        this.filteredApplications.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }
  }

  getCountByStatus(status: string): number {
    return this.applications.filter(app => app.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'ACCEPTED': 'Acceptée',
      'REJECTED': 'Refusée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getMatchClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'low';
  }

  getCompanyName(app: MissionApplication): string {
    return (app as any).companyName || 'Entreprise';
  }

  getMissionId(app: MissionApplication): number {
    return app.missionId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'date-desc';
    this.filterApplications();
  }

  cancelApplication(app: MissionApplication) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette candidature?')) {
      return;
    }

    this.missionService.deleteApplication(app.id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== app.id);
        this.filterApplications();
      },
      error: (err) => {
        console.error('Error canceling application:', err);
        alert('Erreur lors de l\'annulation de la candidature');
      }
    });
  }
}
