import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { B2bAssignmentService } from '../services/assignment.service';
import { B2bEmployeeService } from '../services/employee.service';
import { Assignment } from '../models/b2b.models';

@Component({
  selector: 'app-my-training',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>📚 My Training</h1>
        <p class="subtitle">Track your assigned courses and progress</p>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon purple">📋</div>
          <div class="stat-info">
            <span class="stat-value">{{ assignments.length }}</span>
            <span class="stat-label">Assigned Courses</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">🔄</div>
          <div class="stat-info">
            <span class="stat-value">{{ inProgress }}</span>
            <span class="stat-label">In Progress</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ completed }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">⏰</div>
          <div class="stat-info">
            <span class="stat-value">{{ overdue }}</span>
            <span class="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      <!-- Current Courses -->
      <div class="section">
        <h2>🎯 My Courses</h2>
        <div class="courses-grid" *ngIf="assignments.length > 0">
          <div class="course-card" *ngFor="let a of assignments" [class.overdue-card]="isOverdue(a)" [class.completed-card]="a.status === 'COMPLETED'">
            <div class="course-header">
              <div class="course-icon">{{ getCourseIcon(a) }}</div>
              <div class="course-title-block">
                <span class="course-title">{{ a.courseName }}</span>
                <span class="course-pack">📦 {{ a.packName }}</span>
              </div>
              <span class="badge" [class]="'badge-' + a.status">{{ statusLabel(a.status) }}</span>
            </div>

            <div class="course-meta">
              <span>⏰ Deadline: {{ a.deadline | date:'dd/MM/yyyy' }}</span>
              <span *ngIf="isOverdue(a)" class="overdue-label">⚠️ Overdue by {{ overdueDays(a) }} day(s)</span>
            </div>

            <div class="progress-bar-wrap">
              <div class="progress-label">
                <span>Progress</span>
                <span class="progress-pct">{{ a.progressPercent }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="a.progressPercent"
                     [class.complete]="a.status === 'COMPLETED'"
                     [class.overdue-fill]="isOverdue(a)"></div>
              </div>
            </div>

            <div class="course-actions">
              <button *ngIf="a.status === 'ASSIGNED'" class="btn btn-start" (click)="startTraining(a)">
                ▶️ Start Training
              </button>
              <button *ngIf="a.status === 'IN_PROGRESS'" class="btn btn-continue" (click)="continueTraining(a)">
                📖 Continue Learning
              </button>
              <button *ngIf="a.status === 'IN_PROGRESS'" class="btn btn-complete" (click)="markCompleted(a)">
                ✅ Mark as Completed
              </button>
              <span *ngIf="a.status === 'COMPLETED'" class="completed-label">🎉 Course completed!</span>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="assignments.length === 0 && !loading">
          <div class="empty-icon">📭</div>
          <p>No courses assigned yet</p>
          <span class="empty-sub">Your HR or Manager will assign courses to you from the training catalog.</span>
          <a routerLink="/catalog" class="btn btn-browse">📦 Browse Catalog</a>
        </div>

        <div class="loading" *ngIf="loading">
          <span class="spinner"></span> Loading your training...
        </div>
      </div>

      <!-- Achievements -->
      <div class="section" *ngIf="completed > 0">
        <h2>🏆 Achievements</h2>
        <div class="achievements">
          <div class="achievement" *ngIf="completed >= 1">
            <span class="ach-icon">🎯</span>
            <span class="ach-label">First Course</span>
          </div>
          <div class="achievement" *ngIf="completed >= 3">
            <span class="ach-icon">🔥</span>
            <span class="ach-label">Triple Learner</span>
          </div>
          <div class="achievement" *ngIf="completed >= 5">
            <span class="ach-icon">⭐</span>
            <span class="ach-label">Star Student</span>
          </div>
          <div class="achievement" *ngIf="assignments.length > 0 && completed === assignments.length">
            <span class="ach-icon">💎</span>
            <span class="ach-label">All Done!</span>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div class="section how-section" *ngIf="assignments.length === 0 && !loading">
        <h2>ℹ️ How does it work?</h2>
        <div class="how-steps">
          <div class="how-step">
            <span class="step-num">1</span>
            <span class="step-text">Your HR or Manager assigns you a training course from a pack.</span>
          </div>
          <div class="how-step">
            <span class="step-num">2</span>
            <span class="step-text">You see the course here with its deadline and can click <strong>"Start Training"</strong>.</span>
          </div>
          <div class="how-step">
            <span class="step-num">3</span>
            <span class="step-text">Complete the training on the platform and mark it as <strong>"Completed"</strong>.</span>
          </div>
          <div class="how-step">
            <span class="step-num">4</span>
            <span class="step-text">Earn achievements and track your progress in real time!</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; }
    .page-header h1 { font-size: 26px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    :root.dark-mode .page-header h1 { color: #f1f5f9; }

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0; }
    .stat-card {
      display: flex; align-items: center; gap: 14px; padding: 20px;
      background: var(--card-bg, #fff); border-radius: 14px;
      border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    :root.dark-mode .stat-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .stat-icon { font-size: 28px; width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.purple { background: rgba(99,102,241,0.1); }
    .stat-icon.blue { background: rgba(59,130,246,0.1); }
    .stat-icon.green { background: rgba(34,197,94,0.1); }
    .stat-icon.orange { background: rgba(249,115,22,0.1); }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); }
    :root.dark-mode .stat-value { color: #f1f5f9; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }

    .section { margin-bottom: 32px; }
    .section h2 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin-bottom: 16px; }
    :root.dark-mode .section h2 { color: #f1f5f9; }

    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
    .course-card {
      background: var(--card-bg, #fff); border-radius: 16px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: all 0.3s;
    }
    :root.dark-mode .course-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .course-card:hover { box-shadow: 0 8px 24px rgba(99,102,241,0.1); transform: translateY(-2px); }
    .overdue-card { border-color: rgba(239,68,68,0.3) !important; }
    .completed-card { border-color: rgba(34,197,94,0.3) !important; }

    .course-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .course-icon { font-size: 32px; width: 48px; height: 48px; background: rgba(99,102,241,0.08); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .course-title-block { flex: 1; min-width: 0; }
    .course-title { font-size: 16px; font-weight: 700; color: var(--text-primary, #0f172a); display: block; line-height: 1.3; }
    :root.dark-mode .course-title { color: #f1f5f9; }
    .course-pack { font-size: 12px; color: #64748b; margin-top: 2px; display: block; }

    .course-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #64748b; margin-bottom: 16px; }
    .overdue-label { color: #ef4444; font-weight: 600; }

    .badge { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
    .badge-IN_PROGRESS { background: #dbeafe; color: #1e40af; }
    .badge-COMPLETED { background: #d1fae5; color: #065f46; }
    .badge-ASSIGNED { background: #f1f5f9; color: #475569; }
    .badge-CANCELLED { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge-IN_PROGRESS { background: rgba(37,99,235,0.2); color: #60a5fa; }
    :root.dark-mode .badge-COMPLETED { background: rgba(22,163,106,0.2); color: #4ade80; }
    :root.dark-mode .badge-ASSIGNED { background: rgba(71,85,105,0.3); color: #94a3b8; }

    .progress-bar-wrap { margin-bottom: 16px; }
    .progress-label { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 6px; }
    .progress-pct { font-weight: 700; color: #6366f1; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    :root.dark-mode .progress-bar { background: #334155; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; transition: width 0.5s; }
    .progress-fill.complete { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .progress-fill.overdue-fill { background: linear-gradient(90deg, #ef4444, #f97316); }

    .course-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .btn { padding: 8px 16px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
    .btn-start { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-start:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-continue { background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; }
    .btn-continue:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
    .btn-complete { background: rgba(34,197,94,0.1); color: #16a34a; border: 1.5px solid rgba(34,197,94,0.3); }
    .btn-complete:hover { background: rgba(34,197,94,0.15); }
    .btn-browse { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; margin-top: 16px; }
    .completed-label { font-size: 14px; font-weight: 600; color: #16a34a; }

    .empty-state { text-align: center; padding: 48px 24px; color: #64748b; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 16px; font-weight: 600; margin: 0 0 4px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .empty-state p { color: #f1f5f9; }
    .empty-sub { font-size: 13px; }

    .loading { display: flex; align-items: center; gap: 10px; padding: 24px; color: #64748b; font-size: 14px; }
    .spinner {
      width: 20px; height: 20px; border: 2.5px solid #e2e8f0; border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .achievements { display: flex; gap: 16px; flex-wrap: wrap; }
    .achievement {
      display: flex; align-items: center; gap: 8px; padding: 12px 20px;
      background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06));
      border: 1.5px solid rgba(99,102,241,0.15); border-radius: 12px;
    }
    .ach-icon { font-size: 24px; }
    .ach-label { font-size: 14px; font-weight: 600; color: var(--text-primary, #0f172a); }
    :root.dark-mode .ach-label { color: #f1f5f9; }

    .how-section { margin-top: 16px; }
    .how-steps { display: grid; gap: 12px; }
    .how-step {
      display: flex; align-items: center; gap: 16px; padding: 16px 20px;
      background: var(--card-bg, #fff); border-radius: 12px;
      border: 1px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .how-step { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .step-num {
      width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; font-weight: 800; font-size: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .step-text { font-size: 14px; color: var(--text-primary, #0f172a); line-height: 1.5; }
    :root.dark-mode .step-text { color: #e2e8f0; }

    @media (max-width: 640px) {
      .courses-grid { grid-template-columns: 1fr; }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class MyTrainingComponent implements OnInit {
  assignments: Assignment[] = [];
  loading = true;
  completed = 0;
  inProgress = 0;
  overdue = 0;
  employeeId: number | null = null;

  private courseIcons: Record<string, string> = {
    'angular': '🅰️', 'python': '🐍', 'java': '☕', 'javascript': '⚡',
    'docker': '🐳', 'cloud': '☁️', 'data': '📊', 'machine': '🤖',
    'deep': '🧠', 'leadership': '👔', 'excel': '📈', 'project': '📋',
    'security': '🔒', 'devops': '⚙️', 'sql': '🗄️', 'git': '🔀',
    'agile': '🏃', 'big': '💾'
  };

  constructor(
    private authService: AuthService,
    private assignmentSvc: B2bAssignmentService,
    private employeeSvc: B2bEmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      console.log('[MyTraining] currentUser$ emitted:', JSON.stringify(user));
      // Handle both camelCase and snake_case field names
      const userId = user?.idUser ?? (user as any)?.id_user;
      console.log('[MyTraining] resolved userId:', userId);
      if (userId) {
        this.employeeId = userId;
        this.loadAssignments(userId);
      } else {
        console.warn('[MyTraining] No userId found in user object');
        this.loading = false;
      }
    });
  }

  private loadAssignments(userId: number) {
    this.loading = true;
    console.log('[MyTraining] Loading assignments for employee:', userId);
    // Load assignments for this employee (employee ID = user ID)
    this.assignmentSvc.getByEmployee(userId).subscribe({
      next: (data) => {
        console.log('[MyTraining] getByEmployee response:', JSON.stringify(data));
        this.assignments = data ?? [];
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('[MyTraining] getByEmployee error:', err);
        // Fallback: try loading all and filtering
        this.assignmentSvc.getAll().subscribe({
          next: (all) => {
            console.log('[MyTraining] getAll fallback, total:', all?.length, 'filtered:', (all ?? []).filter(a => a.employeeId === userId).length);
            this.assignments = (all ?? []).filter(a => a.employeeId === userId);
            this.calculateStats();
            this.loading = false;
          },
          error: (e2) => {
            console.error('[MyTraining] getAll also failed:', e2);
            this.assignments = [];
            this.loading = false;
          }
        });
      }
    });
  }

  private calculateStats() {
    this.completed = this.assignments.filter(a => a.status === 'COMPLETED').length;
    this.inProgress = this.assignments.filter(a => a.status === 'IN_PROGRESS').length;
    this.overdue = this.assignments.filter(a => this.isOverdue(a)).length;
  }

  startTraining(a: Assignment) {
    this.assignmentSvc.updateStatus(a.id, 'IN_PROGRESS').subscribe({
      next: (updated) => {
        a.status = updated.status;
        this.calculateStats();
        // Navigate to the course player
        this.router.navigate(['/corporate/course-player', a.id]);
      },
      error: () => alert('Error starting training')
    });
  }

  continueTraining(a: Assignment) {
    this.router.navigate(['/corporate/course-player', a.id]);
  }

  markCompleted(a: Assignment) {
    if (!confirm('Mark "' + a.courseName + '" as completed?')) return;
    this.assignmentSvc.updateStatus(a.id, 'COMPLETED').subscribe({
      next: (updated) => {
        a.status = updated.status;
        this.calculateStats();
      },
      error: () => alert('Error updating status')
    });
  }

  isOverdue(a: Assignment): boolean {
    if (a.status === 'COMPLETED' || a.status === 'CANCELLED') return false;
    return new Date(a.deadline) < new Date();
  }

  overdueDays(a: Assignment): number {
    const diff = new Date().getTime() - new Date(a.deadline).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'ASSIGNED': 'Not Started',
      'CANCELLED': 'Cancelled'
    };
    return map[s] || s;
  }

  getCourseIcon(a: Assignment): string {
    const name = a.courseName.toLowerCase();
    for (const [key, icon] of Object.entries(this.courseIcons)) {
      if (name.includes(key)) return icon;
    }
    return '📚';
  }
}
