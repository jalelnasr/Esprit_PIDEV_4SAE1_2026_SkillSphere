import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Online Exams</h1>
      <div class="exams-grid">
        <div class="exam-card" *ngFor="let exam of exams">
          <h3>{{ exam.title }}</h3>
          <p>{{ exam.description }}</p>
          <button class="exam-btn">Start Exam</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .exams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .exam-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    h3 { margin: 0 0 0.5rem 0; color: #333; }
    p { margin: 0 0 1rem 0; color: #666; font-size: 13px; }
    .exam-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
  `]
})
export class ExamListComponent {
  exams = [
    { title: 'Angular Advanced Certification', description: 'Test your Angular expertise' },
    { title: 'Python Professional Exam', description: 'Validate your Python skills' },
    { title: 'Full Stack Developer Test', description: 'Complete assessment for full stack developers' }
  ];
}
