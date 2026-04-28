import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { B2bCompanyService } from '../services/company.service';
import { B2bEmployeeService } from '../services/employee.service';
import { B2bAssignmentService } from '../services/assignment.service';
import { B2bJobOfferService } from '../services/job-offer.service';
import { B2bMissionService } from '../services/mission.service';
import { B2bApplicationService } from '../services/application.service';
import { Assignment, Application } from '../models/b2b.models';
import { B2bNavService } from '../services/b2b-nav.service';

@Component({
  selector: 'app-b2b-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dash">
      <!-- Loading -->
      <div class="loading-center" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="!loading">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-icon" [style.background]="kpi.bg">{{ kpi.icon }}</div>
          <div class="kpi-info">
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-value">{{ kpi.value }}</span>
          </div>
        </div>
      </div>

      <!-- RH / ADMIN View -->
      <div class="grid-2" *ngIf="isRH || isAdmin">
        <!-- Recent Assignments -->
        <div class="card">
          <div class="card-header">
            <h3>📋 Latest Assignments</h3>
            <a [routerLink]="nav.basePath + '/assignments'" class="link">View all →</a>
          </div>
          <table class="mini-table">
            <thead><tr><th>Training</th><th>Employee</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of recentAssignments">
                <td>{{ a.courseName }}</td>
                <td>#{{ a.employeeId }}</td>
                <td>
                  <div class="progress-bar"><div class="progress-fill" [style.width.%]="a.progressPercent"></div></div>
                  <small>{{ a.progressPercent }}%</small>
                </td>
                <td><span class="badge" [ngClass]="a.status.toLowerCase()">{{ statusLabel(a.status) }}</span></td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="recentAssignments.length===0" class="empty-msg">No assignments</p>
        </div>

        <!-- Alerts -->
        <div class="card">
          <div class="card-header"><h3>⚠️ Alerts</h3></div>
          <div class="alert-list">
            <div *ngFor="let a of alerts" class="alert-item" [ngClass]="a.type">
              <span class="alert-icon">{{ a.type==='danger'?'🔴': a.type==='warning'?'🟠':'🟢' }}</span>
              <span>{{ a.message }}</span>
            </div>
            <p *ngIf="alerts.length===0" class="empty-msg">No alerts</p>
          </div>
        </div>
      </div>

      <!-- MANAGER View -->
      <div class="grid-2" *ngIf="isManager">
        <div class="card">
          <div class="card-header"><h3>👥 My Team</h3></div>
          <table class="mini-table">
            <thead><tr><th>Training</th><th>Employee</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of recentAssignments">
                <td>{{ a.courseName }}</td>
                <td>#{{ a.employeeId }}</td>
                <td>
                  <div class="progress-bar"><div class="progress-fill" [style.width.%]="a.progressPercent"></div></div>
                  <small>{{ a.progressPercent }}%</small>
                </td>
                <td><span class="badge" [ngClass]="a.status.toLowerCase()">{{ statusLabel(a.status) }}</span></td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="recentAssignments.length===0" class="empty-msg">No assignments</p>
        </div>
        <div class="card">
          <div class="card-header"><h3>⚠️ Behind schedule employees</h3></div>
          <div class="alert-list">
            <div *ngFor="let a of alerts" class="alert-item" [ngClass]="a.type">
              <span class="alert-icon">{{ a.type==='danger'?'🔴':'🟠' }}</span>
              <span>{{ a.message }}</span>
            </div>
            <p *ngIf="alerts.length===0" class="empty-msg">All up to date ✅</p>
          </div>
        </div>
      </div>

      <!-- APPRENANT View -->
      <div *ngIf="isApprenant">
        <div class="card">
          <div class="card-header"><h3>📚 My Trainings</h3></div>
          <table class="mini-table">
            <thead><tr><th>Training</th><th>Deadline</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of recentAssignments">
                <td>{{ a.courseName }}</td>
                <td>{{ a.deadline | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div class="progress-bar"><div class="progress-fill" [style.width.%]="a.progressPercent"></div></div>
                  <small>{{ a.progressPercent }}%</small>
                </td>
                <td><span class="badge" [ngClass]="a.status.toLowerCase()">{{ statusLabel(a.status) }}</span></td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="recentAssignments.length===0" class="empty-msg">No training assigned</p>
        </div>
      </div>

      <!-- FORMATEUR / Freelance View -->
      <div *ngIf="isFormateur">
        <div class="card">
          <div class="card-header">
            <h3>🎯 Available Missions</h3>
            <a [routerLink]="nav.basePath + '/missions'" class="link">Browse all →</a>
          </div>
          <p class="empty-msg">Browse missions to find freelance opportunities</p>
        </div>
      </div>

      <!-- Quick Actions for RH -->
      <div class="quick-actions" *ngIf="isRH">
        <h3>Quick Actions</h3>
        <div class="action-grid">
          <a [routerLink]="nav.basePath + '/employees'" class="action-card"><span class="action-icon">👥</span>Manage employees</a>
          <a [routerLink]="nav.basePath + '/assignments/new'" class="action-card"><span class="action-icon">📋</span>Assign training</a>
          <a [routerLink]="nav.basePath + '/packs'" class="action-card"><span class="action-icon">📦</span>Buy packs</a>
          <a [routerLink]="nav.basePath + '/jobs/new'" class="action-card"><span class="action-icon">💼</span>Post a job offer</a>
          <a [routerLink]="nav.basePath + '/missions/new'" class="action-card"><span class="action-icon">🎯</span>Create a mission</a>
          <a [routerLink]="nav.basePath + '/progress'" class="action-card"><span class="action-icon">📊</span>View progress</a>
        </div>
      </div>

      <!-- Quick Actions for Manager -->
      <div class="quick-actions" *ngIf="isManager">
        <h3>Quick Actions</h3>
        <div class="action-grid">
          <a [routerLink]="nav.basePath + '/employees'" class="action-card"><span class="action-icon">👥</span>My Team</a>
          <a [routerLink]="nav.basePath + '/assignments/new'" class="action-card"><span class="action-icon">📋</span>Assign training</a>
          <a [routerLink]="nav.basePath + '/progress'" class="action-card"><span class="action-icon">📈</span>Team progress</a>
          <a [routerLink]="nav.basePath + '/analytics'" class="action-card"><span class="action-icon">📊</span>Analytics</a>
        </div>
      </div>

      <!-- Quick Actions for Employee -->
      <div class="quick-actions" *ngIf="isApprenant">
        <h3>Quick Actions</h3>
        <div class="action-grid">
          <a [routerLink]="nav.basePath + '/my-training'" class="action-card"><span class="action-icon">📚</span>My courses</a>
          <a [routerLink]="nav.basePath + '/assignments'" class="action-card"><span class="action-icon">📋</span>My assignments</a>
          <a [routerLink]="nav.basePath + '/progress'" class="action-card"><span class="action-icon">📈</span>My progress</a>
        </div>
      </div>

      <!-- Quick Actions for Freelancer -->
      <div class="quick-actions" *ngIf="isFormateur">
        <h3>Quick Actions</h3>
        <div class="action-grid">
          <a [routerLink]="nav.basePath + '/missions'" class="action-card"><span class="action-icon">🎯</span>Browse missions</a>
          <a [routerLink]="nav.basePath + '/contracts'" class="action-card"><span class="action-icon">📄</span>My contracts</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash { max-width: none; }

    .loading-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; color: #64748b; gap: 16px; }
    .spinner { width: 44px; height: 44px; border: 4px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      display: flex; align-items: center; gap: 16px;
      padding: 20px; border-radius: 16px;
      background: var(--card-bg, #fff);
      border: 1px solid var(--card-border, rgba(0,0,0,0.06));
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    :root.dark-mode .kpi-card { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
    .kpi-value { font-size: 28px; font-weight: 800; color: var(--text-primary, #0f172a); }
    :root.dark-mode .kpi-value { color: #f1f5f9; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }

    .card {
      background: var(--card-bg, #fff); border-radius: 16px; padding: 20px;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06));
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    :root.dark-mode .card { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { font-size: 16px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .card-header h3 { color: #f1f5f9; }
    .link { font-size: 13px; color: #6366f1; text-decoration: none; font-weight: 600; }
    .link:hover { text-decoration: underline; }

    .mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .mini-table th { text-align: left; padding: 8px 6px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06)); }
    .mini-table td { padding: 10px 6px; border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.03)); color: var(--text-primary, #0f172a); }
    :root.dark-mode .mini-table td { color: #e2e8f0; }

    .progress-bar { width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 6px; }
    :root.dark-mode .progress-bar { background: #334155; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 3px; transition: width 0.3s; }

    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.in_progress { background: #dbeafe; color: #2563eb; }
    .badge.completed { background: #dcfce7; color: #16a34a; }
    .badge.cancelled { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge.in_progress { background: rgba(37,99,235,0.2); }
    :root.dark-mode .badge.completed { background: rgba(22,163,106,0.2); }
    :root.dark-mode .badge.cancelled { background: rgba(220,38,38,0.2); }

    .alert-list { display: flex; flex-direction: column; gap: 8px; }
    .alert-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .alert-item { color: #e2e8f0; }
    .alert-item.danger { background: #fef2f2; }
    .alert-item.warning { background: #fffbeb; }
    .alert-item.success { background: #f0fdf4; }
    :root.dark-mode .alert-item.danger { background: rgba(220,38,38,0.1); }
    :root.dark-mode .alert-item.warning { background: rgba(245,158,11,0.1); }
    :root.dark-mode .alert-item.success { background: rgba(22,163,106,0.1); }
    .alert-icon { font-size: 14px; }
    .empty-msg { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }

    .quick-actions { margin-top: 24px; }
    .quick-actions h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .quick-actions h3 { color: #f1f5f9; }
    .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 20px; border-radius: 12px; text-decoration: none;
      background: var(--card-bg, #fff); border: 1px solid var(--card-border, rgba(0,0,0,0.06));
      color: var(--text-primary, #0f172a); font-size: 13px; font-weight: 600;
      transition: all 0.2s; cursor: pointer;
    }
    .action-card:hover { border-color: #6366f1; box-shadow: 0 4px 12px rgba(99,102,241,0.15); transform: translateY(-2px); }
    :root.dark-mode .action-card { --card-bg: #1e293b; color: #e2e8f0; }
    .action-icon { font-size: 28px; }
  `]
})
export class B2bDashboardComponent implements OnInit {
  userRole = '';
  get isRH() { return this.userRole === 'RH_ENTREPRISE'; }
  get isManager() { return this.userRole === 'MANAGER'; }
  get isApprenant() { return this.userRole === 'APPRENANT'; }
  get isAdmin() { return this.userRole === 'ADMIN'; }
  get isFormateur() { return this.userRole === 'FORMATEUR'; }

  kpis: { icon: string; label: string; value: string | number; bg: string }[] = [];
  recentAssignments: Assignment[] = [];
  alerts: { type: string; message: string }[] = [];
  loading = true;

  constructor(
    private auth: AuthService,
    private companySvc: B2bCompanyService,
    private employeeSvc: B2bEmployeeService,
    private assignmentSvc: B2bAssignmentService,
    private jobSvc: B2bJobOfferService,
    private missionSvc: B2bMissionService,
    private appSvc: B2bApplicationService,
    public nav: B2bNavService
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.userRole = u?.role || 'APPRENANT';
      this.userCompanyId = u?.companyId || null;
      this.loadData();
    });
  }

  private userCompanyId: number | null = null;

  loadData() {
    const empty = (obs: any) => obs.pipe(catchError(() => of([])));

    const isScoped = (this.isRH || this.isManager) && this.userCompanyId;

    forkJoin({
      companies: isScoped ? empty(this.companySvc.getById(this.userCompanyId!)) : empty(this.companySvc.getAll()),
      employees: isScoped ? empty(this.employeeSvc.getByCompany(this.userCompanyId!)) : empty(this.employeeSvc.getAll()),
      assignments: isScoped ? empty(this.assignmentSvc.getByCompany(this.userCompanyId!)) : empty(this.assignmentSvc.getAll()),
      jobs: isScoped ? empty(this.jobSvc.getByCompany(this.userCompanyId!)) : empty(this.jobSvc.getAll()),
      missions: isScoped ? empty(this.missionSvc.getByCompany(this.userCompanyId!)) : empty(this.missionSvc.getAll()),
      applications: empty(this.appSvc.getAll())
    }).subscribe((d: any) => {
      this.loading = false;
      const companies = Array.isArray(d.companies) ? d.companies : (d.companies ? [d.companies] : []);
      const employees = d.employees || [];
      const assignments = d.assignments || [];
      const jobs = d.jobs || [];
      const missions = d.missions || [];
      const applications = d.applications || [];

      // KPIs based on role
      if (this.isRH || this.isAdmin) {
        const credits = companies.reduce((s: number, c: any) => s + (c.creditsRemaining || 0), 0);
        const completed = assignments.filter((a: Assignment) => a.status === 'COMPLETED').length;
        const rate = assignments.length ? Math.round((completed / assignments.length) * 100) : 0;
        this.kpis = [
          { icon: '👥', label: 'Employees', value: employees.length, bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
          { icon: '📋', label: 'Active trainings', value: assignments.length, bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
          { icon: '💰', label: 'Available credits', value: credits, bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' },
          { icon: '✅', label: 'Completion rate', value: rate + '%', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' },
          { icon: '💼', label: 'Active offers', value: jobs.filter((j: any) => j.status === 'OPEN').length, bg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' },
          { icon: '📝', label: 'Applications', value: applications.length, bg: 'linear-gradient(135deg,#cffafe,#a5f3fc)' }
        ];
      } else if (this.isManager) {
        const completed = assignments.filter((a: Assignment) => a.status === 'COMPLETED').length;
        this.kpis = [
          { icon: '👥', label: 'My team', value: employees.length, bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
          { icon: '📋', label: 'Trainings', value: assignments.length, bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
          { icon: '✅', label: 'Completed', value: completed, bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' },
          { icon: '⏳', label: 'In progress', value: assignments.filter((a: Assignment) => a.status === 'IN_PROGRESS').length, bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }
        ];
      } else if (this.isFormateur) {
        this.kpis = [
          { icon: '🎯', label: 'Available missions', value: missions.length, bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
          { icon: '📄', label: 'My contracts', value: 0, bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' },
          { icon: '⭐', label: 'Active missions', value: missions.filter((m: any) => m.status === 'OPEN').length, bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' }
        ];
      } else {
        const myAssignments = assignments;
        const done = myAssignments.filter((a: Assignment) => a.status === 'COMPLETED').length;
        this.kpis = [
          { icon: '📚', label: 'My trainings', value: myAssignments.length, bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
          { icon: '✅', label: 'Completed', value: done, bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' },
          { icon: '⏳', label: 'In progress', value: myAssignments.filter((a: Assignment) => a.status === 'IN_PROGRESS').length, bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' }
        ];
      }

      // Recent assignments (last 5)
      this.recentAssignments = assignments.slice(0, 5);

      // Alerts
      this.alerts = [];
      const now = new Date();
      assignments.forEach((a: Assignment) => {
        if (a.status === 'IN_PROGRESS' && a.deadline) {
          const deadline = new Date(a.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
          if (daysLeft < 0) {
            this.alerts.push({ type: 'danger', message: `Employee #${a.employeeId} behind on "${a.courseName}" (${Math.abs(daysLeft)}d)` });
          } else if (daysLeft <= 7) {
            this.alerts.push({ type: 'warning', message: `Employee #${a.employeeId} — "${a.courseName}" expires in ${daysLeft}d` });
          }
        }
      });
      if (this.alerts.length === 0) {
        this.alerts.push({ type: 'success', message: 'All employees are up to date ✅' });
      }
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { 'IN_PROGRESS': 'In progress', 'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled' };
    return map[s] || s;
  }
}
