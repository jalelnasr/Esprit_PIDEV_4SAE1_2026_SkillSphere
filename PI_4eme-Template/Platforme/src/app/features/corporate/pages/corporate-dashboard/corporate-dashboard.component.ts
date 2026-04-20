import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-corporate-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Corporate Dashboard</h1>
      <div class="dashboard-grid">
        <div class="metric-card">
          <h3>Employees</h3>
          <p class="metric-value">150</p>
        </div>
        <div class="metric-card">
          <h3>Active Trainings</h3>
          <p class="metric-value">45</p>
        </div>
        <div class="metric-card">
          <h3>Completed Traings</h3>
          <p class="metric-value">89%</p>
        </div>
        <div class="metric-card">
          <h3>Certifications</h3>
          <p class="metric-value">67</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
    .metric-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    h3 { margin: 0; color: #666; font-size: 13px; text-transform: uppercase; }
    .metric-value { margin: 0.5rem 0 0 0; font-size: 32px; font-weight: 700; color: #667eea; }
  `]
})
export class CorporateDashboardComponent { }
