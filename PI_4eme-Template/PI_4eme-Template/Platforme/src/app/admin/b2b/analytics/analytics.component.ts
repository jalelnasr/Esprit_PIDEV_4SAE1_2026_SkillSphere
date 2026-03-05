import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

import { AuthService } from '../../../core/services/auth.service';
import { B2bCompanyService } from '../services/company.service';
import { B2bEmployeeService } from '../services/employee.service';
import { B2bAssignmentService } from '../services/assignment.service';
import { B2bJobOfferService } from '../services/job-offer.service';
import { B2bApplicationService } from '../services/application.service';
import { B2bMissionService } from '../services/mission.service';
import { B2bContractService } from '../services/contract.service';
import { Company, Employee, Assignment, JobOffer, Application, Mission, Contract } from '../models/b2b.models';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>📊 Analytics & Reports</h1>
          <p class="subtitle">Comprehensive insights into your corporate training platform</p>
        </div>
        <div class="header-actions">
          <select [(ngModel)]="selectedPeriod" (change)="onPeriodChange()" class="period-select">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="0">All time</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading analytics...</p>
      </div>

      <div *ngIf="!loading" class="analytics-content">
        <!-- Summary KPIs -->
        <div class="kpi-row">
          <div class="kpi-card" *ngFor="let kpi of kpis">
            <div class="kpi-icon">{{ kpi.icon }}</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="kpi-label">{{ kpi.label }}</span>
            </div>
            <div class="kpi-trend" [class.up]="kpi.trend > 0" [class.down]="kpi.trend < 0">
              {{ kpi.trend > 0 ? '↑' : kpi.trend < 0 ? '↓' : '→' }}
              {{ kpi.trendLabel }}
            </div>
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="charts-row">
          <div class="chart-card wide">
            <h3>Training Progress Over Time</h3>
            <canvas #progressChart></canvas>
          </div>
          <div class="chart-card">
            <h3>Assignment Status</h3>
            <canvas #statusChart></canvas>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-row">
          <div class="chart-card">
            <h3>Employees by Department</h3>
            <canvas #departmentChart></canvas>
          </div>
          <div class="chart-card wide">
            <h3>Recruitment Pipeline</h3>
            <canvas #recruitmentChart></canvas>
          </div>
        </div>

        <!-- Charts Row 3 -->
        <div class="charts-row">
          <div class="chart-card">
            <h3>Top Trainings by Completion</h3>
            <canvas #topTrainingsChart></canvas>
          </div>
          <div class="chart-card">
            <h3>Contract Status Overview</h3>
            <canvas #contractChart></canvas>
          </div>
        </div>

        <!-- Data Tables -->
        <div class="charts-row">
          <div class="chart-card wide">
            <h3>🏆 Employee Performance Ranking</h3>
            <div class="ranking-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Trainings</th>
                    <th>Avg. Progress</th>
                    <th>Completed</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let emp of topEmployees; let i = index">
                    <td>
                      <span class="rank-badge" [class]="'rank-' + (i + 1)">{{ i + 1 }}</span>
                    </td>
                    <td class="emp-name">Employee #{{ emp.id }}</td>
                    <td>{{ emp.department }}</td>
                    <td>{{ emp.totalAssignments }}</td>
                    <td>
                      <div class="progress-cell">
                        <div class="mini-progress">
                          <div class="mini-bar" [style.width.%]="emp.avgProgress"
                               [style.background]="emp.avgProgress >= 80 ? '#22c55e' : emp.avgProgress >= 50 ? '#f59e0b' : '#ef4444'"></div>
                        </div>
                        <span>{{ emp.avgProgress }}%</span>
                      </div>
                    </td>
                    <td>{{ emp.completed }}/{{ emp.totalAssignments }}</td>
                    <td>
                      <span class="perf-badge" [class]="emp.avgProgress >= 80 ? 'excellent' : emp.avgProgress >= 50 ? 'good' : 'needs-work'">
                        {{ emp.avgProgress >= 80 ? 'Excellent' : emp.avgProgress >= 50 ? 'Good' : 'Needs Work' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p class="empty-msg" *ngIf="topEmployees.length === 0">No employee data available</p>
            </div>
          </div>

          <div class="chart-card">
            <h3>📈 Quick Stats</h3>
            <div class="quick-stats">
              <div class="stat-item">
                <span class="stat-label">Avg. Completion Rate</span>
                <span class="stat-value">{{ avgCompletionRate }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Overdue Assignments</span>
                <span class="stat-value danger">{{ overdueCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Active Job Offers</span>
                <span class="stat-value">{{ activeJobsCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Pending Applications</span>
                <span class="stat-value warning">{{ pendingAppsCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Active Contracts</span>
                <span class="stat-value">{{ activeContractsCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Budget (Contracts)</span>
                <span class="stat-value">{{ totalContractBudget | number:'1.0-0' }} TND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page { padding: 24px; max-width: 1400px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h1 { font-size: 24px; font-weight: 700; margin: 0; color: var(--text-primary, #1e293b); }
    .subtitle { color: var(--text-secondary, #64748b); margin-top: 4px; font-size: 14px; }

    .period-select {
      padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-primary, #1e293b);
      font-size: 14px; cursor: pointer;
    }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px 0; color: var(--text-secondary, #64748b);
    }
    .spinner {
      width: 40px; height: 40px; border: 3px solid var(--border, #e2e8f0);
      border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* KPI Row */
    .kpi-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--bg-card, #fff); border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 14px;
      border: 1px solid var(--border, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .kpi-icon { font-size: 32px; }
    .kpi-info { display: flex; flex-direction: column; flex: 1; }
    .kpi-value { font-size: 24px; font-weight: 700; color: var(--text-primary, #1e293b); }
    .kpi-label { font-size: 12px; color: var(--text-secondary, #64748b); margin-top: 2px; }
    .kpi-trend {
      font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 6px;
      background: var(--bg-muted, #f1f5f9); color: var(--text-secondary, #64748b);
    }
    .kpi-trend.up { background: #dcfce7; color: #16a34a; }
    .kpi-trend.down { background: #fef2f2; color: #dc2626; }

    /* Charts */
    .charts-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;
    }
    .chart-card {
      background: var(--bg-card, #fff); border-radius: 12px; padding: 24px;
      border: 1px solid var(--border, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .chart-card.wide { grid-column: span 1; }
    .chart-card h3 { font-size: 16px; font-weight: 600; margin: 0 0 16px; color: var(--text-primary, #1e293b); }
    canvas { max-height: 280px; }

    /* Rankings */
    .ranking-table { overflow-x: auto; }
    .ranking-table table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .ranking-table th {
      text-align: left; padding: 10px 12px; color: var(--text-secondary, #64748b);
      font-weight: 600; font-size: 12px; text-transform: uppercase;
      border-bottom: 2px solid var(--border, #e2e8f0);
    }
    .ranking-table td { padding: 10px 12px; border-bottom: 1px solid var(--border, #f1f5f9); }
    .rank-badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%; font-weight: 700; font-size: 13px;
      background: var(--bg-muted, #f1f5f9); color: var(--text-secondary, #64748b);
    }
    .rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #fff; }
    .rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); color: #fff; }
    .rank-3 { background: linear-gradient(135deg, #d97706, #b45309); color: #fff; }
    .emp-name { font-weight: 600; color: var(--text-primary, #1e293b); }

    .progress-cell { display: flex; align-items: center; gap: 8px; }
    .mini-progress {
      width: 60px; height: 6px; background: var(--bg-muted, #e2e8f0);
      border-radius: 3px; overflow: hidden;
    }
    .mini-bar { height: 100%; border-radius: 3px; transition: width 0.3s; }

    .perf-badge {
      padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .perf-badge.excellent { background: #dcfce7; color: #16a34a; }
    .perf-badge.good { background: #fef3c7; color: #d97706; }
    .perf-badge.needs-work { background: #fef2f2; color: #dc2626; }

    .empty-msg { text-align: center; padding: 20px; color: var(--text-secondary, #64748b); }

    /* Quick Stats */
    .quick-stats { display: flex; flex-direction: column; gap: 16px; }
    .stat-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border, #f1f5f9);
    }
    .stat-item:last-child { border: none; }
    .stat-label { font-size: 14px; color: var(--text-secondary, #64748b); }
    .stat-value { font-size: 20px; font-weight: 700; color: var(--text-primary, #1e293b); }
    .stat-value.danger { color: #dc2626; }
    .stat-value.warning { color: #d97706; }

    @media (max-width: 900px) {
      .charts-row { grid-template-columns: 1fr; }
      .chart-card.wide { grid-column: span 1; }
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .kpi-row { grid-template-columns: 1fr; }
      .analytics-page { padding: 16px; }
    }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('progressChart') progressChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('departmentChart') departmentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('recruitmentChart') recruitmentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topTrainingsChart') topTrainingsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('contractChart') contractChartRef!: ElementRef<HTMLCanvasElement>;

  loading = true;
  selectedPeriod = '30';
  charts: Chart[] = [];

  // Data
  companies: Company[] = [];
  employees: Employee[] = [];
  assignments: Assignment[] = [];
  jobs: JobOffer[] = [];
  applications: Application[] = [];
  missions: Mission[] = [];
  contracts: Contract[] = [];

  // Computed
  kpis: { icon: string; value: string | number; label: string; trend: number; trendLabel: string }[] = [];
  topEmployees: { id: number; department: string; totalAssignments: number; completed: number; avgProgress: number }[] = [];
  avgCompletionRate = 0;
  overdueCount = 0;
  activeJobsCount = 0;
  pendingAppsCount = 0;
  activeContractsCount = 0;
  totalContractBudget = 0;

  private userRole = '';
  private companyId: number | null = null;
  private chartsReady = false;
  private dataReady = false;

  constructor(
    private authService: AuthService,
    private companySvc: B2bCompanyService,
    private employeeSvc: B2bEmployeeService,
    private assignmentSvc: B2bAssignmentService,
    private jobSvc: B2bJobOfferService,
    private appSvc: B2bApplicationService,
    private missionSvc: B2bMissionService,
    private contractSvc: B2bContractService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || 'APPRENANT';
      this.companyId = user?.companyId ? Number(user.companyId) : null;
      this.loadData();
    });
  }

  ngAfterViewInit() {
    this.chartsReady = true;
    if (this.dataReady) {
      setTimeout(() => this.buildCharts(), 100);
    }
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  onPeriodChange() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    const isScoped = ['RH_ENTREPRISE', 'MANAGER'].includes(this.userRole) && this.companyId;

    forkJoin({
      companies: (isScoped ? this.companySvc.getById(this.companyId!).pipe(catchError(() => of(null))) : this.companySvc.getAll().pipe(catchError(() => of([])))),
      employees: (isScoped ? this.employeeSvc.getByCompany(this.companyId!) : this.employeeSvc.getAll()).pipe(catchError(() => of([]))),
      assignments: (isScoped ? this.assignmentSvc.getByCompany(this.companyId!) : this.assignmentSvc.getAll()).pipe(catchError(() => of([]))),
      jobs: (isScoped ? this.jobSvc.getByCompany(this.companyId!) : this.jobSvc.getAll()).pipe(catchError(() => of([]))),
      applications: this.appSvc.getAll().pipe(catchError(() => of([]))),
      missions: (isScoped ? this.missionSvc.getByCompany(this.companyId!) : this.missionSvc.getAll()).pipe(catchError(() => of([]))),
      contracts: (isScoped ? this.contractSvc.getByCompany(this.companyId!) : this.contractSvc.getAll()).pipe(catchError(() => of([])))
    }).subscribe(data => {
      this.companies = Array.isArray(data.companies) ? data.companies : data.companies ? [data.companies] : [];
      this.employees = data.employees as Employee[];
      this.assignments = data.assignments as Assignment[];
      this.jobs = data.jobs as JobOffer[];
      this.applications = data.applications as Application[];
      this.missions = data.missions as Mission[];
      this.contracts = data.contracts as Contract[];

      this.computeAnalytics();
      this.loading = false;
      this.dataReady = true;

      if (this.chartsReady) {
        setTimeout(() => this.buildCharts(), 100);
      }
    });
  }

  private computeAnalytics() {
    const completed = this.assignments.filter(a => a.status === 'COMPLETED');
    const inProgress = this.assignments.filter(a => a.status === 'IN_PROGRESS');
    const now = new Date();

    this.avgCompletionRate = this.assignments.length > 0
      ? Math.round((completed.length / this.assignments.length) * 100) : 0;

    this.overdueCount = inProgress.filter(a => a.deadline && new Date(a.deadline) < now).length;
    this.activeJobsCount = this.jobs.filter(j => j.status === 'OPEN').length;
    this.pendingAppsCount = this.applications.filter(a => a.status === 'PENDING').length;
    this.activeContractsCount = this.contracts.filter(c => ['ACTIVE', 'SIGNED'].includes(c.status)).length;
    this.totalContractBudget = this.contracts
      .filter(c => ['ACTIVE', 'SIGNED', 'COMPLETED'].includes(c.status))
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    // KPIs
    this.kpis = [
      { icon: '👥', value: this.employees.length, label: 'Total Employees', trend: 1, trendLabel: 'Active' },
      { icon: '📋', value: this.assignments.length, label: 'Total Assignments', trend: inProgress.length > 0 ? 1 : 0, trendLabel: `${inProgress.length} active` },
      { icon: '✅', value: this.avgCompletionRate + '%', label: 'Completion Rate', trend: this.avgCompletionRate >= 70 ? 1 : this.avgCompletionRate >= 40 ? 0 : -1, trendLabel: this.avgCompletionRate >= 70 ? 'On track' : 'Needs attention' },
      { icon: '💼', value: this.jobs.length, label: 'Job Offers', trend: this.activeJobsCount > 0 ? 1 : 0, trendLabel: `${this.activeJobsCount} open` },
      { icon: '🎯', value: this.missions.length, label: 'Freelance Missions', trend: 0, trendLabel: `${this.missions.filter(m => m.status === 'OPEN').length} open` },
      { icon: '📄', value: this.contracts.length, label: 'Contracts', trend: this.activeContractsCount > 0 ? 1 : 0, trendLabel: `${this.activeContractsCount} active` }
    ];

    // Top employees
    const empMap = new Map<number, { id: number; department: string; total: number; completed: number; totalProgress: number }>();
    this.assignments.forEach(a => {
      const empId = a.employeeId;
      if (!empMap.has(empId)) {
        const emp = this.employees.find(e => e.id === empId);
        empMap.set(empId, { id: empId, department: emp?.department || 'N/A', total: 0, completed: 0, totalProgress: 0 });
      }
      const entry = empMap.get(empId)!;
      entry.total++;
      if (a.status === 'COMPLETED') entry.completed++;
      entry.totalProgress += (a.progressPercent || 0);
    });

    this.topEmployees = Array.from(empMap.values())
      .map(e => ({
        id: e.id,
        department: e.department,
        totalAssignments: e.total,
        completed: e.completed,
        avgProgress: e.total > 0 ? Math.round(e.totalProgress / e.total) : 0
      }))
      .sort((a, b) => b.avgProgress - a.avgProgress)
      .slice(0, 10);
  }

  private buildCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    this.buildProgressChart();
    this.buildStatusChart();
    this.buildDepartmentChart();
    this.buildRecruitmentChart();
    this.buildTopTrainingsChart();
    this.buildContractChart();
  }

  private buildProgressChart() {
    if (!this.progressChartRef) return;
    const ctx = this.progressChartRef.nativeElement.getContext('2d')!;

    // Simulate monthly progress from assignments
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const completedByMonth = new Array(12).fill(0);
    const assignedByMonth = new Array(12).fill(0);

    this.assignments.forEach(a => {
      const month = a.deadline ? new Date(a.deadline).getMonth() : new Date().getMonth();
      assignedByMonth[month]++;
      if (a.status === 'COMPLETED') completedByMonth[month]++;
    });

    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Assigned',
            data: assignedByMonth,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1'
          },
          {
            label: 'Completed',
            data: completedByMonth,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#22c55e'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    }));
  }

  private buildStatusChart() {
    if (!this.statusChartRef) return;
    const ctx = this.statusChartRef.nativeElement.getContext('2d')!;
    const completed = this.assignments.filter(a => a.status === 'COMPLETED').length;
    const inProgress = this.assignments.filter(a => a.status === 'IN_PROGRESS').length;
    const cancelled = this.assignments.filter(a => a.status === 'CANCELLED').length;
    const notStarted = this.assignments.length - completed - inProgress - cancelled;

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Not Started', 'Cancelled'],
        datasets: [{
          data: [completed, inProgress, Math.max(0, notStarted), cancelled],
          backgroundColor: ['#22c55e', '#6366f1', '#94a3b8', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    }));
  }

  private buildDepartmentChart() {
    if (!this.departmentChartRef) return;
    const ctx = this.departmentChartRef.nativeElement.getContext('2d')!;

    const deptMap = new Map<string, number>();
    this.employees.forEach(e => {
      const dept = e.department || 'Other';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#f43f5e', '#84cc16'];

    this.charts.push(new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Array.from(deptMap.keys()),
        datasets: [{
          data: Array.from(deptMap.values()),
          backgroundColor: colors.slice(0, deptMap.size),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    }));
  }

  private buildRecruitmentChart() {
    if (!this.recruitmentChartRef) return;
    const ctx = this.recruitmentChartRef.nativeElement.getContext('2d')!;

    const pending = this.applications.filter(a => a.status === 'PENDING').length;
    const reviewed = this.applications.filter(a => a.status === 'REVIEWED').length;
    const shortlisted = this.applications.filter(a => a.status === 'SHORTLISTED').length;
    const accepted = this.applications.filter(a => a.status === 'ACCEPTED').length;
    const rejected = this.applications.filter(a => a.status === 'REJECTED').length;

    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected'],
        datasets: [{
          label: 'Applications',
          data: [pending, reviewed, shortlisted, accepted, rejected],
          backgroundColor: ['#f59e0b', '#6366f1', '#8b5cf6', '#22c55e', '#ef4444'],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    }));
  }

  private buildTopTrainingsChart() {
    if (!this.topTrainingsChartRef) return;
    const ctx = this.topTrainingsChartRef.nativeElement.getContext('2d')!;

    const courseMap = new Map<string, { total: number; completed: number }>();
    this.assignments.forEach(a => {
      const name = a.courseName || 'Unknown';
      if (!courseMap.has(name)) courseMap.set(name, { total: 0, completed: 0 });
      const entry = courseMap.get(name)!;
      entry.total++;
      if (a.status === 'COMPLETED') entry.completed++;
    });

    const sorted = Array.from(courseMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6);

    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sorted.map(s => s[0].length > 15 ? s[0].substring(0, 15) + '...' : s[0]),
        datasets: [
          {
            label: 'Assigned',
            data: sorted.map(s => s[1].total),
            backgroundColor: '#6366f1',
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Completed',
            data: sorted.map(s => s[1].completed),
            backgroundColor: '#22c55e',
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { position: 'top' } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    }));
  }

  private buildContractChart() {
    if (!this.contractChartRef) return;
    const ctx = this.contractChartRef.nativeElement.getContext('2d')!;

    const statusMap = new Map<string, number>();
    this.contracts.forEach(c => {
      statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
    });

    const statusColors: Record<string, string> = {
      'DRAFT': '#94a3b8', 'PENDING': '#f59e0b', 'SIGNED': '#6366f1',
      'ACTIVE': '#22c55e', 'COMPLETED': '#06b6d4', 'TERMINATED': '#ef4444', 'CANCELLED': '#dc2626'
    };

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Array.from(statusMap.keys()),
        datasets: [{
          data: Array.from(statusMap.values()),
          backgroundColor: Array.from(statusMap.keys()).map(k => statusColors[k] || '#94a3b8'),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    }));
  }
}
