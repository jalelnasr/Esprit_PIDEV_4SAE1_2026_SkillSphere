import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Q&A Forum ❓</h1>
      <div class="qa-list">
        <div class="qa-item" *ngFor="let qa of qaList">
          <div class="qa-header">
            <h3>{{ qa.question }}</h3>
            <span class="answers-badge">{{ qa.answers }} answers</span>
          </div>
          <p class="qa-tags">
            <span class="tag" *ngFor="let tag of qa.tags">{{ tag }}</span>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .qa-list { display: flex; flex-direction: column; gap: 1rem; }
    .qa-item { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 4px solid #667eea; }
    .qa-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; }
    h3 { margin: 0; color: #333; }
    .answers-badge { background: #f0d662; color: #333; padding: 0.3rem 0.75rem; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .qa-tags { margin: 0; }
    .tag { display: inline-block; background: #f0f0f0; color: #667eea; padding: 0.3rem 0.75rem; border-radius: 12px; font-size: 11px; margin-right: 0.5rem; }
  `]
})
export class QaComponent {
  qaList = [
    { question: 'How to optimize Angular component performance?', answers: 5, tags: ['Angular', 'Performance'] },
    { question: 'Best practices for Python data structures', answers: 12, tags: ['Python', 'Data Structures'] }
  ];
}
