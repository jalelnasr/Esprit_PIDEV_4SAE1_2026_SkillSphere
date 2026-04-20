import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-labs-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Virtual Labs 🧪</h1>
      <div class="labs-grid">
        <div class="lab-card" *ngFor="let lab of labs">
          <div class="lab-icon">{{ lab.icon }}</div>
          <h3>{{ lab.title }}</h3>
          <p>{{ lab.description }}</p>
          <button class="lab-btn">Start Lab</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .labs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .lab-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; }
    .lab-icon { font-size: 48px; margin-bottom: 1rem; }
    h3 { margin: 0 0 0.5rem 0; color: #333; }
    p { margin: 0 0 1rem 0; color: #666; font-size: 13px; }
    .lab-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
  `]
})
export class LabsListComponent {
  labs = [
    { icon: '💻', title: 'Web Development Lab', description: 'Build web applications in a sandbox environment' },
    { icon: '🐍', title: 'Python Lab', description: 'Write and test Python code' },
    { icon: '☁️', title: 'Cloud Lab', description: 'Deploy applications to the cloud' }
  ];
}
