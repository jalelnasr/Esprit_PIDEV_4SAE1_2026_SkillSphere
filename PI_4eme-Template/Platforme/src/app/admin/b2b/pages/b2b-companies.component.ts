import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { B2bCompanyService } from '../services/company.service';
import { Company, CompanyRequest } from '../models/b2b.models';

@Component({
  selector: 'app-b2b-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="b2b-container">
      <div class="page-header">
        <div>
          <h1>Companies</h1>
          <p>Partner company management</p>
        </div>
        <button class="btn-primary" (click)="openCreate()">➕ New Company</button>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input class="search-input" placeholder="Search by name..." [(ngModel)]="searchQ" (input)="filter()" />
        </div>
        <input class="filter-select" placeholder="Filter by sector" [(ngModel)]="sectorQ" (input)="filter()" />
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>SIRET</th>
              <th>Sector</th>
              <th>Employees</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filtered">
              <td style="font-weight:700">{{ c.name }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.siret }}</td>
              <td><span class="badge info">{{ c.sector }}</span></td>
              <td>{{ c.employeeCount }}</td>
              <td>{{ c.creditsRemaining }}</td>
              <td class="actions-col">
                <button class="btn-icon" title="Edit" (click)="openEdit(c)">✏️</button>
                <button class="btn-icon danger" title="Delete" (click)="remove(c)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && filtered.length===0" class="empty-state">
          <div class="empty-icon">🏢</div><p>No company found</p>
        </div>
      </div>
    </div>

    <!-- Create / Edit modal -->
    <div *ngIf="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editing ? 'Edit' : 'Create' }} Company</h2>
        <div class="form-grid">
          <input class="filter-select" placeholder="Name" [(ngModel)]="form.name" />
          <input class="filter-select" placeholder="Email" [(ngModel)]="form.email" />
          <input class="filter-select" placeholder="SIRET" [(ngModel)]="form.siret" />
          <input class="filter-select" placeholder="Sector" [(ngModel)]="form.sector" />
          <input class="filter-select" placeholder="Address" [(ngModel)]="form.address" />
          <input class="filter-select" placeholder="Phone" [(ngModel)]="form.phone" />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showModal=false">Cancel</button>
          <button class="btn-primary" (click)="submit()">{{ editing ? 'Save' : 'Create' }}</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./b2b-shared.css']
})
export class B2bCompaniesComponent implements OnInit {
  companies: Company[] = [];
  filtered: Company[] = [];
  loading = false;
  searchQ = '';
  sectorQ = '';

  showModal = false;
  editing: Company | null = null;
  form: CompanyRequest = { name:'', email:'', siret:'', sector:'', address:'', phone:'', createdBy:0 };

  constructor(private svc: B2bCompanyService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({ next: d => { this.companies = d??[]; this.filter(); this.loading=false; }, error: () => { this.loading=false; } });
  }

  filter() {
    const q = this.searchQ.toLowerCase();
    const s = this.sectorQ.toLowerCase();
    this.filtered = this.companies.filter(c =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (!s || (c.sector||'').toLowerCase().includes(s))
    );
  }

  openCreate() {
    this.editing = null;
    this.form = { name:'', email:'', siret:'', sector:'', address:'', phone:'', createdBy:0 };
    this.showModal = true;
  }

  openEdit(c: Company) {
    this.editing = c;
    this.form = { name:c.name, email:c.email, siret:c.siret, sector:c.sector, address:c.address, phone:c.phone, createdBy:c.createdBy };
    this.showModal = true;
  }

  submit() {
    if (!this.form.name) { alert('Name is required'); return; }
    const obs = this.editing ? this.svc.update(this.editing.id, this.form) : this.svc.create(this.form);
    obs.subscribe({ next: () => { this.showModal=false; this.load(); }, error: e => alert(e?.error?.message || 'Error') });
  }

  remove(c: Company) {
    if (!confirm(`Delete ${c.name}?`)) return;
    this.svc.delete(c.id).subscribe({ next: () => this.load(), error: e => alert(e?.error?.message || 'Error') });
  }
}
