import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { B2bJobOfferService } from '../services/job-offer.service';
import { B2bCandidateService } from '../services/candidate.service';
import { B2bApplicationService } from '../services/application.service';
import { ApplicationEmailService } from '../services/application-email.service';
import { B2bCompanyService } from '../services/company.service';
import { ApplicationEmailModalComponent } from './application-email-modal.component';
import { JobOffer, JobOfferRequest, Candidate, CandidateRequest, Application, Company } from '../models/b2b.models';

@Component({
  selector: 'app-b2b-recruitment',
  standalone: true,
  imports: [CommonModule, FormsModule, ApplicationEmailModalComponent],
  template: `
    <div class="b2b-container">
      <div class="page-header">
        <div><h1>Recruitment</h1><p>Job offers, candidates and applications</p></div>
      </div>

      <div class="tabs">
        <button class="tab-btn" [class.active]="tab==='offers'" (click)="tab='offers'">💼 Job Offers</button>
        <button class="tab-btn" [class.active]="tab==='candidates'" (click)="tab='candidates';loadCandidates()">👤 Candidates</button>
        <button class="tab-btn" [class.active]="tab==='applications'" (click)="tab='applications';loadApplications()">📋 Applications</button>
      </div>

      <!-- OFFERS TAB -->
      <div *ngIf="tab==='offers'">
        <div class="filters-section">
          <div class="search-box"><span class="search-icon">🔍</span>
            <input class="search-input" placeholder="Search by skill..." [(ngModel)]="offerSkillQ" (keyup.enter)="searchOffers()" />
          </div>
          <button class="btn-primary" (click)="openCreateOffer()">➕ New Offer</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Location</th><th>Skills</th><th>Status</th><th>Applications</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of offers">
                <td style="font-weight:700">{{ o.title }}</td>
                <td>{{ o.companyName }}</td>
                <td>{{ o.contractType }}</td>
                <td>{{ o.location }}</td>
                <td><span class="chip" *ngFor="let s of o.requiredSkills">{{ s }}</span></td>
                <td><span class="badge" [ngClass]="o.status.toLowerCase()">{{ o.status }}</span></td>
                <td style="text-align:center">{{ o.applicationCount }}</td>
                <td class="actions-col">
                  <button class="btn-icon" (click)="openEditOffer(o)">✏️</button>
                  <button class="btn-icon" title="Open" (click)="setOfferStatus(o,'OPEN')">🟢</button>
                  <button class="btn-icon" title="Close" (click)="setOfferStatus(o,'CLOSED')">🔴</button>
                  <button class="btn-icon danger" (click)="removeOffer(o)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="offers.length===0" class="empty-state"><div class="empty-icon">💼</div><p>No offer</p></div>
        </div>
      </div>

      <!-- CANDIDATES TAB -->
      <div *ngIf="tab==='candidates'">
        <div class="filters-section">
          <div class="search-box"><span class="search-icon">🔍</span>
            <input class="search-input" placeholder="Search by skill..." [(ngModel)]="candidateSkillQ" (keyup.enter)="searchCandidates()" />
          </div>
          <button class="btn-primary" (click)="openCreateCandidate()">➕ New Candidate</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Title</th><th>Skills</th><th>Experience</th><th>Looking for Job</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of candidates">
                <td>{{ c.id }}</td>
                <td style="font-weight:700">{{ c.title }}</td>
                <td><span class="chip" *ngFor="let s of c.skills">{{ s }}</span></td>
                <td>{{ c.experienceYears }} years</td>
                <td><span class="badge" [ngClass]="c.isLookingForJob?'success':'danger'">{{ c.isLookingForJob?'Yes':'No' }}</span></td>
                <td class="actions-col">
                  <button class="btn-icon" (click)="openEditCandidate(c)">✏️</button>
                  <button class="btn-icon danger" (click)="removeCandidate(c)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="candidates.length===0" class="empty-state"><div class="empty-icon">👤</div><p>No candidate</p></div>
        </div>
      </div>

      <!-- APPLICATIONS TAB -->
      <div *ngIf="tab==='applications'">
        <div class="filters-section">
          <select class="filter-select" [(ngModel)]="appFilterOfferId" (change)="filterApps()">
            <option [ngValue]="0">All offers</option>
            <option *ngFor="let o of allOffers" [ngValue]="o.id">{{ o.title }}</option>
          </select>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Candidate</th><th>Offer</th><th>Match Score</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of filteredApps">
                <td style="font-weight:700">{{ a.candidateTitle }}</td>
                <td>{{ a.jobOfferTitle }}</td>
                <td><span class="match-badge" [ngClass]="matchClass(a.matchScore)">{{ a.matchScore }}%</span></td>
                <td><span class="badge" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span></td>
                <td>{{ a.appliedAt | date:'yyyy-MM-dd' }}</td>
                <td class="actions-col">
                  <button class="btn-icon" title="Review" (click)="setAppStatus(a,'REVIEWED')">👁️</button>
                  <button class="btn-icon" title="Shortlist" (click)="setAppStatus(a,'SHORTLISTED')">⭐</button>
                  <button class="btn-icon" title="Accept" (click)="openEmailModal(a, true)">✅</button>
                  <button class="btn-icon" title="Reject" (click)="openEmailModal(a, false)">❌</button>
                  <button class="btn-icon danger" (click)="removeApp(a)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="filteredApps.length===0" class="empty-state"><div class="empty-icon">📋</div><p>No application</p></div>
        </div>
      </div>
    </div>

    <!-- Offer modal -->
    <div *ngIf="showOfferModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editingOffer ? 'Edit' : 'Create' }} Offer</h2>
        <div class="form-grid">
          <select class="filter-select" [(ngModel)]="offerForm.companyId">
            <option [ngValue]="0" disabled>-- Company --</option>
            <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
          </select>
          <input class="filter-select" placeholder="Title" [(ngModel)]="offerForm.title" />
          <input class="filter-select" placeholder="Contract type" [(ngModel)]="offerForm.contractType" />
          <input class="filter-select" placeholder="Location" [(ngModel)]="offerForm.location" />
          <input class="filter-select form-full" placeholder="Skills (comma-separated)" [(ngModel)]="offerSkillsStr" />
          <textarea class="filter-select form-full" rows="2" placeholder="Description" [(ngModel)]="offerForm.description"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showOfferModal=false">Cancel</button>
          <button class="btn-primary" (click)="submitOffer()">{{ editingOffer ? 'Save' : 'Create' }}</button>
        </div>
      </div>
    </div>

    <!-- Candidate modal -->
    <div *ngIf="showCandidateModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editingCandidate ? 'Edit' : 'Create' }} Candidate</h2>
        <div class="form-grid">
          <input class="filter-select" type="number" placeholder="User ID" [(ngModel)]="candidateForm.id" />
          <input class="filter-select" placeholder="Title / Position" [(ngModel)]="candidateForm.title" />
          <input class="filter-select" type="number" placeholder="Years of exp." [(ngModel)]="candidateForm.experienceYears" />
          <input class="filter-select" placeholder="Resume URL" [(ngModel)]="candidateForm.resumeUrl" />
          <input class="filter-select form-full" placeholder="Skills (comma-separated)" [(ngModel)]="candidateSkillsStr" />
          <select class="filter-select" [(ngModel)]="candidateForm.isLookingForJob">
            <option [ngValue]="true">Looking for job</option><option [ngValue]="false">Not looking</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" (click)="showCandidateModal=false">Cancel</button>
          <button class="btn-primary" (click)="submitCandidate()">{{ editingCandidate ? 'Save' : 'Create' }}</button>
        </div>
      </div>
    </div>

    <!-- Email Modal -->
    <app-application-email-modal 
      [isOpen]="showEmailModal"
      [application]="selectedApplication"
      [isAccepting]="isAcceptingEmail"
      (onSendEmail)="handleEmailSend($event)"
      (onClose)="showEmailModal = false">
    </app-application-email-modal>
  `,
  styleUrls: ['./b2b-shared.css']
})
export class B2bRecruitmentComponent implements OnInit {
  tab: 'offers'|'candidates'|'applications' = 'offers';
  companies: Company[] = [];

  // Offers
  offers: JobOffer[] = [];
  allOffers: JobOffer[] = [];
  offerSkillQ = '';
  showOfferModal = false;
  editingOffer: JobOffer | null = null;
  offerForm: JobOfferRequest = { companyId:0, title:'', description:'', contractType:'', location:'', requiredSkills:[] };
  offerSkillsStr = '';

  // Candidates
  candidates: Candidate[] = [];
  candidateSkillQ = '';
  showCandidateModal = false;
  editingCandidate: Candidate | null = null;
  candidateForm: CandidateRequest = { id:0, title:'', skills:[], experienceYears:0, resumeUrl:'', isLookingForJob:true };
  candidateSkillsStr = '';

  // Applications
  applications: Application[] = [];
  filteredApps: Application[] = [];
  appFilterOfferId = 0;

  // Email Modal
  showEmailModal = false;
  selectedApplication: Application | null = null;
  isAcceptingEmail = true;

  constructor(
    private offerSvc: B2bJobOfferService,
    private candidateSvc: B2bCandidateService,
    private appSvc: B2bApplicationService,
    private emailSvc: ApplicationEmailService,
    private compSvc: B2bCompanyService
  ) {}

  ngOnInit() {
    this.compSvc.getAll().subscribe({ next: d => this.companies = d??[] });
    this.loadOffers();
  }

  // --- Offers ---
  loadOffers() { this.offerSvc.getAll().subscribe({ next: d => { this.offers = d??[]; this.allOffers = [...this.offers]; } }); }
  searchOffers() {
    if (!this.offerSkillQ.trim()) { this.loadOffers(); return; }
    this.offerSvc.searchBySkill(this.offerSkillQ.trim()).subscribe({ next: d => this.offers = d??[] });
  }
  openCreateOffer() { this.editingOffer=null; this.offerForm={ companyId:0, title:'', description:'', contractType:'', location:'', requiredSkills:[] }; this.offerSkillsStr=''; this.showOfferModal=true; }
  openEditOffer(o: JobOffer) { this.editingOffer=o; this.offerForm={ companyId:o.companyId, title:o.title, description:o.description, contractType:o.contractType, location:o.location, requiredSkills:[...o.requiredSkills] }; this.offerSkillsStr=o.requiredSkills.join(', '); this.showOfferModal=true; }
  submitOffer() {
    this.offerForm.requiredSkills = this.offerSkillsStr.split(',').map(s=>s.trim()).filter(s=>s);
    const obs = this.editingOffer ? this.offerSvc.update(this.editingOffer.id, this.offerForm) : this.offerSvc.create(this.offerForm);
    obs.subscribe({ next: () => { this.showOfferModal=false; this.loadOffers(); }, error: e => alert(e?.error?.message||'Error') });
  }
  setOfferStatus(o: JobOffer, status: string) { this.offerSvc.updateStatus(o.id, status).subscribe({ next: () => this.loadOffers() }); }
  removeOffer(o: JobOffer) { if(!confirm(`Delete ${o.title}?`)) return; this.offerSvc.delete(o.id).subscribe({ next: () => this.loadOffers() }); }

  // --- Candidates ---
  loadCandidates() { this.candidateSvc.getAll().subscribe({ next: d => this.candidates = d??[] }); }
  searchCandidates() {
    if (!this.candidateSkillQ.trim()) { this.loadCandidates(); return; }
    this.candidateSvc.searchBySkill(this.candidateSkillQ.trim()).subscribe({ next: d => this.candidates = d??[] });
  }
  openCreateCandidate() { this.editingCandidate=null; this.candidateForm={ id:0, title:'', skills:[], experienceYears:0, resumeUrl:'', isLookingForJob:true }; this.candidateSkillsStr=''; this.showCandidateModal=true; }
  openEditCandidate(c: Candidate) { this.editingCandidate=c; this.candidateForm={ ...c, skills:[...c.skills] }; this.candidateSkillsStr=c.skills.join(', '); this.showCandidateModal=true; }
  submitCandidate() {
    this.candidateForm.skills = this.candidateSkillsStr.split(',').map(s=>s.trim()).filter(s=>s);
    const obs = this.editingCandidate ? this.candidateSvc.update(this.editingCandidate.id, this.candidateForm) : this.candidateSvc.create(this.candidateForm);
    obs.subscribe({ next: () => { this.showCandidateModal=false; this.loadCandidates(); }, error: e => alert(e?.error?.message||'Error') });
  }
  removeCandidate(c: Candidate) { if(!confirm('Delete?')) return; this.candidateSvc.delete(c.id).subscribe({ next: () => this.loadCandidates() }); }

  // --- Applications ---
  loadApplications() {
    this.appSvc.getAll().subscribe({ next: d => { this.applications = d??[]; this.filterApps(); } });
    if (!this.allOffers.length) this.loadOffers();
  }
  filterApps() {
    this.filteredApps = this.appFilterOfferId ? this.applications.filter(a => a.jobOfferId===this.appFilterOfferId) : this.applications;
  }

  openEmailModal(application: Application, isAccepting: boolean) {
    this.selectedApplication = application;
    this.isAcceptingEmail = isAccepting;
    this.showEmailModal = true;
  }

  handleEmailSend(customMessage: string) {
    if (!this.selectedApplication) return;

    const app = this.selectedApplication;
    const promise = this.isAcceptingEmail 
      ? this.emailSvc.acceptCandidate(app, customMessage)
      : this.emailSvc.rejectCandidate(app, customMessage);

    promise
      .then(() => {
        alert(`Email sent to ${app.candidateEmail}`);
        this.showEmailModal = false;
        this.loadApplications();
      })
      .catch((error) => {
        alert('Error: ' + (error?.error?.message || 'Failed to send email'));
        this.showEmailModal = false;
        this.loadApplications();
      });
  }

  setAppStatus(a: Application, status: string) { 
    this.appSvc.updateStatus(a.id, status).subscribe({ next: () => this.loadApplications() }); 
  }
  
  removeApp(a: Application) { if(!confirm('Delete?')) return; this.appSvc.delete(a.id).subscribe({ next: () => this.loadApplications() }); }

  matchClass(score: number): string {
    if (score >= 70) return 'match-green';
    if (score >= 40) return 'match-orange';
    return 'match-red';
  }
}
