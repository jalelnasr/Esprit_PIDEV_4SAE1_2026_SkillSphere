import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-recommendation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ai-recommendation" [ngClass]="getRecommendationClass()">
      <div class="recommendation-icon">{{ getIcon() }}</div>
      <div class="recommendation-text">
        <strong>Recommandation IA :</strong>
        <p>{{ recommendation }}</p>
      </div>
    </div>
  `,
  styles: [`
    .ai-recommendation {
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin: 16px 0;
      border-left: 4px solid;
      animation: slideIn 0.5s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .ai-recommendation.excellent {
      background: #e8f5e9;
      border-color: #4caf50;
      color: #2e7d32;
    }

    .ai-recommendation.good {
      background: #e3f2fd;
      border-color: #2196f3;
      color: #1565c0;
    }

    .ai-recommendation.average {
      background: #fff3e0;
      border-color: #ff9800;
      color: #e65100;
    }

    .ai-recommendation.low {
      background: #ffebee;
      border-color: #f44336;
      color: #c62828;
    }

    .recommendation-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .recommendation-text {
      flex: 1;
      line-height: 1.5;
    }

    .recommendation-text strong {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .recommendation-text p {
      margin: 0;
      font-size: 13px;
    }
  `]
})
export class AIRecommendationComponent {
  @Input() score: number = 0;
  @Input() recommendation: string = '';

  getRecommendationClass(): string {
    if (this.score >= 80) return 'excellent';
    if (this.score >= 60) return 'good';
    if (this.score >= 40) return 'average';
    return 'low';
  }

  getIcon(): string {
    if (this.score >= 80) return '🌟';
    if (this.score >= 60) return '✅';
    if (this.score >= 40) return '⚠️';
    return '❌';
  }
}
