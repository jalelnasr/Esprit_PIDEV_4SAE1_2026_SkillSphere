import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { B2bMissionService } from '../services/mission.service';
import { B2bContractService } from '../services/contract.service';
import { B2bCandidateService } from '../services/candidate.service';
import { Mission, MissionApplication, ContractRequest } from '../models/b2b.models';

@Component({
  selector: 'app-mission-candidates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="candidates-page">
      <!-- Header with back button -->
      <div class="page-header-custom">
        <button class="back-btn" (click)="goBack()">
          <span class="back-icon">←</span> Back to missions
        </button>
        <div class="header-content">
          <h1>👥 Candidates for mission</h1>
          <p class="mission-title" *ngIf="mission">{{ mission.title }}</p>
        </div>
      </div>

      <!-- Informations de la mission -->
      <div class="mission-info-card" *ngIf="mission">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-icon">🏢</span>
            <div class="info-content">
              <span class="info-label">Company</span>
              <span class="info-value">{{ mission.companyName }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">💰</span>
            <div class="info-content">
              <span class="info-label">Daily rate</span>
              <span class="info-value">{{ mission.dailyRate | number:'1.0-0' }} €/day</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📅</span>
            <div class="info-content">
              <span class="info-label">Duration</span>
              <span class="info-value">{{ mission.durationWeeks }} weeks</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📊</span>
            <div class="info-content">
              <span class="info-label">Status</span>
              <span class="status-badge" [ngClass]="'status-' + mission.status.toLowerCase()">
                {{ getStatusLabel(mission.status) }}
              </span>
            </div>
          </div>
        </div>
        <div class="skills-section" *ngIf="mission.requiredSkills">
          <span class="skills-label">🎯 Required skills:</span>
          <div class="skills-list">
            <span class="skill-tag" *ngFor="let skill of parseSkills(mission.requiredSkills)">
              {{ skill }}
            </span>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading applications...</p>
      </div>

      <!-- Candidates list -->
      <div class="candidates-section" *ngIf="!loading">
        <div class="section-header">
          <h2>📋 Applications List</h2>
          <span class="count-badge">{{ applications.length }} application(s)</span>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <button 
            class="filter-btn" 
            [class.active]="statusFilter === ''"
            (click)="statusFilter = ''; filterApplications()">
            All ({{ applications.length }})
          </button>
          <button 
            class="filter-btn pending" 
            [class.active]="statusFilter === 'PENDING'"
            (click)="statusFilter = 'PENDING'; filterApplications()">
            Pending ({{ countByStatus('PENDING') }})
          </button>
          <button 
            class="filter-btn accepted" 
            [class.active]="statusFilter === 'ACCEPTED'"
            (click)="statusFilter = 'ACCEPTED'; filterApplications()">
            Accepted ({{ countByStatus('ACCEPTED') }})
          </button>
          <button 
            class="filter-btn rejected" 
            [class.active]="statusFilter === 'REJECTED'"
            (click)="statusFilter = 'REJECTED'; filterApplications()">
            Rejected ({{ countByStatus('REJECTED') }})
          </button>
        </div>

        <!-- Cartes des candidats -->
        <div class="candidates-grid" *ngIf="filteredApplications.length > 0">
          <div class="candidate-card" *ngFor="let app of filteredApplications">
            <!-- En-tête du candidat -->
            <div class="candidate-header">
              <div class="candidate-avatar">{{ getInitials(app.candidateTitle) }}</div>
              <div class="candidate-info">
                <h3 class="candidate-name">{{ app.candidateTitle }}</h3>
                <span class="application-date">
                  📅 Applied on {{ app.appliedAt | date:'dd/MM/yyyy at HH:mm' }}
                </span>
              </div>
              <span class="status-badge-large" [ngClass]="'status-' + app.status.toLowerCase()">
                {{ getStatusLabel(app.status) }}
              </span>
            </div>

            <!-- AI Matching Score -->
            <div class="matching-score-section" *ngIf="app.matchingScore !== undefined">
              <div class="matching-header">
                <span class="ai-icon">🤖</span>
                <span class="matching-title">AI Compatibility Analysis</span>
                <span class="score-badge" [ngClass]="getScoreClass(app.matchingScore)">
                  {{ getScoreIcon(app.matchingScore) }} {{ getScoreLabel(app.matchingScore) }}
                </span>
              </div>
              <div class="matching-content">
                <div class="score-circle" [ngClass]="getScoreClass(app.matchingScore)">
                  <div class="score-value">{{ app.matchingScore }}</div>
                  <div class="score-max">/100</div>
                </div>
                <div class="score-details">
                  <div class="score-bar">
                    <div class="score-fill" [ngClass]="getScoreClass(app.matchingScore)" 
                         [style.width.%]="app.matchingScore"></div>
                  </div>
                  <div class="score-recommendation" [ngClass]="getScoreClass(app.matchingScore)">
                    {{ app.matchingRecommendation }}
                  </div>
                  <div class="score-breakdown">
                    <div class="breakdown-item">
                      <span class="breakdown-icon">🎯</span>
                      <span class="breakdown-text">Skills matching with AI analysis</span>
                    </div>
                    <div class="breakdown-item">
                      <span class="breakdown-icon">📈</span>
                      <span class="breakdown-text">Experience level evaluation</span>
                    </div>
                    <div class="breakdown-item">
                      <span class="breakdown-icon">💰</span>
                      <span class="breakdown-text">Rate competitiveness analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial details -->
            <div class="financial-details">
              <div class="detail-box proposed">
                <span class="detail-icon">💵</span>
                <div class="detail-content">
                  <span class="detail-label">Proposed rate</span>
                  <span class="detail-value">{{ app.proposedRate | number:'1.0-0' }} €/day</span>
                </div>
              </div>
              <div class="detail-box comparison">
                <span class="detail-icon">📊</span>
                <div class="detail-content">
                  <span class="detail-label">Difference</span>
                  <span class="detail-value" [ngClass]="getDifferenceClass(app.proposedRate)">
                    {{ getDifference(app.proposedRate) }}
                  </span>
                </div>
              </div>
              <div class="detail-box total" *ngIf="mission">
                <span class="detail-icon">💰</span>
                <div class="detail-content">
                  <span class="detail-label">Estimated total cost</span>
                  <span class="detail-value">
                    {{ calculateTotalCost(app.proposedRate) | number:'1.0-0' }} €
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="candidate-actions" *ngIf="app.status === 'PENDING'">
              <button class="btn-accept" (click)="acceptApplication(app)">
                <span class="btn-icon">✓</span>
                <span class="btn-text">Accept</span>
              </button>
              <button class="btn-reject" (click)="rejectApplication(app)">
                <span class="btn-icon">✗</span>
                <span class="btn-text">Reject</span>
              </button>
            </div>

            <!-- Status messages for processed applications -->
            <div class="status-message" *ngIf="app.status === 'ACCEPTED'">
              <span class="message-icon">✓</span>
              <span class="message-text">Application accepted</span>
              <button class="btn-create-contract" (click)="openContractModal(app)">
                📄 Create contract
              </button>
            </div>
            <div class="status-message rejected" *ngIf="app.status === 'REJECTED'">
              <span class="message-icon">✗</span>
              <span class="message-text">Application rejected</span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div class="empty-state" *ngIf="filteredApplications.length === 0 && !loading">
          <div class="empty-icon">📭</div>
          <h3>No applications</h3>
          <p *ngIf="statusFilter">No applications with status "{{ getStatusLabel(statusFilter) }}"</p>
          <p *ngIf="!statusFilter">No candidates have applied for this mission yet</p>
        </div>
      </div>
    </div>

    <!-- Contract creation modal -->
    <div *ngIf="showContractModal" class="modal-overlay" (click)="closeContractModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>📄 Create contract</h2>
          <button class="close-btn" (click)="closeContractModal()">✕</button>
        </div>

        <div class="contract-info-section" *ngIf="selectedApplication && mission">
          <div class="info-row">
            <span class="info-label">Mission:</span>
            <span class="info-value">{{ mission.title }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Freelancer:</span>
            <span class="info-value">{{ selectedApplication.candidateTitle }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Proposed rate:</span>
            <span class="info-value">{{ selectedApplication.proposedRate | number:'1.0-0' }} €/day</span>
          </div>
        </div>

        <form class="contract-form" *ngIf="selectedApplication && mission">
          <div class="form-row">
            <div class="form-group">
              <label>Total contract amount (€) *</label>
              <input 
                type="number" 
                [(ngModel)]="contractForm.totalAmount" 
                name="amount"
                placeholder="Ex: 12000"
                required>
              <small class="form-hint">
                Suggestion: {{ calculateTotalCost(selectedApplication.proposedRate) | number:'1.0-0' }} € 
                ({{ selectedApplication.proposedRate }}€/day × {{ mission.durationWeeks }} weeks × 5 days)
              </small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start date *</label>
              <input 
                type="date" 
                [(ngModel)]="contractForm.startDate" 
                name="startDate"
                required>
            </div>
            <div class="form-group">
              <label>End date *</label>
              <input 
                type="date" 
                [(ngModel)]="contractForm.endDate" 
                name="endDate"
                required>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeContractModal()">
              Cancel
            </button>
            <button type="button" class="btn-submit" (click)="createContract()" [disabled]="creatingContract">
              {{ creatingContract ? 'Creating...' : '✓ Create contract' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./b2b-shared.css', './mission-candidates.component.css', './mission-candidates-matching.css']
})
export class MissionCandidatesComponent implements OnInit {
  mission: Mission | null = null;
  applications: MissionApplication[] = [];
  filteredApplications: MissionApplication[] = [];
  loading = true;
  statusFilter = '';
  missionId: number = 0;

  // Contract creation
  showContractModal = false;
  selectedApplication: MissionApplication | null = null;
  creatingContract = false;
  contractForm: ContractRequest = {
    missionId: 0,
    candidateId: 0,
    companyId: 0,
    totalAmount: 0,
    startDate: '',
    endDate: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionSvc: B2bMissionService,
    private contractSvc: B2bContractService,
    private candidateSvc: B2bCandidateService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.missionId = +id;
      this.loadMissionAndApplications();
    }
  }

  loadMissionAndApplications() {
    this.loading = true;
    
    // Charger la mission
    this.missionSvc.getById(this.missionId).subscribe({
      next: (mission) => {
        this.mission = mission;
        
        // Load applications
        this.missionSvc.getApplications(this.missionId).subscribe({
          next: (apps) => {
            this.applications = apps || [];
            this.filterApplications();
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            alert('Error loading applications');
          }
        });
      },
      error: () => {
        this.loading = false;
        alert('Error loading mission');
      }
    });
  }

  filterApplications() {
    if (this.statusFilter) {
      this.filteredApplications = this.applications.filter(app => app.status === this.statusFilter);
    } else {
      this.filteredApplications = [...this.applications];
    }
  }

  countByStatus(status: string): number {
    return this.applications.filter(app => app.status === status).length;
  }

  acceptApplication(app: MissionApplication) {
    if (!confirm(`Are you sure you want to accept ${app.candidateTitle}'s application?`)) {
      return;
    }

    this.missionSvc.updateApplicationStatus(app.id, 'ACCEPTED').subscribe({
      next: () => {
        app.status = 'ACCEPTED';
        alert('✓ Application accepted successfully!');
        this.filterApplications();
      },
      error: (e) => {
        alert('Error: ' + (e?.error?.message || 'Unable to accept application'));
      }
    });
  }

  rejectApplication(app: MissionApplication) {
    if (!confirm(`Are you sure you want to reject ${app.candidateTitle}'s application?`)) {
      return;
    }

    this.missionSvc.updateApplicationStatus(app.id, 'REJECTED').subscribe({
      next: () => {
        app.status = 'REJECTED';
        alert('✗ Application rejected');
        this.filterApplications();
      },
      error: (e) => {
        alert('Error: ' + (e?.error?.message || 'Unable to reject application'));
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  getDifference(proposedRate: number): string {
    if (!this.mission) return '';
    const diff = proposedRate - this.mission.dailyRate;
    if (diff === 0) return '= (identique)';
    if (diff > 0) return `+${diff} € (+${((diff / this.mission.dailyRate) * 100).toFixed(1)}%)`;
    return `${diff} € (${((diff / this.mission.dailyRate) * 100).toFixed(1)}%)`;
  }

  getDifferenceClass(proposedRate: number): string {
    if (!this.mission) return '';
    const diff = proposedRate - this.mission.dailyRate;
    if (diff === 0) return 'diff-equal';
    if (diff > 0) return 'diff-higher';
    return 'diff-lower';
  }

  calculateTotalCost(dailyRate: number): number {
    if (!this.mission) return 0;
    return dailyRate * this.mission.durationWeeks * 5; // 5 days per week
  }

  parseSkills(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s);
  }

  goBack() {
    this.router.navigate(['/admin/corporate/missions']);
  }

  openContractModal(app: MissionApplication) {
    this.selectedApplication = app;
    
    if (!this.mission) {
      alert('Error: Missing mission information');
      return;
    }
    
    // Pré-remplir le formulaire
    const suggestedAmount = this.calculateTotalCost(app.proposedRate);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 7); // Start in 7 days
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (this.mission.durationWeeks * 7));

    console.log('Mission data for contract:', this.mission);
    console.log('Application data:', app);
    console.log('CandidateId from application:', app.candidateId);
    console.log('CompanyId from mission:', this.mission.companyId);

    this.contractForm = {
      missionId: this.missionId,
      candidateId: app.candidateId,
      companyId: this.mission.companyId,
      totalAmount: suggestedAmount,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    };

    console.log('Contract form prepared:', this.contractForm);
    
    // Validations before opening modal
    if (!this.contractForm.candidateId || this.contractForm.candidateId <= 0) {
      alert('Error: Invalid candidate ID');
      return;
    }
    
    if (!this.contractForm.companyId || this.contractForm.companyId <= 0) {
      alert('Error: Invalid company ID');
      return;
    }
    
    this.showContractModal = true;
  }

  closeContractModal() {
    this.showContractModal = false;
    this.selectedApplication = null;
    this.creatingContract = false;
  }

  createContract() {
    if (!this.validateContractForm()) {
      return;
    }

    console.log('Creating contract with data:', this.contractForm);
    console.log('Mission data:', this.mission);
    console.log('Selected application:', this.selectedApplication);

    // Final data validation
    if (!this.contractForm.candidateId) {
      alert('Error: Missing candidate ID');
      return;
    }

    if (!this.contractForm.companyId) {
      alert('Error: Missing company ID');
      return;
    }

    this.creatingContract = true;

    // First, create candidate if it doesn't exist
    this.ensureCandidateExists().then(() => {
      // Then create contract
      this.contractSvc.create(this.contractForm).subscribe({
        next: (contract) => {
          console.log('Contract created successfully:', contract);
          console.log('Contract ID:', contract.id);
          
          this.closeContractModal();
          this.creatingContract = false;
          
          // Show success message
          alert('✓ Contract created successfully! Redirecting to signature page...');
          
          // Determine correct path based on role
          const userRole = localStorage.getItem('role');
          const basePath = userRole === 'ADMIN' ? '/admin/corporate' : '/corporate';
          const signatureUrl = `${basePath}/contracts/${contract.id}/sign`;
          
          console.log('User role:', userRole);
          console.log('Redirecting to:', signatureUrl);
          
          // Use window.location.href for complete navigation
          window.location.href = signatureUrl;
        },
        error: (e) => {
          console.error('Error creating contract:', e);
          console.error('Full error object:', JSON.stringify(e, null, 2));
          this.creatingContract = false;
          
          let errorMessage = 'Unknown error';
          if (e?.error?.message) {
            errorMessage = e.error.message;
          } else if (e?.message) {
            errorMessage = e.message;
          } else if (typeof e?.error === 'string') {
            errorMessage = e.error;
          }
          
          alert('Error creating contract: ' + errorMessage);
        }
      });
    }).catch((error) => {
      console.error('Error ensuring candidate exists:', error);
      this.creatingContract = false;
      alert('Error preparing candidate: ' + error.message);
    });
  }

  private async ensureCandidateExists(): Promise<void> {
    if (!this.selectedApplication) {
      throw new Error('Selected application missing');
    }

    const candidateId = this.selectedApplication.candidateId;
    
    // Check if candidate already exists
    try {
      await this.candidateSvc.getById(candidateId).toPromise();
      console.log('Candidate already exists:', candidateId);
      return; // Candidate already exists
    } catch (error) {
      console.log('Candidate does not exist, creating:', candidateId);
      
      // Create candidate with basic information
      const candidateRequest = {
        id: candidateId,
        title: this.selectedApplication.candidateTitle || 'Freelance',
        skills: [], // No specific skills for now
        experienceYears: 0,
        resumeUrl: '',
        isLookingForJob: true
      };

      try {
        await this.candidateSvc.create(candidateRequest).toPromise();
        console.log('Candidate created successfully:', candidateId);
      } catch (createError) {
        console.error('Error creating candidate:', createError);
        throw new Error('Unable to create candidate profile');
      }
    }
  }

  validateContractForm(): boolean {
    if (!this.contractForm.totalAmount || this.contractForm.totalAmount <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    if (!this.contractForm.startDate) {
      alert('Please select a start date');
      return false;
    }
    if (!this.contractForm.endDate) {
      alert('Please select an end date');
      return false;
    }
    if (new Date(this.contractForm.endDate) <= new Date(this.contractForm.startDate)) {
      alert('End date must be after start date');
      return false;
    }
    return true;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getScoreClass(score: number | undefined): string {
    if (!score) return 'score-unknown';
    if (score >= 90) return 'score-exceptional';
    if (score >= 80) return 'score-excellent';
    if (score >= 70) return 'score-very-good';
    if (score >= 60) return 'score-good';
    if (score >= 50) return 'score-moderate';
    if (score >= 40) return 'score-weak';
    return 'score-poor';
  }

  getScoreIcon(score: number | undefined): string {
    if (!score) return '❓';
    if (score >= 90) return '🌟';
    if (score >= 80) return '⭐';
    if (score >= 70) return '✅';
    if (score >= 60) return '👍';
    if (score >= 50) return '⚖️';
    if (score >= 40) return '⚠️';
    return '❌';
  }

  getScoreLabel(score: number | undefined): string {
    if (!score) return 'Unknown';
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Moderate';
    if (score >= 40) return 'Weak';
    return 'Poor';
  }
}
