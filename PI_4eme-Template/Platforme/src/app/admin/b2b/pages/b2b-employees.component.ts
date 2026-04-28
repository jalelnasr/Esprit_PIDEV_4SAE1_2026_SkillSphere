import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { B2bEmployeeService } from '../services/employee.service';
import { B2bCompanyService } from '../services/company.service';
import { Employee, EmployeeRequest, Company } from '../models/b2b.models';
import { AdminUsersApiService, UserResponse } from '../../../admin/admin-users-api.service';

@Component({
  selector: 'app-b2b-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="b2b-container">
      <div class="page-header">
        <div><h1>Employees</h1><p>Employee management by company</p></div>
        <button class="btn-primary" (click)="openCreate()">➕ New Employee</button>
      </div>

      <div class="filters-section">
        <select class="filter-select" [(ngModel)]="filterCompanyId" (change)="filter()">
          <option [ngValue]="0">All companies</option>
          <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
        </select>
        <input class="filter-select" placeholder="Filter by department" [(ngModel)]="deptQ" (input)="filter()" />
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Company</th><th>Department</th><th>Position</th><th>Manager</th><th>Hire Date</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let e of filtered">
              <td>{{ e.id }}</td>
              <td style="font-weight:700">{{ getUserName(e.id) }}</td>
              <td><span class="badge info">{{ e.companyName }}</span></td>
              <td>{{ e.department }}</td>
              <td>{{ e.position }}</td>
              <td>{{ e.managerId ? getUserName(e.managerId) : '-' }}</td>
              <td>{{ e.hireDate | date:'yyyy-MM-dd' }}</td>
              <td class="actions-col">
                <button class="btn-icon" (click)="openEdit(e)">✏️</button>
                <button class="btn-icon danger" (click)="remove(e)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filtered.length===0" class="empty-state"><div class="empty-icon">👥</div><p>No employee</p></div>
      </div>
    </div>

    <div *ngIf="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editing ? 'Edit' : 'Add' }} Employee</h2>
        <p *ngIf="formError" class="form-error">⚠️ {{ formError }}</p>
        <div class="form-grid">
          <div class="form-group"><label>User ID *</label><input class="filter-select" type="number" placeholder="Existing user ID" [(ngModel)]="form.id" /></div>
          <div class="form-group"><label>Company *</label>
            <select class="filter-select" [(ngModel)]="form.companyId">
              <option [ngValue]="0" disabled>-- Select --</option>
              <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group"><label>Department *</label><input class="filter-select" placeholder="E.g.: IT, Marketing..." [(ngModel)]="form.department" /></div>
          <div class="form-group"><label>Position *</label><input class="filter-select" placeholder="E.g.: Developer, Manager..." [(ngModel)]="form.position" /></div>
          <div class="form-group"><label>Manager ID (optional)</label><input class="filter-select" type="number" placeholder="Leave empty if none" [(ngModel)]="form.managerId" /></div>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showModal=false">Cancel</button>
          <button class="btn-primary" (click)="submit()">{{ editing ? 'Save' : 'Create' }}</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./b2b-shared.css'],
  styles: [`
    .form-group { display:flex; flex-direction:column; gap:4px; }
    .form-group label { font-size:12px; font-weight:600; color:var(--admin-text-secondary,#64748b); text-transform:uppercase; }
    .form-error { background:#fef2f2; color:#dc2626; padding:8px 12px; border-radius:8px; font-size:13px; margin-bottom:8px; }
    :root.dark-mode .form-error { background:rgba(220,38,38,0.15); }
  `]
})
export class B2bEmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filtered: Employee[] = [];
  companies: Company[] = [];
  users: UserResponse[] = [];
  userMap: { [id: number]: string } = {};
  filterCompanyId = 0;
  deptQ = '';
  showModal = false;
  editing: Employee | null = null;
  form: EmployeeRequest = { id:0, companyId:0, department:'', position:'', managerId:null };
  formError = '';

  constructor(private svc: B2bEmployeeService, private compSvc: B2bCompanyService, private usersSvc: AdminUsersApiService) {}

  ngOnInit() {
    this.compSvc.getAll().subscribe({ next: d => this.companies = d??[] });
    this.usersSvc.list().subscribe({
      next: users => {
        this.users = users ?? [];
        this.userMap = {};
        this.users.forEach(u => this.userMap[u.idUser] = `${u.prenom} ${u.nom}`);
      }
    });
    this.load();
  }

  load() {
    this.svc.getAll().subscribe({ next: d => { this.employees = d??[]; this.filter(); } });
  }

  filter() {
    const dq = this.deptQ.toLowerCase();
    this.filtered = this.employees.filter(e =>
      (!this.filterCompanyId || e.companyId === this.filterCompanyId) &&
      (!dq || (e.department||'').toLowerCase().includes(dq))
    );
  }

  openCreate() { this.editing=null; this.form={ id:0, companyId:0, department:'', position:'', managerId:null }; this.formError=''; this.showModal=true; }
  openEdit(e: Employee) { this.editing=e; this.form={ id:e.id, companyId:e.companyId, department:e.department, position:e.position, managerId:e.managerId }; this.formError=''; this.showModal=true; }

  submit() {
    this.formError = '';
    if (!this.form.id || this.form.id <= 0) { this.formError = 'Please enter a valid User ID (existing user)'; return; }
    if (!this.form.companyId || this.form.companyId <= 0) { this.formError = 'Please select a company'; return; }
    if (!this.form.department?.trim()) { this.formError = 'Department is required'; return; }
    if (!this.form.position?.trim()) { this.formError = 'Position is required'; return; }

    // Clean managerId: empty -> null
    if (!this.form.managerId) this.form.managerId = null;

    const obs = this.editing ? this.svc.update(this.editing.id, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.showModal=false; this.load(); },
      error: err => {
        const msg = err?.error?.message || err?.error?.error || err?.message || 'Server error';
        this.formError = `Error: ${msg} (HTTP ${err?.status || '?'})`;
        console.error('Employee submit error:', err);
      }
    });
  }

  remove(e: Employee) {
    if (!confirm('Delete this employee?')) return;
    this.svc.delete(e.id).subscribe({ next: () => this.load(), error: e2 => alert(e2?.error?.message||'Error') });
  }

  getUserName(id: number): string {
    return this.userMap[id] || `#${id}`;
  }
}
