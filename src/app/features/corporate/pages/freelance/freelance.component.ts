import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { B2bMissionService } from '../../../../admin/b2b/services/mission.service';
import { B2bContractService } from '../../../../admin/b2b/services/contract.service';
import { Mission, MissionApplication, Contract } from '../../../../admin/b2b/models/b2b.models';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-freelance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="freelance-page">
      <section class="hero-shell">
        <div class="hero-copy">
          <div class="hero-badge">Freelance space</div>
          <h1>Find a mission that matches your level and your rhythm.</h1>
          <p>
            Browse open freelance missions, filter by skill, and apply with a profile that feels
            clear, fast, and professional.
          </p>
          <div class="hero-actions">
            <a routerLink="/freelance" class="primary-action">Explore missions</a>
            <span class="secondary-note">{{ missions.length }} missions loaded</span>
          </div>
        </div>

        <div class="hero-metrics">
          <div class="metric-card">
            <span class="metric-label">Open missions</span>
            <strong>{{ filtered.length }}</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">Skills available</span>
            <strong>{{ allSkills.length }}</strong>
          </div>
          <div class="metric-card accent">
            <span class="metric-label">Focus</span>
            <strong>Remote-ready</strong>
          </div>
        </div>
      </section>

      <div class="content-shell">
        <!-- Tabs Navigation -->
        <div class="tabs-navigation">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'available'"
            (click)="switchTab('available')">
            🔍 Missions disponibles
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'applications'"
            (click)="switchTab('applications')">
            📋 My Applications ({{ myApplications.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'contracts'"
            (click)="switchTab('contracts')">
            📄 My Contracts ({{ myContracts.length }})
          </button>
        </div>

        <!-- Available Missions Tab -->
        <div *ngIf="activeTab === 'available'">
          <div class="loading-state" *ngIf="loading">
            <div class="spinner"></div>
            <p>Loading missions...</p>
          </div>

          <ng-container *ngIf="!loading">
            <section class="filters-panel">
              <div class="filters-header">
                <div>
                  <h2>New missions</h2>
                  <p>Missions you haven't applied to yet.</p>
                </div>
                <span class="results-count">{{ filtered.length }} mission(s) disponible(s)</span>
              </div>

              <div class="filters-bar">
                <label class="search-box">
                  <span class="si">Rechercher</span>
                  <input
                    type="text"
                    [(ngModel)]="search"
                    (ngModelChange)="filter()"
                    placeholder="Titre de mission, entreprise, compétence..."
                  >
                </label>

                <label class="filter-group">
                  <span class="field-label">Compétence</span>
                  <select [(ngModel)]="skillFilter" (ngModelChange)="filter()" class="filter-select">
                    <option value="">Toutes les compétences</option>
                    <option *ngFor="let s of allSkills" [value]="s">{{ s }}</option>
                  </select>
                </label>
              </div>
            </section>

            <section *ngIf="filtered.length > 0; else emptyState" class="missions-grid">
              <article *ngFor="let m of filtered; trackBy: trackByMissionId" class="mission-card">
                <div class="mission-card-top">
                  <div class="mission-icon">FM</div>
                  <span class="status-pill" [ngClass]="statusClass(m.status)">{{ statusLabel(m.status) }}</span>
                </div>

                <div class="mission-heading">
                  <h3>{{ m.title }}</h3>
                  <p class="company-name">{{ m.companyName }}</p>
                </div>

                <p class="mission-desc">
                  {{ m.description | slice:0:155 }}{{ (m.description.length || 0) > 155 ? '...' : '' }}
                </p>

                <div class="mission-meta">
                  <div class="meta-item">
                    <span class="meta-label">Budget</span>
                    <strong>{{ missionBudget(m) }}</strong>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Duration</span>
                    <strong>{{ m.durationWeeks }} weeks</strong>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Applications</span>
                    <strong>{{ m.applicationCount }}</strong>
                  </div>
                </div>

                <div class="mission-skills" *ngIf="m.requiredSkills">
                  <span *ngFor="let s of parseSkills(m.requiredSkills).slice(0, 4)" class="skill">{{ s }}</span>
                  <span *ngIf="parseSkills(m.requiredSkills).length > 4" class="skill more">+{{ parseSkills(m.requiredSkills).length - 4 }}</span>
                </div>

                <div class="mission-footer">
                  <span class="posted-note">Open for freelance applications</span>
                  <a [routerLink]="['/freelance', m.id]" class="view-btn">View details</a>
                </div>
              </article>
            </section>

            <ng-template #emptyState>
              <div class="empty-state">
                <div class="empty-icon">FM</div>
                <h3>No new missions</h3>
                <p>You have already applied to all available missions. Check the "My Applications" tab to see your current applications.</p>
                <button class="btn-browse" (click)="switchTab('applications')" style="margin-top: 16px; padding: 10px 16px; border: none; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; font-weight: 700; cursor: pointer;">
                  📋 View my applications
                </button>
              </div>
            </ng-template>
          </ng-container>
        </div>

        <!-- My Applications Tab -->
        <div *ngIf="activeTab === 'applications'">
          <div class="loading-state" *ngIf="loadingApplications">
            <div class="spinner"></div>
            <p>Loading your applications...</p>
          </div>

          <div *ngIf="!loadingApplications">
            <section class="applications-panel">
              <div class="applications-header">
                <div>
                  <h2>My Applications</h2>
                  <p>Track the status of your freelance mission applications.</p>
                </div>
                <span class="results-count">{{ myApplications.length }} application(s)</span>
              </div>

              <!-- Applications Grid -->
              <div class="applications-grid" *ngIf="myApplications.length > 0">
                <article *ngFor="let app of myApplications" class="application-card">
                  <div class="application-header">
                    <div class="mission-info">
                      <h3>{{ app.missionTitle }}</h3>
                      <p class="company-name">{{ getCompanyName(app.missionId) }}</p>
                    </div>
                    <span class="app-status-badge" [ngClass]="'status-' + app.status.toLowerCase()">
                      {{ getApplicationStatusLabel(app.status) }}
                    </span>
                  </div>

                  <div class="application-details">
                    <div class="detail-row">
                      <div class="detail-item">
                        <span class="detail-icon">💰</span>
                        <div class="detail-content">
                          <span class="detail-label">Proposed rate</span>
                          <span class="detail-value">{{ app.proposedRate | number:'1.0-0' }} €/day</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <div class="detail-content">
                          <span class="detail-label">Application sent</span>
                          <span class="detail-value">{{ app.appliedAt | date:'dd/MM/yyyy' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="application-actions">
                    <button (click)="openMissionModal(app.missionId)" class="btn-view-mission">
                      👁️ View mission
                    </button>
                    <div class="status-info">
                      <div class="status-message" [ngClass]="'status-' + app.status.toLowerCase()">
                        <span class="status-icon">{{ getStatusIcon(app.status) }}</span>
                        <span class="status-text">{{ getStatusMessage(app.status) }}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Empty State for Applications -->
              <div class="empty-state" *ngIf="myApplications.length === 0">
                <div class="empty-icon">📭</div>
                <h3>No applications</h3>
                <p>You haven't applied to any freelance missions yet.</p>
                <button class="btn-browse" (click)="switchTab('available')">
                  🔍 Browse missions
                </button>
              </div>
            </section>
          </div>
        </div>

        <!-- My Contracts Tab -->
        <div *ngIf="activeTab === 'contracts'">
          <div class="loading-state" *ngIf="loadingContracts">
            <div class="spinner"></div>
            <p>Loading your contracts...</p>
          </div>

          <div *ngIf="!loadingContracts">
            <section class="contracts-panel">
              <div class="contracts-header">
                <div>
                  <h2>My Contracts</h2>
                  <p>View and manage your signed contracts with complete details.</p>
                </div>
                <span class="results-count">{{ myContracts.length }} contract(s)</span>
              </div>

              <!-- Contracts Grid -->
              <div class="contracts-grid" *ngIf="myContracts.length > 0">
                <article *ngFor="let contract of myContracts" class="contract-card">
                  <div class="contract-header">
                    <div class="contract-info">
                      <h3>{{ contract.missionTitle }}</h3>
                      <p class="company-name">{{ contract.companyName }}</p>
                      <p class="contract-number">Contract #{{ contract.contractNumber }}</p>
                    </div>
                    <span class="contract-status-badge" [ngClass]="getContractStatusClass(contract.status)">
                      {{ getContractStatusIcon(contract.status) }} {{ getContractStatusLabel(contract.status) }}
                    </span>
                  </div>

                  <div class="contract-details">
                    <div class="detail-row">
                      <div class="detail-item">
                        <span class="detail-icon">💰</span>
                        <div class="detail-content">
                          <span class="detail-label">Total Amount</span>
                          <span class="detail-value">{{ contract.amount | number:'1.0-0' }} €</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <div class="detail-content">
                          <span class="detail-label">Duration</span>
                          <span class="detail-value">{{ formatContractDuration(contract.startDate, contract.endDate) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-item">
                        <span class="detail-icon">🗓️</span>
                        <div class="detail-content">
                          <span class="detail-label">Start Date</span>
                          <span class="detail-value">{{ contract.startDate | date:'dd/MM/yyyy' }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <span class="detail-icon">🏁</span>
                        <div class="detail-content">
                          <span class="detail-label">End Date</span>
                          <span class="detail-value">{{ contract.endDate | date:'dd/MM/yyyy' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="detail-row" *ngIf="contract.signedAt">
                      <div class="detail-item">
                        <span class="detail-icon">✍️</span>
                        <div class="detail-content">
                          <span class="detail-label">Signed On</span>
                          <span class="detail-value">{{ contract.signedAt | date:'dd/MM/yyyy at HH:mm' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="contract-actions">
                    <button class="btn-view-contract" *ngIf="contract.status === 'SIGNED'" (click)="viewFullContract(contract)">
                      📄 View Full Contract
                    </button>
                    <button class="btn-download-contract" *ngIf="contract.status === 'SIGNED'" (click)="downloadContract(contract)">
                      📥 Download PDF
                    </button>
                    <div class="contract-status-info">
                      <div class="status-message" [ngClass]="getContractStatusClass(contract.status)">
                        <span class="status-icon">{{ getContractStatusIcon(contract.status) }}</span>
                        <span class="status-text" *ngIf="contract.status === 'SIGNED'">Contract is active and ready</span>
                        <span class="status-text" *ngIf="contract.status === 'DRAFT'">Waiting for HR signature</span>
                        <span class="status-text" *ngIf="contract.status === 'ACTIVE'">Contract is currently active</span>
                        <span class="status-text" *ngIf="contract.status === 'COMPLETED'">Contract has been completed</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Empty State for Contracts -->
              <div class="empty-state" *ngIf="myContracts.length === 0">
                <div class="empty-icon">📄</div>
                <h3>No contracts yet</h3>
                <p>You don't have any contracts yet. Apply to missions and get accepted to receive contracts.</p>
                <button class="btn-browse" (click)="switchTab('available')">
                  🔍 Browse missions
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Mission Details Modal -->
      <div class="modal-overlay" *ngIf="showMissionModal" (click)="closeMissionModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Mission Details</h2>
            <button class="modal-close" (click)="closeMissionModal()">✕</button>
          </div>

          <div class="modal-body" *ngIf="selectedMission">
            <div class="mission-detail-section">
              <div class="mission-detail-header">
                <div class="mission-icon-large">FM</div>
                <div>
                  <h3>{{ selectedMission.title }}</h3>
                  <p class="company-name">{{ selectedMission.companyName }}</p>
                </div>
                <span class="status-pill" [ngClass]="'status-' + selectedMission.status.toLowerCase()">
                  {{ statusLabel(selectedMission.status) }}
                </span>
              </div>

              <div class="mission-detail-grid">
                <div class="detail-box">
                  <span class="detail-icon">💰</span>
                  <div>
                    <span class="detail-label">Daily rate</span>
                    <strong>{{ selectedMission.dailyRate | number:'1.0-0' }} €/day</strong>
                  </div>
                </div>
                <div class="detail-box">
                  <span class="detail-icon">📅</span>
                  <div>
                    <span class="detail-label">Duration</span>
                    <strong>{{ selectedMission.durationWeeks }} weeks</strong>
                  </div>
                </div>
                <div class="detail-box">
                  <span class="detail-icon">👥</span>
                  <div>
                    <span class="detail-label">Candidatures</span>
                    <strong>{{ selectedMission.applicationCount }}</strong>
                  </div>
                </div>
              </div>

              <div class="mission-description">
                <h4>Mission Description</h4>
                <p>{{ selectedMission.description }}</p>
              </div>

              <div class="mission-skills" *ngIf="selectedMission.requiredSkills">
                <h4>Required Skills</h4>
                <div class="skills-list">
                  <span *ngFor="let skill of parseSkills(selectedMission.requiredSkills)" class="skill-tag">
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-loading" *ngIf="loadingMissionDetails">
            <div class="spinner"></div>
            <p>Chargement des détails...</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .freelance-page {
      position: relative;
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 16px 56px;
    }

    .freelance-page::before {
      content: '';
      position: absolute;
      inset: 0 auto auto 50%;
      width: min(960px, 92vw);
      height: 320px;
      transform: translateX(-50%);
      background: radial-gradient(circle at top, rgba(245,158,11,0.18), transparent 66%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-shell,
    .content-shell {
      position: relative;
      z-index: 1;
    }

    .hero-shell {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.85fr);
      gap: 20px;
      align-items: stretch;
      padding: 32px 0 24px;
    }

    .hero-copy,
    .hero-metrics,
    .filters-panel,
    .mission-card,
    .empty-state {
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(15,23,42,0.08);
      box-shadow: 0 18px 50px rgba(15,23,42,0.06);
      backdrop-filter: blur(14px);
    }

    :root.dark-mode .hero-copy,
    :root.dark-mode .hero-metrics,
    :root.dark-mode .filters-panel,
    :root.dark-mode .mission-card,
    :root.dark-mode .empty-state {
      background: rgba(15,23,42,0.82);
      border-color: rgba(148,163,184,0.14);
      box-shadow: 0 22px 50px rgba(2,6,23,0.32);
    }

    .hero-copy {
      border-radius: 28px;
      padding: 30px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      padding: 7px 14px;
      border-radius: 999px;
      background: rgba(245,158,11,0.12);
      color: #b45309;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    :root.dark-mode .hero-badge {
      background: rgba(245,158,11,0.18);
      color: #fbbf24;
    }

    .hero-copy h1 {
      margin: 0 0 14px;
      font-size: clamp(2rem, 4vw, 3.5rem);
      line-height: 1.02;
      color: var(--text-primary, #0f172a);
      letter-spacing: -0.04em;
      max-width: 12ch;
    }

    :root.dark-mode .hero-copy h1 { color: #f8fafc; }

    .hero-copy p {
      margin: 0;
      max-width: 60ch;
      color: #64748b;
      font-size: 16px;
      line-height: 1.7;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 24px;
      flex-wrap: wrap;
    }

    .primary-action,
    .view-btn {
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .primary-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 18px;
      border-radius: 14px;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: #fff;
      font-weight: 700;
      box-shadow: 0 14px 28px rgba(245,158,11,0.24);
    }

    .primary-action:hover { transform: translateY(-1px); box-shadow: 0 18px 30px rgba(245,158,11,0.3); }

    .secondary-note {
      color: #64748b;
      font-size: 14px;
      font-weight: 600;
    }

    .hero-metrics {
      border-radius: 28px;
      padding: 20px;
      display: grid;
      gap: 14px;
      align-content: stretch;
    }

    .metric-card {
      border-radius: 22px;
      padding: 18px 18px 20px;
      background: rgba(255,255,255,0.65);
      border: 1px solid rgba(15,23,42,0.08);
    }

    :root.dark-mode .metric-card {
      background: rgba(15,23,42,0.56);
      border-color: rgba(148,163,184,0.14);
    }

    .metric-card.accent {
      background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.12));
      border-color: rgba(245,158,11,0.2);
    }

    .metric-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 10px;
    }

    .metric-card strong {
      display: block;
      font-size: 28px;
      line-height: 1;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .metric-card strong { color: #f8fafc; }

    .content-shell { display: grid; gap: 18px; }

    .loading-state {
      text-align: center;
      padding: 72px 20px;
      color: #64748b;
      border-radius: 24px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 14px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .filters-panel {
      border-radius: 26px;
      padding: 22px;
    }

    .filters-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .filters-header h2 {
      margin: 0 0 6px;
      font-size: 18px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .filters-header h2 { color: #f8fafc; }

    .filters-header p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .filters-bar {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(180px, 0.75fr);
      gap: 14px;
    }

    .search-box,
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .si,
    .field-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .search-box input,
    .filter-select {
      width: 100%;
      border-radius: 16px;
      font-size: 15px;
      border: 1.5px solid #e2e8f0;
      background: rgba(255,255,255,0.92);
      color: var(--text-primary, #0f172a);
      padding: 14px 16px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }

    :root.dark-mode .search-box input,
    :root.dark-mode .filter-select {
      background: rgba(15,23,42,0.92);
      border-color: #334155;
      color: #e2e8f0;
    }

    .search-box input:focus,
    .filter-select:focus {
      outline: none;
      border-color: #f59e0b;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.12);
    }

    .results-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 36px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(245,158,11,0.1);
      color: #b45309;
      font-size: 13px;
      font-weight: 700;
      margin: 0;
    }

    :root.dark-mode .results-count {
      background: rgba(245,158,11,0.16);
      color: #fbbf24;
    }

    .missions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 18px;
    }

    .mission-card {
      border-radius: 24px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .mission-card:hover {
      transform: translateY(-3px);
      border-color: rgba(245,158,11,0.26);
      box-shadow: 0 20px 40px rgba(15,23,42,0.08);
    }

    .mission-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .mission-icon {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.05em;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      box-shadow: 0 12px 22px rgba(245,158,11,0.24);
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-open { background: rgba(34,197,94,0.14); color: #15803d; }
    .status-in-progress { background: rgba(59,130,246,0.14); color: #1d4ed8; }
    .status-completed { background: rgba(168,85,247,0.14); color: #7e22ce; }
    .status-cancelled { background: rgba(239,68,68,0.14); color: #b91c1c; }

    :root.dark-mode .status-open { color: #4ade80; }
    :root.dark-mode .status-in-progress { color: #93c5fd; }
    :root.dark-mode .status-completed { color: #d8b4fe; }
    :root.dark-mode .status-cancelled { color: #fca5a5; }

    .mission-heading h3 {
      margin: 0 0 5px;
      font-size: 19px;
      line-height: 1.25;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .mission-heading h3 { color: #f8fafc; }

    .company-name {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
    }

    .mission-desc {
      margin: 0;
      color: #64748b;
      line-height: 1.7;
      font-size: 14px;
      min-height: 72px;
    }

    .mission-meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .meta-item {
      padding: 12px;
      border-radius: 16px;
      background: rgba(148,163,184,0.08);
    }

    :root.dark-mode .meta-item { background: rgba(148,163,184,0.12); }

    .meta-label {
      display: block;
      margin-bottom: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #94a3b8;
    }

    .meta-item strong {
      font-size: 14px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .meta-item strong { color: #f8fafc; }

    .mission-skills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .skill {
      padding: 6px 11px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(245,158,11,0.12);
      color: #b45309;
    }

    :root.dark-mode .skill {
      background: rgba(245,158,11,0.16);
      color: #fbbf24;
    }

    .skill.more {
      background: rgba(148,163,184,0.14);
      color: #475569;
    }

    :root.dark-mode .skill.more {
      background: rgba(148,163,184,0.18);
      color: #cbd5e1;
    }

    .mission-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-top: auto;
      padding-top: 4px;
    }

    .posted-note {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 600;
    }

    .view-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 14px;
      border-radius: 14px;
      color: #fff;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      box-shadow: 0 12px 22px rgba(79,70,229,0.2);
      min-width: 128px;
    }

    .view-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 26px rgba(79,70,229,0.26);
    }

    .empty-state {
      border-radius: 26px;
      padding: 52px 20px;
      text-align: center;
    }

    .empty-icon {
      width: 68px;
      height: 68px;
      margin: 0 auto 16px;
      border-radius: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      background: linear-gradient(135deg, #cbd5e1, #94a3b8);
    }

    .empty-state h3 {
      margin: 0 0 8px;
      font-size: 20px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .empty-state h3 { color: #f8fafc; }

    .empty-state p {
      margin: 0;
      color: #64748b;
      line-height: 1.6;
    }

    @media (max-width: 920px) {
      .hero-shell,
      .filters-bar {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .freelance-page { padding-inline: 12px; }
      .hero-copy,
      .hero-metrics,
      .filters-panel,
      .mission-card,
      .empty-state {
        border-radius: 22px;
      }
      .hero-copy { padding: 24px; }
      .filters-panel { padding: 18px; }
      .mission-meta { grid-template-columns: 1fr; }
      .mission-footer { flex-direction: column; align-items: stretch; }
      .view-btn { width: 100%; }
    }

    /* Tabs Navigation Styles */
    .tabs-navigation {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(15,23,42,0.08);
      border-radius: 16px;
      padding: 6px;
      backdrop-filter: blur(14px);
    }

    :root.dark-mode .tabs-navigation {
      background: rgba(15,23,42,0.82);
      border-color: rgba(148,163,184,0.14);
    }

    .tab-btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: #64748b;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .tab-btn:hover {
      background: rgba(245,158,11,0.08);
      color: #b45309;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: white;
      box-shadow: 0 4px 12px rgba(245,158,11,0.3);
    }

    :root.dark-mode .tab-btn:hover {
      background: rgba(245,158,11,0.12);
      color: #fbbf24;
    }

    /* Applications Panel Styles */
    .applications-panel {
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(15,23,42,0.08);
      box-shadow: 0 18px 50px rgba(15,23,42,0.06);
      backdrop-filter: blur(14px);
      border-radius: 26px;
      padding: 22px;
    }

    :root.dark-mode .applications-panel {
      background: rgba(15,23,42,0.82);
      border-color: rgba(148,163,184,0.14);
      box-shadow: 0 22px 50px rgba(2,6,23,0.32);
    }

    .applications-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .applications-header h2 {
      margin: 0 0 6px;
      font-size: 18px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .applications-header h2 { color: #f8fafc; }

    .applications-header p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .applications-grid {
      display: grid;
      gap: 16px;
    }

    .application-card {
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(15,23,42,0.08);
      border-radius: 20px;
      padding: 20px;
      transition: all 0.2s ease;
    }

    :root.dark-mode .application-card {
      background: rgba(15,23,42,0.9);
      border-color: rgba(148,163,184,0.14);
    }

    .application-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(15,23,42,0.08);
      border-color: rgba(245,158,11,0.2);
    }

    .application-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .mission-info h3 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .mission-info h3 { color: #f8fafc; }

    .mission-info .company-name {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
    }

    .app-status-badge {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .app-status-badge.status-pending {
      background: rgba(245,158,11,0.12);
      color: #b45309;
    }

    .app-status-badge.status-accepted {
      background: rgba(34,197,94,0.12);
      color: #15803d;
    }

    .app-status-badge.status-rejected {
      background: rgba(239,68,68,0.12);
      color: #b91c1c;
    }

    :root.dark-mode .app-status-badge.status-pending { color: #fbbf24; }
    :root.dark-mode .app-status-badge.status-accepted { color: #4ade80; }
    :root.dark-mode .app-status-badge.status-rejected { color: #fca5a5; }

    .application-details {
      margin-bottom: 16px;
    }

    .detail-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .detail-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .detail-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    .detail-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .detail-value { color: #f8fafc; }

    .application-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .btn-view-mission {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .btn-view-mission:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(79,70,229,0.3);
    }

    .status-info {
      flex: 1;
      text-align: right;
    }

    .status-message {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-message.status-pending {
      color: #b45309;
    }

    .status-message.status-accepted {
      color: #15803d;
    }

    .status-message.status-rejected {
      color: #b91c1c;
    }

    :root.dark-mode .status-message.status-pending { color: #fbbf24; }
    :root.dark-mode .status-message.status-accepted { color: #4ade80; }
    :root.dark-mode .status-message.status-rejected { color: #fca5a5; }

    .status-icon {
      font-size: 14px;
    }

    .status-text {
      font-size: 11px;
    }

    .btn-browse {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 16px;
    }

    .btn-browse:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(245,158,11,0.3);
    }

    @media (max-width: 640px) {
      .tabs-navigation {
        flex-direction: column;
      }
      
      .application-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      
      .detail-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .application-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      
      .status-info {
        text-align: left;
      }
      
      .status-message {
        justify-content: flex-start;
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 24px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(15, 23, 42, 0.1);
    }

    :root.dark-mode .modal-content {
      background: rgba(15, 23, 42, 0.98);
      border-color: rgba(148, 163, 184, 0.2);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 28px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .modal-header h2 {
      color: #f8fafc;
    }

    .modal-close {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      border: none;
      background: rgba(148, 163, 184, 0.1);
      color: #64748b;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .modal-body {
      padding: 28px;
    }

    .mission-detail-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .mission-detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    }

    .mission-icon-large {
      width: 60px;
      height: 60px;
      border-radius: 18px;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 12px 24px rgba(245, 158, 11, 0.3);
    }

    .mission-detail-header h3 {
      margin: 0 0 4px;
      font-size: 22px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .mission-detail-header h3 {
      color: #f8fafc;
    }

    .mission-detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .detail-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.15);
    }

    :root.dark-mode .detail-box {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .detail-box .detail-icon {
      font-size: 24px;
    }

    .detail-box .detail-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .detail-box strong {
      display: block;
      font-size: 16px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .detail-box strong {
      color: #f8fafc;
    }

    .mission-description h4,
    .mission-skills h4 {
      margin: 0 0 12px;
      font-size: 16px;
      color: var(--text-primary, #0f172a);
    }

    :root.dark-mode .mission-description h4,
    :root.dark-mode .mission-skills h4 {
      color: #f8fafc;
    }

    .mission-description p {
      margin: 0;
      color: #475569;
      line-height: 1.7;
      font-size: 15px;
      white-space: pre-line;
    }

    :root.dark-mode .mission-description p {
      color: #94a3b8;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.12);
      color: #b45309;
      font-size: 13px;
      font-weight: 700;
    }

    :root.dark-mode .skill-tag {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
    }

    .modal-loading {
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
    }

    .modal-loading .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 14px;
    }

    @media (max-width: 640px) {
      .modal-content {
        max-width: 100%;
        border-radius: 20px;
      }

      .modal-header,
      .modal-body {
        padding: 20px;
      }

      .mission-detail-grid {
        grid-template-columns: 1fr;
      }

      .mission-detail-header {
        flex-wrap: wrap;
      }
    }
  `],
  styleUrls: ['./freelance-contracts.css']
})
export class FreelanceComponent implements OnInit {
  missions: Mission[] = [];
  filtered: Mission[] = [];
  allSkills: string[] = [];
  search = '';
  skillFilter = '';
  loading = true;

  // Tabs functionality
  activeTab: 'available' | 'applications' | 'contracts' = 'available';
  myApplications: MissionApplication[] = [];
  myContracts: Contract[] = [];
  loadingApplications = false;
  loadingContracts = false;
  currentUser: any = null;
  
  // Modal to view mission details
  showMissionModal = false;
  selectedMission: Mission | null = null;
  loadingMissionDetails = false;

  constructor(
    private missionSvc: B2bMissionService,
    private contractSvc: B2bContractService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      console.log('FreelanceComponent: Current user from auth service:', user);
      this.currentUser = user;
      if (user && user.idUser) {
        console.log('FreelanceComponent: User ID found, loading data for:', user.idUser);
        // Load applications first, then missions
        this.loadMyApplications();
        this.loadMyContracts();
        this.loadAvailableMissions();
      } else {
        console.warn('FreelanceComponent: No user ID found in user object');
        // If no user, still load missions but without filtering
        this.loadAvailableMissions();
      }
    });
  }

  loadAvailableMissions() {
    this.loading = true;
    this.missionSvc.getOpen().subscribe({
      next: data => {
        this.missions = data || [];
        const skillSet = new Set<string>();
        this.missions.forEach(m => {
          if (typeof m.requiredSkills === 'string') {
            m.requiredSkills.split(',').forEach(s => skillSet.add(s.trim()));
          }
        });
        this.allSkills = [...skillSet].sort();
        
        // Only filter if we have missions
        if (this.missions.length > 0) {
          this.filterAvailableMissions();
        } else {
          this.filtered = [];
        }
        
        this.loading = false;
      },
      error: (error) => { 
        console.error('Error loading missions:', error);
        this.missions = [];
        this.filtered = [];
        this.loading = false; 
      }
    });
  }

  filterAvailableMissions() {
    // Ensure we have missions to filter
    if (!this.missions || this.missions.length === 0) {
      this.filtered = [];
      return;
    }
    
    // First, filter out missions the user has already applied to
    const appliedMissionIds = new Set(this.myApplications.map(app => app.missionId));
    const availableMissions = this.missions.filter(m => !appliedMissionIds.has(m.id));
    
    // Then apply search and skill filters
    const t = this.search.toLowerCase();
    this.filtered = availableMissions.filter(m => {
      const skills = typeof m.requiredSkills === 'string' ? m.requiredSkills.split(',').map(s => s.trim()) : [];
      const ms = !t || m.title.toLowerCase().includes(t) || m.companyName?.toLowerCase().includes(t)
        || skills.some(s => s.toLowerCase().includes(t));
      const mk = !this.skillFilter || skills.includes(this.skillFilter);
      return ms && mk;
    });
  }

  switchTab(tab: 'available' | 'applications' | 'contracts') {
    this.activeTab = tab;
    if (tab === 'applications' && this.myApplications.length === 0) {
      this.loadMyApplications();
    } else if (tab === 'contracts' && this.myContracts.length === 0) {
      this.loadMyContracts();
    }
  }

  loadMyApplications() {
    if (!this.currentUser?.idUser) {
      console.warn('loadMyApplications: No user ID found', this.currentUser);
      return;
    }
    
    console.log('loadMyApplications: Loading applications for user ID:', this.currentUser.idUser);
    
    this.loadingApplications = true;
    this.missionSvc.getApplicationsByCandidate(this.currentUser.idUser)
      .subscribe({
        next: (applications) => {
          console.log('loadMyApplications: Received applications:', applications);
          this.myApplications = applications || [];
          this.loadingApplications = false;
          
          // Re-filter available missions to exclude already applied ones
          this.filterAvailableMissions();
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.myApplications = [];
          this.loadingApplications = false;
        }
      });
  }

  loadMyContracts() {
    if (!this.currentUser?.idUser) {
      console.warn('loadMyContracts: No user ID found', this.currentUser);
      return;
    }
    
    console.log('loadMyContracts: Loading contracts for user ID:', this.currentUser.idUser);
    
    this.loadingContracts = true;
    this.contractSvc.getByCandidate(this.currentUser.idUser)
      .subscribe({
        next: (contracts) => {
          console.log('loadMyContracts: Received contracts:', contracts);
          this.myContracts = contracts || [];
          this.loadingContracts = false;
        },
        error: (error) => {
          console.error('Error loading contracts:', error);
          this.myContracts = [];
          this.loadingContracts = false;
        }
      });
  }

  filter() {
    this.filterAvailableMissions();
  }

  trackByMissionId(_index: number, mission: Mission) {
    return mission.id;
  }

  parseSkills(skills: string): string[] {
    return skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  }

  missionBudget(mission: Mission) {
    return mission.dailyRate ? `${mission.dailyRate.toLocaleString('fr-FR')} €/jour` : 'Sur demande';
  }

  statusLabel(status: Mission['status']) {
    const labels: Record<Mission['status'], string> = {
      OPEN: 'Open',
      IN_PROGRESS: 'In progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };
    return labels[status] || status;
  }

  statusClass(status: Mission['status']) {
    return `status-pill status-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  // Helper methods for applications tab
  getCompanyName(missionId: number): string {
    const mission = this.missions.find(m => m.id === missionId);
    return mission?.companyName || 'Entreprise inconnue';
  }

  getApplicationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'PENDING': '⏳',
      'ACCEPTED': '✅',
      'REJECTED': '❌'
    };
    return icons[status] || '❓';
  }

  getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      'PENDING': 'Your application is under review',
      'ACCEPTED': 'Congratulations! Your application has been accepted',
      'REJECTED': 'Your application was not selected this time'
    };
    return messages[status] || 'Unknown status';
  }

  // Modal methods
  openMissionModal(missionId: number) {
    this.loadingMissionDetails = true;
    this.missionSvc.getById(missionId).subscribe({
      next: (mission) => {
        this.selectedMission = mission;
        this.showMissionModal = true;
        this.loadingMissionDetails = false;
      },
      error: (error) => {
        console.error('Error loading mission details:', error);
        this.loadingMissionDetails = false;
      }
    });
  }

  closeMissionModal() {
    this.showMissionModal = false;
    this.selectedMission = null;
  }

  // Contract helper methods
  getContractStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Draft',
      'SIGNED': 'Signed',
      'ACTIVE': 'Active',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  getContractStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'DRAFT': '📝',
      'SIGNED': '✅',
      'ACTIVE': '🔄',
      'COMPLETED': '✔️',
      'CANCELLED': '❌'
    };
    return icons[status] || '❓';
  }

  getContractStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatContractDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return weeks > 0 ? `${weeks} week(s)` : `${diffDays} day(s)`;
  }

  viewFullContract(contract: Contract) {
    // Navigate to contract signature page to view the full contract
    const userRole = localStorage.getItem('role');
    const basePath = userRole === 'ADMIN' ? '/admin/corporate' : '/corporate';
    const contractUrl = `${basePath}/contracts/${contract.id}/sign`;
    
    // Open in new tab to view the contract
    window.open(contractUrl, '_blank');
  }

  downloadContract(contract: Contract) {
    // TODO: Implement PDF download functionality
    alert('PDF download feature will be implemented soon!');
  }
}
