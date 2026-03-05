import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { B2bAssignmentService } from '../services/assignment.service';
import { B2bCompanyService } from '../services/company.service';
import { B2bEmployeeService } from '../services/employee.service';
import { B2bPackService } from '../services/pack.service';
import { Assignment, AssignmentRequest, Company, Employee, Pack } from '../models/b2b.models';
import { AdminUsersApiService, UserResponse } from '../../../admin/admin-users-api.service';

@Component({
  selector: 'app-b2b-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="b2b-container">
      <div class="page-header">
        <div><h1>Trainings (Assignments)</h1><p>Tracking of trainings assigned to employees</p></div>
        <button class="btn-primary" (click)="openCreate()">➕ Assign a Training</button>
      </div>

      <div class="filters-section">
        <select class="filter-select" [(ngModel)]="filterCompanyId" (change)="filter()">
          <option [ngValue]="0">All companies</option>
          <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
        </select>
        <select class="filter-select" [(ngModel)]="filterStatus" (change)="filter()">
          <option value="all">All statuses</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Course</th><th>Employee</th><th>Pack</th><th>Deadline</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let a of filtered">
              <td style="font-weight:700">{{ a.courseName }}</td>
              <td>{{ getUserName(a.employeeId) }}</td>
              <td><span class="badge info">{{ a.packName }}</span></td>
              <td>{{ a.deadline | date:'yyyy-MM-dd' }}</td>
              <td style="min-width:120px">
                <div style="display:flex;align-items:center;gap:.5rem">
                  <div class="progress-bar-bg" style="flex:1">
                    <div class="progress-bar-fill" [style.width.%]="a.progressPercent"></div>
                  </div>
                  <span style="font-size:.8rem;font-weight:700;color:var(--text-secondary)">{{ a.progressPercent }}%</span>
                </div>
              </td>
              <td><span class="badge" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span></td>
              <td class="actions-col">
                <button class="btn-icon" title="In Progress" (click)="setStatus(a,'IN_PROGRESS')">▶️</button>
                <button class="btn-icon" title="Completed" (click)="setStatus(a,'COMPLETED')">✅</button>
                <button class="btn-icon" title="Cancel" (click)="setStatus(a,'CANCELLED')">❌</button>
                <button class="btn-icon danger" (click)="remove(a)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filtered.length===0" class="empty-state"><div class="empty-icon">📚</div><p>No assignment</p></div>
      </div>
    </div>

    <div *ngIf="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Assign a Training</h2>
        <div class="form-grid">
          <select class="filter-select" [(ngModel)]="form.companyId" (change)="onCompanyChange()">
            <option [ngValue]="0" disabled>-- Company --</option>
            <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
          </select>
          <select class="filter-select" [(ngModel)]="form.employeeId">
            <option [ngValue]="0" disabled>-- Employee --</option>
            <option *ngFor="let e of companyEmployees" [ngValue]="e.id">{{ getUserName(e.id) }} - {{ e.position }} ({{ e.department }})</option>
          </select>
          <select class="filter-select" [(ngModel)]="form.packId">
            <option [ngValue]="0" disabled>-- Pack --</option>
            <option *ngFor="let p of packs" [ngValue]="p.id">{{ p.name }}</option>
          </select>
          <input class="filter-select" placeholder="Course name" [(ngModel)]="form.courseName" />
          <input class="filter-select" type="date" [(ngModel)]="form.deadline" />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showModal=false">Cancel</button>
          <button class="btn-primary" (click)="submit()">Assign</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./b2b-shared.css']
})
export class B2bAssignmentsComponent implements OnInit {
  assignments: Assignment[] = [];
  filtered: Assignment[] = [];
  companies: Company[] = [];
  companyEmployees: Employee[] = [];
  packs: Pack[] = [];
  userMap: { [id: number]: string } = {};
  filterCompanyId = 0;
  filterStatus = 'all';
  showModal = false;
  form: AssignmentRequest = { companyId:0, employeeId:0, packId:0, courseName:'', deadline:'' };

  constructor(
    private svc: B2bAssignmentService,
    private compSvc: B2bCompanyService,
    private empSvc: B2bEmployeeService,
    private packSvc: B2bPackService,
    private usersSvc: AdminUsersApiService
  ) {}

  ngOnInit() {
    this.compSvc.getAll().subscribe({ next: d => this.companies = d??[] });
    this.packSvc.getActive().subscribe({ next: d => this.packs = d??[] });
    this.usersSvc.list().subscribe({
      next: users => {
        (users ?? []).forEach(u => this.userMap[u.idUser] = `${u.prenom} ${u.nom}`);
      }
    });
    this.load();
  }

  load() { this.svc.getAll().subscribe({ next: d => { this.assignments = d??[]; this.filter(); } }); }

  filter() {
    this.filtered = this.assignments.filter(a =>
      (!this.filterCompanyId || a.companyId===this.filterCompanyId) &&
      (this.filterStatus==='all' || a.status===this.filterStatus)
    );
  }

  onCompanyChange() {
    if (this.form.companyId) {
      this.empSvc.getByCompany(this.form.companyId).subscribe({ next: d => this.companyEmployees = d??[] });
    }
  }

  openCreate() { this.form={ companyId:0, employeeId:0, packId:0, courseName:'', deadline:'' }; this.companyEmployees=[]; this.showModal=true; }
  submit() {
    if (!this.form.companyId||!this.form.employeeId||!this.form.courseName) { alert('Fill in all fields'); return; }
    this.svc.create(this.form).subscribe({ next: () => { this.showModal=false; this.load(); }, error: e => alert(e?.error?.message||'Error') });
  }
  setStatus(a: Assignment, status: string) {
    this.svc.updateStatus(a.id, status).subscribe({ next: () => this.load(), error: e => alert(e?.error?.message||'Error') });
  }
  remove(a: Assignment) { if(!confirm('Delete?')) return; this.svc.delete(a.id).subscribe({ next: () => this.load() }); }

  getUserName(id: number): string {
    return this.userMap[id] || `#${id}`;
  }
}
