import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService, AIMatchScore } from '../../services/ai.service';
import { AIScoreBadgeComponent } from '../../shared/ai-score-badge/ai-score-badge.component';
import { AIRecommendationComponent } from '../../shared/ai-recommendation/ai-recommendation.component';

@Component({
  selector: 'app-ai-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AIScoreBadgeComponent,
    AIRecommendationComponent
  ],
  template: `
    <div class="ai-test-container">
      <div class="header">
        <h1>🤖 AI Module Test</h1>
        <p>Test the intelligent candidate/mission matching system</p>
        
        <div class="health-check" *ngIf="healthStatus">
          <span class="status-badge" [class.online]="healthStatus.status === 'OK'">
            {{ healthStatus.status }}
          </span>
          <span>{{ healthStatus.message }}</span>
        </div>
      </div>

      <div class="test-form">
        <div class="form-section">
          <h2>👤 Candidate Information</h2>
          <div class="form-group">
            <label>Skills (comma-separated)</label>
            <input 
              type="text" 
              [(ngModel)]="candidateSkills" 
              placeholder="Java, Spring Boot, MySQL, Docker"
              class="form-control">
          </div>
          <div class="form-group">
            <label>Years of experience</label>
            <input 
              type="number" 
              [(ngModel)]="candidateExperience" 
              placeholder="5"
              class="form-control">
          </div>
          <div class="form-group">
            <label>Proposed daily rate (€)</label>
            <input 
              type="number" 
              [(ngModel)]="proposedRate" 
              placeholder="450"
              class="form-control">
          </div>
        </div>

        <div class="form-section">
          <h2>🎯 Mission Information</h2>
          <div class="form-group">
            <label>Required skills (comma-separated)</label>
            <input 
              type="text" 
              [(ngModel)]="missionSkills" 
              placeholder="Java, Spring, MySQL"
              class="form-control">
          </div>
          <div class="form-group">
            <label>Required experience (years)</label>
            <input 
              type="number" 
              [(ngModel)]="missionExperience" 
              placeholder="3"
              class="form-control">
          </div>
          <div class="form-group">
            <label>Mission budget (€/day)</label>
            <input 
              type="number" 
              [(ngModel)]="missionBudget" 
              placeholder="500"
              class="form-control">
          </div>
        </div>
      </div>

      <div class="actions">
        <button 
          class="btn btn-primary" 
          (click)="calculateScore()"
          [disabled]="loading">
          {{ loading ? 'Calculating...' : '🤖 Calculate AI Score' }}
        </button>
        <button 
          class="btn btn-secondary" 
          (click)="loadExample()">
          📝 Load Example
        </button>
      </div>

      <div class="results" *ngIf="result">
        <h2>📊 AI Analysis Results</h2>
        
        <div class="score-display">
          <app-ai-score-badge [score]="result.score"></app-ai-score-badge>
        </div>

        <app-ai-recommendation 
          [score]="result.score"
          [recommendation]="result.recommendation">
        </app-ai-recommendation>

        <div class="details">
          <h3>Matching Details</h3>
          <div class="detail-grid">
            <div class="detail-card">
              <div class="detail-label">Level</div>
              <div class="detail-value">{{ result.level }}</div>
            </div>
            <div class="detail-card">
              <div class="detail-label">Score</div>
              <div class="detail-value">{{ result.score }}/100</div>
            </div>
          </div>

          <div class="comparison">
            <h4>Candidate vs Mission Comparison</h4>
            <table class="comparison-table">
              <tr>
                <th>Criteria</th>
                <th>Candidate</th>
                <th>Mission</th>
              </tr>
              <tr>
                <td>Skills</td>
                <td>{{ result.details.candidateSkills }}</td>
                <td>{{ result.details.missionSkills }}</td>
              </tr>
              <tr>
                <td>Experience</td>
                <td>{{ result.details.candidateExperience }} years</td>
                <td>{{ result.details.missionExperience }} years</td>
              </tr>
              <tr>
                <td>Rate / Budget</td>
                <td>{{ result.details.proposedRate }}€</td>
                <td>{{ result.details.missionBudget }}€</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="error" *ngIf="error">
        <div class="error-message">
          ❌ {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-test-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      font-size: 32px;
      margin-bottom: 8px;
      color: #333;
    }

    .header p {
      color: #666;
      font-size: 16px;
    }

    .health-check {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 8px 16px;
      background: #f5f5f5;
      border-radius: 20px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      background: #e0e0e0;
      color: #666;
    }

    .status-badge.online {
      background: #4caf50;
      color: white;
    }

    .test-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .form-section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-section h2 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #333;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 32px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .results {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .results h2 {
      font-size: 24px;
      margin-bottom: 24px;
      color: #333;
    }

    .score-display {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .details {
      margin-top: 24px;
    }

    .details h3 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #333;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .detail-card {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }

    .detail-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .detail-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .comparison {
      margin-top: 24px;
    }

    .comparison h4 {
      font-size: 16px;
      margin-bottom: 12px;
      color: #555;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .comparison-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .comparison-table tr:last-child td {
      border-bottom: none;
    }

    .error {
      margin-top: 24px;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #f44336;
    }

    @media (max-width: 768px) {
      .test-form {
        grid-template-columns: 1fr;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AITestComponent implements OnInit {
  // Données du formulaire
  candidateSkills = 'Java, Spring Boot, MySQL, Docker';
  candidateExperience = 5;
  proposedRate = 450;
  
  missionSkills = 'Java, Spring, MySQL';
  missionExperience = 3;
  missionBudget = 500;

  // Résultats
  result: AIMatchScore | null = null;
  error: string | null = null;
  loading = false;
  healthStatus: any = null;

  constructor(private aiService: AIService) {}

  ngOnInit() {
    this.checkHealth();
  }

  checkHealth() {
    this.aiService.healthCheck().subscribe({
      next: (response) => {
        this.healthStatus = response;
        console.log('✅ AI Module operational:', response);
      },
      error: (err) => {
        console.error('❌ AI Module unavailable:', err);
        this.healthStatus = { status: 'ERROR', message: 'AI Module unavailable' };
      }
    });
  }

  calculateScore() {
    this.loading = true;
    this.error = null;
    this.result = null;

    this.aiService.calculateMatchScore(
      this.candidateSkills,
      this.candidateExperience,
      this.missionSkills,
      this.missionExperience,
      this.proposedRate,
      this.missionBudget
    ).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
        console.log('🤖 AI Result:', response);
      },
      error: (err) => {
        this.error = 'Error calculating score. Please verify the backend is running.';
        this.loading = false;
        console.error('❌ Error:', err);
      }
    });
  }

  loadExample() {
    // Example 1: Perfect match
    this.candidateSkills = 'Java, Spring Boot, MySQL, Docker, Kubernetes';
    this.candidateExperience = 5;
    this.proposedRate = 400;
    
    this.missionSkills = 'Java, Spring Boot, MySQL';
    this.missionExperience = 5;
    this.missionBudget = 500;
  }
}
