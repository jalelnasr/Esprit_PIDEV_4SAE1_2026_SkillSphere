import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ai-score-container" [ngClass]="getScoreClass()">
      <div class="ai-icon">🤖</div>
      <div class="score-content">
        <div class="score-value">{{ score }}/100</div>
        <div class="score-level">{{ getScoreLevel() }}</div>
      </div>
      <div class="score-bar">
        <div class="score-fill" [style.width.%]="score"></div>
      </div>
    </div>
  `,
  styles: [`
    .ai-score-container {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 12px;
      gap: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-width: 280px;
    }

    .ai-score-container.excellent {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .ai-score-container.good {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .ai-score-container.average {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      color: #333;
    }

    .ai-score-container.low {
      background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%);
      color: #333;
    }

    .ai-icon {
      font-size: 32px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .score-content {
      flex: 1;
    }

    .score-value {
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
    }

    .score-level {
      font-size: 12px;
      opacity: 0.9;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .score-bar {
      width: 100px;
      height: 8px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      overflow: hidden;
    }

    .score-fill {
      height: 100%;
      background: white;
      transition: width 0.5s ease;
      border-radius: 4px;
    }
  `]
})
export class AIScoreBadgeComponent {
  @Input() score: number = 0;

  getScoreClass(): string {
    if (this.score >= 80) return 'excellent';
    if (this.score >= 60) return 'good';
    if (this.score >= 40) return 'average';
    return 'low';
  }

  getScoreLevel(): string {
    if (this.score >= 80) return 'Excellent';
    if (this.score >= 60) return 'Bon';
    if (this.score >= 40) return 'Moyen';
    return 'Faible';
  }
}
