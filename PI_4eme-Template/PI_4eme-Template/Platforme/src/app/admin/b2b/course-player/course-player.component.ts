import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { B2bAssignmentService } from '../services/assignment.service';
import { Assignment } from '../models/b2b.models';

interface Chapter {
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz';
  completed: boolean;
}

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="player-page" *ngIf="assignment">
      <!-- Top Bar -->
      <div class="top-bar">
        <button class="back-btn" (click)="goBack()">← Back to My Training</button>
        <div class="course-info">
          <span class="course-icon">{{ getCourseIcon() }}</span>
          <div>
            <h2>{{ assignment.courseName }}</h2>
            <span class="pack-label">📦 {{ assignment.packName }}</span>
          </div>
        </div>
        <span class="status-badge" [class]="'badge-' + assignment.status">{{ statusLabel() }}</span>
      </div>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Left: Chapters -->
        <div class="chapters-panel">
          <h3>📋 Course Chapters</h3>
          <div class="chapter-list">
            <div class="chapter-item"
                 *ngFor="let ch of chapters; let i = index"
                 [class.active]="i === currentChapter"
                 [class.done]="ch.completed"
                 (click)="selectChapter(i)">
              <div class="ch-num" [class.ch-done]="ch.completed">
                <span *ngIf="!ch.completed">{{ i + 1 }}</span>
                <span *ngIf="ch.completed">✓</span>
              </div>
              <div class="ch-info">
                <span class="ch-title">{{ ch.title }}</span>
                <span class="ch-meta">
                  {{ ch.type === 'video' ? '🎬' : ch.type === 'quiz' ? '❓' : '📖' }}
                  {{ ch.duration }}
                </span>
              </div>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span>Progress</span>
              <span class="pct">{{ progressPercent }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercent"></div>
            </div>
          </div>
        </div>

        <!-- Right: Content Area -->
        <div class="content-panel">
          <div class="content-area" *ngIf="chapters[currentChapter] as ch">
            <!-- Video Chapter -->
            <div class="video-placeholder" *ngIf="ch.type === 'video'">
              <div class="play-icon">▶️</div>
              <p>{{ ch.title }}</p>
              <span class="video-hint">Video content — {{ ch.duration }}</span>
            </div>

            <!-- Reading Chapter -->
            <div class="reading-content" *ngIf="ch.type === 'reading'">
              <h3>📖 {{ ch.title }}</h3>
              <div class="text-block">
                <p>This chapter covers the key concepts and theory for <strong>{{ assignment.courseName }}</strong>.</p>
                <p>Topics covered in this section:</p>
                <ul>
                  <li>Core fundamentals and best practices</li>
                  <li>Practical application and real-world examples</li>
                  <li>Industry standards and current trends</li>
                  <li>Hands-on exercises and case studies</li>
                </ul>
                <p>Take your time to read through the material and take notes. Once you feel confident, mark this chapter as completed and move to the next one.</p>
              </div>
            </div>

            <!-- Quiz Chapter -->
            <div class="quiz-content" *ngIf="ch.type === 'quiz'">
              <h3>❓ {{ ch.title }}</h3>
              <div class="quiz-card" *ngFor="let q of getQuizQuestions(); let qi = index">
                <p class="q-text">{{ qi + 1 }}. {{ q.question }}</p>
                <div class="q-options">
                  <label *ngFor="let opt of q.options; let oi = index"
                         class="q-option"
                         [class.selected]="quizAnswers[qi] === oi"
                         (click)="quizAnswers[qi] = oi">
                    <span class="radio" [class.checked]="quizAnswers[qi] === oi"></span>
                    {{ opt }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="content-actions">
              <button class="btn btn-mark" *ngIf="!ch.completed" (click)="markChapterDone()">
                ✅ Mark Chapter as Done
              </button>
              <span class="done-label" *ngIf="ch.completed">✅ Chapter completed</span>

              <button class="btn btn-next" *ngIf="currentChapter < chapters.length - 1" (click)="nextChapter()">
                Next Chapter →
              </button>

              <button class="btn btn-finish" *ngIf="allDone && assignment.status !== 'COMPLETED'" (click)="finishCourse()">
                🎉 Finish Course
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-page" *ngIf="!assignment && loading">
      <div class="spinner"></div>
      <p>Loading course...</p>
    </div>
  `,
  styles: [`
    .player-page { min-height: 100vh; background: #f8fafc; }

    .top-bar {
      display: flex; align-items: center; gap: 16px; padding: 16px 24px;
      background: #fff; border-bottom: 1px solid #e2e8f0;
      position: sticky; top: 0; z-index: 10;
    }
    :root.dark-mode .top-bar { background: #1e293b; border-color: #334155; }
    .back-btn {
      padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0;
      background: #fff; cursor: pointer; font-weight: 600; font-size: 13px;
      color: #475569; transition: all 0.2s;
    }
    :root.dark-mode .back-btn { background: #334155; color: #94a3b8; border-color: #475569; }
    .back-btn:hover { background: #f1f5f9; }
    .course-info { display: flex; align-items: center; gap: 12px; flex: 1; }
    .course-icon { font-size: 32px; }
    .course-info h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
    :root.dark-mode .course-info h2 { color: #f1f5f9; }
    .pack-label { font-size: 12px; color: #64748b; }
    .status-badge { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
    .badge-IN_PROGRESS { background: #dbeafe; color: #1e40af; }
    .badge-ASSIGNED { background: #f1f5f9; color: #475569; }
    .badge-COMPLETED { background: #d1fae5; color: #065f46; }

    .content-grid {
      display: grid; grid-template-columns: 300px 1fr; gap: 0;
      max-width: 1400px; margin: 0 auto; min-height: calc(100vh - 73px);
    }

    .chapters-panel {
      background: #fff; border-right: 1px solid #e2e8f0; padding: 24px;
      display: flex; flex-direction: column;
    }
    :root.dark-mode .chapters-panel { background: #1e293b; border-color: #334155; }
    .chapters-panel h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
    :root.dark-mode .chapters-panel h3 { color: #f1f5f9; }

    .chapter-list { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .chapter-item {
      display: flex; align-items: center; gap: 12px; padding: 12px;
      border-radius: 10px; cursor: pointer; transition: all 0.2s;
    }
    .chapter-item:hover { background: #f1f5f9; }
    :root.dark-mode .chapter-item:hover { background: #334155; }
    .chapter-item.active { background: rgba(99,102,241,0.08); border: 1.5px solid rgba(99,102,241,0.2); }
    .chapter-item.done { opacity: 0.7; }
    .ch-num {
      width: 32px; height: 32px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-weight: 700;
      font-size: 13px; background: #f1f5f9; color: #475569; flex-shrink: 0;
    }
    :root.dark-mode .ch-num { background: #334155; color: #94a3b8; }
    .ch-done { background: #d1fae5 !important; color: #065f46 !important; }
    .ch-info { display: flex; flex-direction: column; min-width: 0; }
    .ch-title { font-size: 13px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    :root.dark-mode .ch-title { color: #e2e8f0; }
    .ch-meta { font-size: 11px; color: #94a3b8; }

    .progress-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    :root.dark-mode .progress-section { border-color: #334155; }
    .progress-header { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .pct { font-weight: 700; color: #6366f1; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    :root.dark-mode .progress-bar { background: #334155; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; transition: width 0.4s; }

    .content-panel { padding: 32px; }
    .content-area { max-width: 800px; margin: 0 auto; }

    .video-placeholder {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 16px; padding: 80px 40px; text-align: center; color: #fff;
      margin-bottom: 24px;
    }
    .play-icon { font-size: 64px; margin-bottom: 16px; }
    .video-placeholder p { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
    .video-hint { font-size: 13px; color: #94a3b8; }

    .reading-content h3 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
    :root.dark-mode .reading-content h3 { color: #f1f5f9; }
    .text-block {
      background: #fff; border-radius: 12px; padding: 24px;
      border: 1px solid #e2e8f0; line-height: 1.8; color: #334155; font-size: 15px;
    }
    :root.dark-mode .text-block { background: #1e293b; border-color: #334155; color: #cbd5e1; }
    .text-block ul { padding-left: 20px; margin: 12px 0; }
    .text-block li { margin: 6px 0; }

    .quiz-content h3 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
    :root.dark-mode .quiz-content h3 { color: #f1f5f9; }
    .quiz-card {
      background: #fff; border-radius: 12px; padding: 20px;
      border: 1px solid #e2e8f0; margin-bottom: 16px;
    }
    :root.dark-mode .quiz-card { background: #1e293b; border-color: #334155; }
    .q-text { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0 0 12px; }
    :root.dark-mode .q-text { color: #f1f5f9; }
    .q-options { display: flex; flex-direction: column; gap: 8px; }
    .q-option {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      border-radius: 8px; border: 1.5px solid #e2e8f0; cursor: pointer;
      font-size: 14px; color: #334155; transition: all 0.2s;
    }
    :root.dark-mode .q-option { border-color: #475569; color: #cbd5e1; }
    .q-option:hover { border-color: #6366f1; background: rgba(99,102,241,0.04); }
    .q-option.selected { border-color: #6366f1; background: rgba(99,102,241,0.08); }
    .radio {
      width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1;
      flex-shrink: 0; transition: all 0.2s;
    }
    .radio.checked { border-color: #6366f1; background: #6366f1; box-shadow: inset 0 0 0 3px #fff; }

    .content-actions {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
      margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;
    }
    :root.dark-mode .content-actions { border-color: #334155; }
    .btn {
      padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px;
      cursor: pointer; border: none; transition: all 0.2s;
    }
    .btn-mark { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
    .btn-mark:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
    .btn-next { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-next:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-finish { background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; }
    .btn-finish:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
    .done-label { font-size: 14px; font-weight: 600; color: #16a34a; }

    .loading-page { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #64748b; }
    .spinner {
      width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.6s linear infinite; margin-bottom: 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .content-grid { grid-template-columns: 1fr; }
      .chapters-panel { border-right: none; border-bottom: 1px solid #e2e8f0; }
    }
  `]
})
export class CoursePlayerComponent implements OnInit {
  assignment: Assignment | null = null;
  loading = true;
  chapters: Chapter[] = [];
  currentChapter = 0;
  quizAnswers: Record<number, number> = {};

  private courseIcons: Record<string, string> = {
    'angular': '🅰️', 'python': '🐍', 'java': '☕', 'javascript': '⚡',
    'docker': '🐳', 'cloud': '☁️', 'data': '📊', 'machine': '🤖',
    'leadership': '👔', 'excel': '📈', 'security': '🔒', 'devops': '⚙️'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentSvc: B2bAssignmentService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('assignmentId'));
    if (!id) { this.loading = false; return; }

    this.assignmentSvc.getById(id).subscribe({
      next: (a) => {
        this.assignment = a;
        this.chapters = this.generateChapters(a.courseName);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private generateChapters(courseName: string): Chapter[] {
    // Generate relevant chapters based on course name
    const templates: Record<string, Chapter[]> = {
      'python fundamentals': [
        { title: 'Introduction to Python', duration: '15 min', type: 'video', completed: false },
        { title: 'Variables & Data Types', duration: '20 min', type: 'video', completed: false },
        { title: 'Control Flow & Loops', duration: '10 min', type: 'reading', completed: false },
        { title: 'Quiz: Python Basics', duration: '10 min', type: 'quiz', completed: false },
        { title: 'Functions & Modules', duration: '25 min', type: 'video', completed: false },
        { title: 'Practice Exercises', duration: '15 min', type: 'reading', completed: false }
      ],
      'javascript mastery': [
        { title: 'JavaScript Essentials', duration: '20 min', type: 'video', completed: false },
        { title: 'ES6+ Modern Features', duration: '25 min', type: 'video', completed: false },
        { title: 'Async Programming', duration: '15 min', type: 'reading', completed: false },
        { title: 'Quiz: JS Concepts', duration: '10 min', type: 'quiz', completed: false },
        { title: 'DOM & Events', duration: '20 min', type: 'video', completed: false },
        { title: 'Project: Build a Mini App', duration: '30 min', type: 'reading', completed: false }
      ],
      'leadership 101': [
        { title: 'What is Leadership?', duration: '15 min', type: 'video', completed: false },
        { title: 'Communication Skills', duration: '20 min', type: 'reading', completed: false },
        { title: 'Team Management', duration: '20 min', type: 'video', completed: false },
        { title: 'Quiz: Leadership Styles', duration: '10 min', type: 'quiz', completed: false },
        { title: 'Conflict Resolution', duration: '15 min', type: 'reading', completed: false }
      ]
    };

    const key = courseName.toLowerCase();
    if (templates[key]) return templates[key];

    // Default chapters for unknown courses
    return [
      { title: 'Introduction', duration: '15 min', type: 'video', completed: false },
      { title: 'Core Concepts', duration: '20 min', type: 'reading', completed: false },
      { title: 'Practical Examples', duration: '25 min', type: 'video', completed: false },
      { title: 'Knowledge Check', duration: '10 min', type: 'quiz', completed: false },
      { title: 'Summary & Next Steps', duration: '10 min', type: 'reading', completed: false }
    ];
  }

  get progressPercent(): number {
    if (!this.chapters.length) return 0;
    const done = this.chapters.filter(c => c.completed).length;
    return Math.round((done / this.chapters.length) * 100);
  }

  get allDone(): boolean {
    return this.chapters.length > 0 && this.chapters.every(c => c.completed);
  }

  selectChapter(index: number) {
    this.currentChapter = index;
  }

  markChapterDone() {
    this.chapters[this.currentChapter].completed = true;
  }

  nextChapter() {
    if (this.currentChapter < this.chapters.length - 1) {
      this.currentChapter++;
    }
  }

  finishCourse() {
    if (!this.assignment) return;
    this.assignmentSvc.updateStatus(this.assignment.id, 'COMPLETED').subscribe({
      next: () => {
        if (this.assignment) this.assignment.status = 'COMPLETED';
        alert('🎉 Congratulations! Course completed successfully!');
        this.router.navigate(['/corporate/my-training']);
      },
      error: () => alert('Error completing the course')
    });
  }

  goBack() {
    this.router.navigate(['/corporate/my-training']);
  }

  getCourseIcon(): string {
    if (!this.assignment) return '📚';
    const name = this.assignment.courseName.toLowerCase();
    for (const [key, icon] of Object.entries(this.courseIcons)) {
      if (name.includes(key)) return icon;
    }
    return '📚';
  }

  statusLabel(): string {
    if (!this.assignment) return '';
    const map: Record<string, string> = {
      'IN_PROGRESS': 'In Progress', 'COMPLETED': 'Completed',
      'ASSIGNED': 'Not Started', 'CANCELLED': 'Cancelled'
    };
    return map[this.assignment.status] || this.assignment.status;
  }

  getQuizQuestions() {
    return [
      {
        question: 'Which concept is fundamental to this topic?',
        options: ['Abstraction', 'Recursion', 'All of the above', 'None of the above']
      },
      {
        question: 'What is the best practice for this skill?',
        options: ['Practice regularly', 'Read documentation', 'Build projects', 'All of the above']
      },
      {
        question: 'How do you apply this in a real project?',
        options: ['Step by step', 'Start with planning', 'Use best practices', 'All answers are correct']
      }
    ];
  }
}
