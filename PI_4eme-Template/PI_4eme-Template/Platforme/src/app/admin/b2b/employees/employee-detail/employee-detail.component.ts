import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { B2bEmployeeService } from '../../services/employee.service';
import { B2bAssignmentService } from '../../services/assignment.service';
import { Employee, Assignment } from '../../models/b2b.models';
import { B2bNavService } from '../../services/b2b-nav.service';
import { AdminUsersApiService, UserResponse } from '../../../../admin/admin-users-api.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page" *ngIf="employee">
      <div class="page-header">
        <a [routerLink]="nav.basePath + '/employees'" class="back-link">← Back to employees</a>
        <div class="header-row">
          <h1>👤 {{ userName || 'Employee #' + employee.id }}</h1>
          <a [routerLink]="[nav.basePath + '/employees', employee.id, 'edit']" class="btn btn-outline">✏️ Edit</a>
        </div>
      </div>

      <!-- Info Card -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Company</div>
          <div class="info-value">{{ employee.companyName }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Department</div>
          <div class="info-value">{{ employee.department }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Position</div>
          <div class="info-value">{{ employee.position }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Hire date</div>
          <div class="info-value">{{ employee.hireDate | date:'dd/MM/yyyy' }}</div>
        </div>
        <div class="info-card" *ngIf="employee.managerId">
          <div class="info-label">Manager</div>
          <div class="info-value">#{{ employee.managerId }}</div>
        </div>
      </div>

      <!-- Assigned Trainings -->
      <div class="section">
        <div class="section-header">
          <h2>📋 Assigned trainings</h2>
          <a [routerLink]="nav.basePath + '/assignments/new'" class="btn btn-sm">+ Assign</a>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr><th>Training</th><th>Pack</th><th>Deadline</th><th>Progress</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of assignments">
                <td>{{ a.courseName }}</td>
                <td>{{ a.packName }}</td>
                <td>{{ a.deadline | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div class="progress-bar"><div class="progress-fill" [style.width.%]="a.progressPercent"></div></div>
                  <small>{{ a.progressPercent }}%</small>
                </td>
                <td><span class="badge" [ngClass]="a.status.toLowerCase()">{{ statusLabel(a.status) }}</span></td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="assignments.length === 0" class="empty">No training assigned</p>
        </div>
      </div>
    </div>

    <div *ngIf="!employee && !loading" class="page">
      <p class="empty">Employee not found</p>
      <a [routerLink]="nav.basePath + '/employees'" class="back-link">← Back</a>
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .page-header { margin-bottom: 24px; }
    .back-link { color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; }
    .back-link:hover { text-decoration: underline; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .header-row h1 { font-size: 24px; font-weight: 800; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .header-row h1 { color: #f1f5f9; }
    .btn { padding: 8px 16px; border-radius: 10px; font-weight: 600; font-size: 13px; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-outline { background: transparent; border: 1.5px solid #6366f1; color: #6366f1; }
    .btn-outline:hover { background: rgba(99,102,241,0.08); }
    .btn-sm { padding: 6px 14px; font-size: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 8px; text-decoration: none; }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .info-card {
      background: var(--card-bg, #fff); border-radius: 12px; padding: 16px 20px;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    }
    :root.dark-mode .info-card { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .info-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
    .info-value { font-size: 16px; font-weight: 700; color: var(--text-primary, #0f172a); }
    :root.dark-mode .info-value { color: #f1f5f9; }

    .section { margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); margin: 0; }
    :root.dark-mode .section-header h2 { color: #f1f5f9; }

    .table-container {
      background: var(--card-bg, #fff); border-radius: 16px; overflow: hidden;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    }
    :root.dark-mode .table-container { --card-bg: #1e293b; --card-border: rgba(255,255,255,0.06); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: var(--header-bg, #f8fafc); }
    :root.dark-mode .data-table th { background: #0f172a; }
    .data-table td { padding: 12px 16px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid rgba(0,0,0,0.03); }
    :root.dark-mode .data-table td { color: #e2e8f0; }

    .progress-bar { width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 6px; }
    :root.dark-mode .progress-bar { background: #334155; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 3px; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.in_progress { background: #dbeafe; color: #2563eb; }
    .badge.completed { background: #dcfce7; color: #16a34a; }
    .badge.cancelled { background: #fef2f2; color: #dc2626; }
    :root.dark-mode .badge.in_progress { background: rgba(37,99,235,0.2); }
    :root.dark-mode .badge.completed { background: rgba(22,163,106,0.2); }
    :root.dark-mode .badge.cancelled { background: rgba(220,38,38,0.2); }
    .empty { text-align: center; padding: 40px; color: #94a3b8; }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  assignments: Assignment[] = [];
  loading = true;
  userName = '';

  constructor(
    private route: ActivatedRoute,
    private employeeSvc: B2bEmployeeService,
    private assignmentSvc: B2bAssignmentService,
    public nav: B2bNavService,
    private usersSvc: AdminUsersApiService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.employeeSvc.getById(id).subscribe({
      next: e => {
        this.employee = e;
        this.loading = false;
        // Load user name
        this.usersSvc.getById(id).subscribe({
          next: u => this.userName = `${u.prenom} ${u.nom}`,
          error: () => this.userName = `Employee #${id}`
        });
        this.assignmentSvc.getAll().subscribe(all => {
          this.assignments = (all || []).filter(a => a.employeeId === id);
        });
      },
      error: () => { this.loading = false; }
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { 'IN_PROGRESS': 'In progress', 'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled' };
    return map[s] || s;
  }
}
