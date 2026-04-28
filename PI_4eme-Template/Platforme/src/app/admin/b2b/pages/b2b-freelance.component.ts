import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { B2bMissionService } from '../services/mission.service';
import { B2bContractService } from '../services/contract.service';
import { B2bCompanyService } from '../services/company.service';
import { Mission, MissionRequest, Contract, ContractRequest, Company } from '../models/b2b.models';

@Component({
  selector: 'app-b2b-freelance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="b2b-container">
      <div class="page-header">
        <div><h1>Freelance</h1><p>Missions and contracts</p></div>
      </div>

      <div class="tabs">
        <button class="tab-btn" [class.active]="tab==='missions'" (click)="tab='missions'">🎯 Missions</button>
        <button class="tab-btn" [class.active]="tab==='contracts'" (click)="tab='contracts';loadContracts()">📄 Contrats</button>
      </div>

      <!-- MISSIONS TAB -->
      <div *ngIf="tab==='missions'">
        <div class="filters-section">
          <select class="filter-select" [(ngModel)]="missionStatusFilter" (change)="filterMissions()">
            <option value="">All statuses</option>
            <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
          </select>
          <button class="btn-primary" (click)="openCreateMission()">➕ New Mission</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Title</th><th>Company</th><th>Daily Rate</th><th>Duration</th><th>Skills</th><th>Status</th><th>Applications</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let m of filteredMissions">
                <td style="font-weight:700">{{ m.title }}</td>
                <td>{{ m.companyName }}</td>
                <td>{{ m.dailyRate | number:'1.0-0' }} €/day</td>
                <td>{{ m.durationWeeks }} weeks</td>
                <td><span class="chip" *ngFor="let s of parseSkills(m.requiredSkills)">{{ s }}</span></td>
                <td><span class="badge" [ngClass]="m.status.toLowerCase()">{{ m.status }}</span></td>
                <td style="text-align:center">{{ m.applicationCount }}</td>
                <td class="actions-col">
                  <button class="btn-icon" (click)="openEditMission(m)">✏️</button>
                  <button class="btn-icon" title="View applications" (click)="viewCandidates(m)">👥</button>
                  <button class="btn-icon danger" (click)="removeMission(m)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="filteredMissions.length===0" class="empty-state"><div class="empty-icon">🎯</div><p>No mission</p></div>
        </div>
      </div>

      <!-- CONTRACTS TAB -->
      <div *ngIf="tab==='contracts'">
        <div class="filters-section">
          <select class="filter-select" [(ngModel)]="contractStatusFilter" (change)="filterContracts()">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option><option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option><option value="TERMINATED">Terminated</option>
          </select>
          <button class="btn-primary" (click)="openCreateContract()">➕ New Contract</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Mission</th><th>Freelance</th><th>Amount</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of filteredContracts">
                <td style="font-weight:700">{{ c.missionTitle }}</td>
                <td>{{ c.freelancerName }}</td>
                <td>{{ c.amount | number:'1.0-0' }} €</td>
                <td>{{ c.startDate | date:'yyyy-MM-dd' }}</td>
                <td>{{ c.endDate | date:'yyyy-MM-dd' }}</td>
                <td><span class="badge" [ngClass]="c.status.toLowerCase()">{{ c.status }}</span></td>
                <td class="actions-col">
                  <button *ngIf="c.status==='PENDING'" class="btn-sm btn-success" (click)="signContract(c)">Sign</button>
                  <button class="btn-icon danger" (click)="removeContract(c)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="filteredContracts.length===0" class="empty-state"><div class="empty-icon">📄</div><p>No contract</p></div>
        </div>
      </div>
    </div>

    <!-- Mission modal -->
    <div *ngIf="showMissionModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editingMission ? 'Edit' : 'Create' }} Mission</h2>
        <div class="form-grid">
          <select class="filter-select" [(ngModel)]="missionForm.companyId">
            <option [ngValue]="0" disabled>-- Company --</option>
            <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
          </select>
          <input class="filter-select" placeholder="Titre" [(ngModel)]="missionForm.title" />
          <input class="filter-select" placeholder="Daily Rate (€)" type="number" [(ngModel)]="missionForm.dailyRate" />
          <input class="filter-select" placeholder="Duration (weeks)" type="number" [(ngModel)]="missionForm.durationWeeks" />
          <input class="filter-select form-full" placeholder="Skills (comma-separated)" [(ngModel)]="missionSkillsStr" />
          <textarea class="filter-select form-full" rows="2" placeholder="Description" [(ngModel)]="missionForm.description"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showMissionModal=false">Cancel</button>
          <button class="btn-primary" (click)="submitMission()">{{ editingMission ? 'Save' : 'Create' }}</button>
        </div>
      </div>
    </div>

    <!-- Contract modal -->
    <div *ngIf="showContractModal" class="modal-overlay">
      <div class="modal-content">
        <h2>New Contract</h2>
        <div class="form-grid">
          <input class="filter-select" placeholder="Mission ID" type="number" [(ngModel)]="contractForm.missionId" />
          <input class="filter-select" placeholder="Freelancer ID" type="number" [(ngModel)]="contractForm.freelancerId" />
          <input class="filter-select" placeholder="Amount" type="number" [(ngModel)]="contractForm.amount" />
          <div></div>
          <div class="form-group"><label>Start</label><input class="filter-select" type="date" [(ngModel)]="contractForm.startDate" /></div>
          <div class="form-group"><label>End</label><input class="filter-select" type="date" [(ngModel)]="contractForm.endDate" /></div>
          <textarea class="filter-select form-full" rows="2" placeholder="Contract terms" [(ngModel)]="contractForm.terms"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showContractModal=false">Cancel</button>
          <button class="btn-primary" (click)="submitContract()">Create</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./b2b-shared.css']
})
export class B2bFreelanceComponent implements OnInit {
  tab: 'missions'|'contracts' = 'missions';
  companies: Company[] = [];

  // Missions
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  missionStatusFilter = '';
  showMissionModal = false;
  editingMission: Mission | null = null;
  missionForm: MissionRequest = { companyId:0, title:'', description:'', requiredSkills:'', durationWeeks:0, dailyRate:0 };
  missionSkillsStr = '';

  // Contracts
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  contractStatusFilter = '';
  showContractModal = false;
  contractForm: ContractRequest = { missionId:0, freelancerId:0, amount:0, startDate:'', endDate:'', terms:'' };

  constructor(
    private router: Router,
    private missionSvc: B2bMissionService,
    private contractSvc: B2bContractService,
    private compSvc: B2bCompanyService
  ) {}

  ngOnInit() {
    this.compSvc.getAll().subscribe({ next: d => this.companies = d??[] });
    this.loadMissions();
  }

  // --- Missions ---
  loadMissions() { this.missionSvc.getAll().subscribe({ next: d => { this.missions = d??[]; this.filterMissions(); } }); }
  filterMissions() {
    this.filteredMissions = this.missionStatusFilter ? this.missions.filter(m => m.status===this.missionStatusFilter) : [...this.missions];
  }
  openCreateMission() { 
    this.editingMission=null; 
    this.missionForm={ 
      companyId:0, 
      title:'', 
      description:'', 
      requiredSkills:'', 
      durationWeeks:0, 
      dailyRate:0 
    }; 
    this.missionSkillsStr=''; 
    this.showMissionModal=true; 
  }
  openEditMission(m: Mission) {
    this.editingMission = m;
    const skills = typeof m.requiredSkills === 'string' ? m.requiredSkills : '';
    this.missionForm = {
      companyId: m.companyId,
      title: m.title,
      description: m.description,
      requiredSkills: skills,
      durationWeeks: m.durationWeeks,
      dailyRate: m.dailyRate
    };
    this.missionSkillsStr = skills;
    this.showMissionModal = true;
  }
  submitMission() {
    this.missionForm.requiredSkills = this.missionSkillsStr.split(',').map(s=>s.trim()).filter(s=>s).join(',');
    const obs = this.editingMission ? this.missionSvc.update(this.editingMission.id, this.missionForm) : this.missionSvc.create(this.missionForm);
    obs.subscribe({ next: () => { this.showMissionModal=false; this.loadMissions(); }, error: e => alert(e?.error?.message||'Error') });
  }
  removeMission(m: Mission) { if(!confirm(`Delete ${m.title}?`)) return; this.missionSvc.delete(m.id).subscribe({ next: () => this.loadMissions() }); }
  
  viewCandidates(m: Mission) {
    this.router.navigate(['/admin/corporate/missions', m.id, 'candidates']);
  }

  // --- Contracts ---
  loadContracts() { this.contractSvc.getAll().subscribe({ next: d => { this.contracts = d??[]; this.filterContracts(); } }); }
  filterContracts() {
    this.filteredContracts = this.contractStatusFilter ? this.contracts.filter(c => c.status===this.contractStatusFilter) : [...this.contracts];
  }
  openCreateContract() { this.contractForm={ missionId:0, freelancerId:0, amount:0, startDate:'', endDate:'', terms:'' }; this.showContractModal=true; }
  submitContract() {
    this.contractSvc.create(this.contractForm).subscribe({ next: () => { this.showContractModal=false; this.loadContracts(); }, error: e => alert(e?.error?.message||'Error') });
  }
  signContract(c: Contract) { this.contractSvc.sign(c.id).subscribe({ next: () => this.loadContracts() }); }
  removeContract(c: Contract) { if(!confirm('Delete?')) return; this.contractSvc.delete(c.id).subscribe({ next: () => this.loadContracts() }); }

  missionBudget(m: Mission): number {
    return Number(m.dailyRate) || 0;
  }

  parseSkills(skills: string): string[] {
    if (!skills) return [];
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
  }
}
