import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of, catchError, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { B2bCompanyService } from '../../../../admin/b2b/services/company.service';
import { B2bEmployeeService } from '../../../../admin/b2b/services/employee.service';
import { B2bAssignmentService } from '../../../../admin/b2b/services/assignment.service';
import { Company, Employee, Assignment } from '../../../../admin/b2b/models/b2b.models';

@Component({
  selector: 'app-my-company',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-company-page">

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading your company...</p>
      </div>

      <!-- No company found -->
      <div class="empty-state" *ngIf="!loading && !company">
        <div class="empty-icon">🏢</div>
        <h2>No Company Found</h2>
        <p>You are not currently associated with any company. Contact your HR administrator.</p>
        <a routerLink="/corporate-home" class="btn-back">← Back to Corporate Home</a>
      </div>

      <!-- Company found -->
      <div *ngIf="!loading && company" class="company-content">

        <!-- Company Header -->
        <div class="company-hero">
          <div class="company-avatar">{{ company.name.charAt(0) }}</div>
          <div class="company-info">
            <h1>{{ company.name }}</h1>
            <div class="company-meta">
              <span class="meta-item">🏭 {{ company.sector }}</span>
              <span class="meta-item">📍 {{ company.address }}</span>
              <span class="meta-item">📧 {{ company.email }}</span>
              <span class="meta-item" *ngIf="company.phone">📞 {{ company.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Company KPIs -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(99,102,241,0.1)">👥</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ employees.length }}</span>
              <span class="kpi-label">Employees</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(34,197,94,0.1)">📋</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ assignments.length }}</span>
              <span class="kpi-label">Training Assignments</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(59,130,246,0.1)">✅</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ completedCount }}</span>
              <span class="kpi-label">Completed</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(245,158,11,0.1)">📊</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ avgProgress }}%</span>
              <span class="kpi-label">Avg. Progress</span>
            </div>
          </div>
        </div>

        <!-- Departments -->
        <div class="section" *ngIf="departments.length > 0">
          <h2>🏛 Departments</h2>
          <div class="departments-grid">
            <div class="dept-card" *ngFor="let d of departments">
              <div class="dept-icon">{{ d.icon }}</div>
              <div class="dept-info">
                <h4>{{ d.name }}</h4>
                <span>{{ d.count }} employee(s)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Colleagues -->
        <div class="section">
          <div class="section-header">
            <h2>👥 Team Members</h2>
            <span class="badge">{{ employees.length }}</span>
          </div>
          <div class="colleagues-grid" *ngIf="employees.length > 0">
            <div class="colleague-card" *ngFor="let e of employees.slice(0, showAllColleagues ? 999 : 8)">
              <div class="colleague-avatar" [style.background]="getAvatarColor(e)">
                {{ getInitials(e) }}
              </div>
              <div class="colleague-info">
                <h4>Employee #{{ e.id }}</h4>
                <span class="colleague-dept">{{ e.department || 'Unknown' }}</span>
                <span class="colleague-pos">{{ e.position || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <button *ngIf="employees.length > 8 && !showAllColleagues"
                  (click)="showAllColleagues = true" class="btn-show-more">
            Show all {{ employees.length }} members
          </button>
        </div>

        <!-- My Assignments -->
        <div class="section" *ngIf="myAssignments.length > 0">
          <h2>📚 My Training Assignments</h2>
          <div class="assignments-list">
            <div class="assignment-card" *ngFor="let a of myAssignments">
              <div class="assgn-left">
                <h4>{{ a.courseName || 'Training #' + a.id }}</h4>
                <div class="assgn-meta">
                  <span>Pack: {{ a.packName || 'N/A' }}</span>
                  <span *ngIf="a.deadline">Deadline: {{ a.deadline | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="assgn-right">
                <div class="progress-ring">
                  <svg viewBox="0 0 36 36">
                    <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="ring-fill" [attr.stroke-dasharray]="a.progressPercent + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <text x="18" y="20.5" class="ring-text">{{ a.progressPercent || 0 }}%</text>
                  </svg>
                </div>
                <span class="assgn-status" [class]="'status-' + a.status">{{ a.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Info Card -->
        <div class="section">
          <h2>ℹ️ Company Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">SIRET</span>
              <span class="info-value">{{ company.siret || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Sector</span>
              <span class="info-value">{{ company.sector }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ company.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ company.phone || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Address</span>
              <span class="info-value">{{ company.address }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Credits Remaining</span>
              <span class="info-value credits">{{ company.creditsRemaining || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Created</span>
              <span class="info-value">{{ company.createdAt | date:'longDate' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-company-page { max-width: 1100px; margin: 0 auto; padding: 0 16px 40px; }

    .loading-state { text-align: center; padding: 100px 20px; color: #64748b; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h2 { font-size: 24px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 8px; }
    :root.dark-mode .empty-state h2 { color: #f1f5f9; }
    .empty-state p { color: #64748b; margin-bottom: 24px; }
    .btn-back {
      display: inline-block; padding: 12px 24px; border-radius: 12px;
      background: #6366f1; color: #fff; text-decoration: none; font-weight: 600;
    }

    /* ---- Hero ---- */
    .company-hero {
      display: flex; align-items: center; gap: 24px; padding: 32px;
      background: linear-gradient(135deg, #312e81, #4f46e5);
      border-radius: 24px; margin: 24px 0; color: #fff;
    }
    .company-avatar {
      width: 80px; height: 80px; border-radius: 20px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 900; flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .company-info h1 { font-size: 28px; font-weight: 800; margin: 0 0 10px; }
    .company-meta { display: flex; gap: 20px; flex-wrap: wrap; }
    .meta-item { font-size: 14px; color: rgba(255,255,255,0.8); }

    /* ---- KPIs ---- */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi-card {
      display: flex; align-items: center; gap: 14px; padding: 20px;
      background: var(--card-bg, #fff); border-radius: 16px;
      border: 1.5px solid rgba(0,0,0,0.06); box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    :root.dark-mode .kpi-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .kpi-value { font-size: 26px; font-weight: 800; color: var(--text-primary, #0f172a); }
    :root.dark-mode .kpi-value { color: #f1f5f9; }
    .kpi-label { font-size: 12px; color: #64748b; }
    .kpi-info { display: flex; flex-direction: column; }

    /* ---- Sections ---- */
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 20px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0 0 16px; }
    :root.dark-mode .section h2 { color: #f1f5f9; }
    .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .section-header h2 { margin: 0; }
    .badge { background: #6366f1; color: #fff; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }

    /* ---- Departments ---- */
    .departments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
    .dept-card {
      display: flex; align-items: center; gap: 14px; padding: 16px 20px;
      background: var(--card-bg, #fff); border-radius: 14px; border: 1.5px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .dept-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .dept-icon { font-size: 28px; }
    .dept-info h4 { font-size: 15px; font-weight: 700; margin: 0; color: var(--text-primary, #0f172a); }
    :root.dark-mode .dept-info h4 { color: #f1f5f9; }
    .dept-info span { font-size: 12px; color: #64748b; }

    /* ---- Colleagues ---- */
    .colleagues-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
    .colleague-card {
      display: flex; align-items: center; gap: 14px; padding: 16px;
      background: var(--card-bg, #fff); border-radius: 14px; border: 1.5px solid rgba(0,0,0,0.06);
      transition: all 0.2s;
    }
    .colleague-card:hover { border-color: #6366f1; box-shadow: 0 4px 12px rgba(99,102,241,0.08); }
    :root.dark-mode .colleague-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .colleague-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .colleague-info h4 { font-size: 15px; font-weight: 600; margin: 0 0 2px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .colleague-info h4 { color: #f1f5f9; }
    .colleague-dept { font-size: 12px; color: #6366f1; font-weight: 600; display: block; }
    .colleague-pos { font-size: 12px; color: #64748b; }

    .btn-show-more {
      display: block; margin: 16px auto 0; padding: 10px 24px; border-radius: 10px;
      border: 1.5px solid #6366f1; background: transparent; color: #6366f1;
      font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
    }
    .btn-show-more:hover { background: #6366f1; color: #fff; }

    /* ---- Assignments ---- */
    .assignments-list { display: flex; flex-direction: column; gap: 14px; }
    .assignment-card {
      display: flex; justify-content: space-between; align-items: center; padding: 20px 24px;
      background: var(--card-bg, #fff); border-radius: 16px; border: 1.5px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .assignment-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .assgn-left h4 { font-size: 16px; font-weight: 700; margin: 0 0 6px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .assgn-left h4 { color: #f1f5f9; }
    .assgn-meta { display: flex; gap: 16px; font-size: 13px; color: #64748b; }
    .assgn-right { display: flex; align-items: center; gap: 16px; }

    .progress-ring { width: 52px; height: 52px; }
    .progress-ring svg { width: 100%; height: 100%; }
    .ring-bg { fill: none; stroke: #e2e8f0; stroke-width: 3; }
    :root.dark-mode .ring-bg { stroke: #334155; }
    .ring-fill { fill: none; stroke: #6366f1; stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 0.5s; }
    .ring-text { fill: var(--text-primary, #0f172a); font-size: 9px; font-weight: 700; text-anchor: middle; }
    :root.dark-mode .ring-text { fill: #f1f5f9; }

    .assgn-status {
      font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;
    }
    .status-IN_PROGRESS { background: #dbeafe; color: #1e40af; }
    .status-COMPLETED { background: #d1fae5; color: #065f46; }
    .status-CANCELLED { background: #fef2f2; color: #dc2626; }

    /* ---- Info Grid ---- */
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .info-item {
      padding: 16px 20px; background: var(--card-bg, #fff); border-radius: 14px;
      border: 1.5px solid rgba(0,0,0,0.06);
    }
    :root.dark-mode .info-item { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .info-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8; margin-bottom: 4px; }
    .info-value { font-size: 15px; font-weight: 600; color: var(--text-primary, #0f172a); }
    :root.dark-mode .info-value { color: #f1f5f9; }
    .info-value.credits { color: #6366f1; font-size: 20px; font-weight: 800; }

    @media (max-width: 900px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .company-hero { flex-direction: column; text-align: center; }
      .company-meta { justify-content: center; }
    }
  `]
})
export class MyCompanyComponent implements OnInit {
  loading = true;
  company: Company | null = null;
  employees: Employee[] = [];
  assignments: Assignment[] = [];
  myAssignments: Assignment[] = [];
  completedCount = 0;
  avgProgress = 0;
  showAllColleagues = false;
  departments: { name: string; count: number; icon: string }[] = [];

  private readonly deptIcons: Record<string, string> = {
    'IT': '💻', 'HR': '👥', 'Finance': '💰', 'Marketing': '📣',
    'Sales': '📈', 'Engineering': '⚙️', 'Design': '🎨', 'Legal': '⚖️',
    'Operations': '🔧', 'Support': '🎧', 'Management': '📋', 'R&D': '🔬'
  };

  constructor(
    private authService: AuthService,
    private companySvc: B2bCompanyService,
    private employeeSvc: B2bEmployeeService,
    private assignmentSvc: B2bAssignmentService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && (user as any).companyId) {
        this.loadCompany((user as any).companyId, user.idUser);
      } else {
        // Try to find employee by user ID
        this.employeeSvc.getAll().subscribe({
          next: emps => {
            const myEmp = emps.find(e => e.id === user?.idUser);
            if (myEmp) {
              this.loadCompany(myEmp.companyId, user!.idUser);
            } else {
              this.loading = false;
            }
          },
          error: () => { this.loading = false; }
        });
      }
    });
  }

  private loadCompany(companyId: number, userId: number) {
    forkJoin({
      company: this.companySvc.getById(companyId).pipe(catchError(() => of(null))),
      employees: this.employeeSvc.getByCompany(companyId).pipe(catchError(() => of([]))),
      assignments: this.assignmentSvc.getByCompany(companyId).pipe(catchError(() => of([])))
    }).subscribe(({ company, employees, assignments }) => {
      this.company = company;
      this.employees = employees;
      this.assignments = assignments;
      this.myAssignments = assignments.filter(a => a.employeeId === userId);
      this.completedCount = assignments.filter(a => a.status === 'COMPLETED').length;
      const total = assignments.reduce((sum, a) => sum + (a.progressPercent || 0), 0);
      this.avgProgress = assignments.length > 0 ? Math.round(total / assignments.length) : 0;

      // Build departments
      const deptMap = new Map<string, number>();
      employees.forEach(e => {
        const dept = e.department || 'Unassigned';
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
      });
      this.departments = [...deptMap.entries()].map(([name, count]) => ({
        name,
        count,
        icon: this.deptIcons[name] || '📁'
      })).sort((a, b) => b.count - a.count);

      this.loading = false;
    });
  }

  getInitials(e: Employee): string {
    return `E${e.id}`;
  }

  getAvatarColor(e: Employee): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #22c55e, #10b981)',
      'linear-gradient(135deg, #f59e0b, #f97316)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
      'linear-gradient(135deg, #8b5cf6, #a855f7)',
    ];
    return colors[e.id % colors.length];
  }
}
