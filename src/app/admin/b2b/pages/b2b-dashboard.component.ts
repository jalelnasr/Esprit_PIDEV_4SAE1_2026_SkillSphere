import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { B2bCompanyService } from '../services/company.service';
import { B2bEmployeeService } from '../services/employee.service';
import { B2bJobOfferService } from '../services/job-offer.service';
import { B2bMissionService } from '../services/mission.service';
import { B2bContractService } from '../services/contract.service';
import { B2bApplicationService } from '../services/application.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-b2b-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="b2b-container">
      <div class="page-header">
        <div>
          <h1>B2B Corporate Dashboard</h1>
          <p>B2B module overview</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card" *ngFor="let s of stats">
          <div class="stat-icon">{{ s.icon }}</div>
          <div class="stat-info">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <div class="recent-section" *ngIf="recentApplications.length">
        <h2>Latest Applications</h2>
        <div class="recent-list">
          <div class="recent-item" *ngFor="let a of recentApplications">
            <span class="match-badge" [ngClass]="matchClass(a.matchScore)">{{ a.matchScore }}%</span>
            <span class="recent-text">{{ a.candidateTitle }} → {{ a.jobOfferTitle }}</span>
            <span class="recent-status badge" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./b2b-shared.css']
})
export class B2bDashboardComponent implements OnInit {
  stats: { icon: string; value: string | number; label: string }[] = [];
  recentApplications: any[] = [];

  constructor(
    private companySvc: B2bCompanyService,
    private employeeSvc: B2bEmployeeService,
    private jobOfferSvc: B2bJobOfferService,
    private missionSvc: B2bMissionService,
    private contractSvc: B2bContractService,
    private appSvc: B2bApplicationService
  ) {}

  ngOnInit() {
    forkJoin({
      companies: this.companySvc.getAll(),
      employees: this.employeeSvc.getAll(),
      offers: this.jobOfferSvc.getAll(),
      missions: this.missionSvc.getAll(),
      contracts: this.contractSvc.getAll(),
      applications: this.appSvc.getAll()
    }).subscribe({
      next: (d) => {
        const avgMatch = d.applications.length
          ? Math.round(d.applications.reduce((s, a) => s + (a.matchScore || 0), 0) / d.applications.length)
          : 0;
        this.stats = [
          { icon: '🏢', value: d.companies.length, label: 'Companies' },
          { icon: '👥', value: d.employees.length, label: 'Employees' },
          { icon: '💼', value: d.offers.length, label: 'Job Offers' },
          { icon: '🚀', value: d.missions.length, label: 'Freelance Missions' },
          { icon: '📄', value: d.contracts.length, label: 'Contracts' },
          { icon: '🎯', value: avgMatch + '%', label: 'Average Match Score' }
        ];
        this.recentApplications = d.applications.slice(-5).reverse();
      },
      error: () => {
        this.stats = [
          { icon: '🏢', value: '-', label: 'Companies' },
          { icon: '👥', value: '-', label: 'Employees' },
          { icon: '💼', value: '-', label: 'Job Offers' },
          { icon: '🚀', value: '-', label: 'Freelance Missions' },
          { icon: '📄', value: '-', label: 'Contracts' },
          { icon: '🎯', value: '-', label: 'Average Match Score' }
        ];
      }
    });
  }

  matchClass(score: number): string {
    if (score >= 70) return 'match-green';
    if (score >= 40) return 'match-orange';
    return 'match-red';
  }
}
