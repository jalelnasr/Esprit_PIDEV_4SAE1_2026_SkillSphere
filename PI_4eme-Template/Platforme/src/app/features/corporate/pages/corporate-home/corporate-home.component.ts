import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { B2bPackService } from '../../../../admin/b2b/services/pack.service';
import { B2bJobOfferService } from '../../../../admin/b2b/services/job-offer.service';
import { B2bMissionService } from '../../../../admin/b2b/services/mission.service';
import { B2bCompanyService } from '../../../../admin/b2b/services/company.service';

@Component({
  selector: 'app-corporate-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="corporate-home">

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-badge">🏢 B2B Corporate Module</div>
          <h1>SkillSphere <span class="highlight">Corporate</span></h1>
          <p class="hero-sub">
            A complete ecosystem for managing corporate training, recruitment and freelancing.
            Empower your teams with world-class learning programs.
          </p>
          <div class="hero-actions">
            <a routerLink="/catalog" class="btn-primary">📚 Browse Catalog</a>
            <a routerLink="/careers" class="btn-secondary">💼 View Job Offers</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="float-card c1">
            <span class="fc-icon">📊</span>
            <span class="fc-text">Analytics</span>
          </div>
          <div class="float-card c2">
            <span class="fc-icon">🎓</span>
            <span class="fc-text">Training</span>
          </div>
          <div class="float-card c3">
            <span class="fc-icon">🚀</span>
            <span class="fc-text">Missions</span>
          </div>
        </div>
      </section>

      <!-- Live Stats -->
      <section class="stats-section" *ngIf="!loading">
        <div class="stat-card" *ngFor="let s of stats">
          <div class="stat-icon-wrap" [style.background]="s.bg">
            <span>{{ s.icon }}</span>
          </div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </section>

      <section class="stats-section" *ngIf="loading">
        <div class="stat-card skeleton" *ngFor="let i of [1,2,3,4]">
          <div class="skel-circle"></div>
          <div class="skel-line w60"></div>
          <div class="skel-line w40"></div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="features-section">
        <h2 class="section-title">What our module offers</h2>
        <p class="section-sub">A complete B2B platform with 6 major feature sets</p>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let f of features"
               [routerLink]="f.link" style="cursor: pointer;">
            <div class="feature-icon" [style.background]="f.gradient">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
            <span class="feature-link">Explore →</span>
          </div>
        </div>
      </section>

      <!-- How it Works -->
      <section class="how-section">
        <h2 class="section-title">How does it work?</h2>
        <div class="steps-row">
          <div class="step" *ngFor="let step of steps; let i = index">
            <div class="step-number">{{ i + 1 }}</div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Roles Section -->
      <section class="roles-section">
        <h2 class="section-title">A portal for every role</h2>
        <p class="section-sub">Each user has a personalized experience based on their role</p>
        <div class="roles-grid">
          <div class="role-card" *ngFor="let r of roles">
            <div class="role-icon">{{ r.icon }}</div>
            <h4>{{ r.name }}</h4>
            <ul>
              <li *ngFor="let perm of r.perms">{{ perm }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- CTA to Portal -->
      <section class="cta-section" *ngIf="showPortalCTA">
        <div class="cta-card">
          <div class="cta-left">
            <h2>Access the Management Portal</h2>
            <p>Manage your employees, training packs, recruitment and analytics from a dedicated dashboard.</p>
          </div>
          <a [routerLink]="portalLink" class="cta-btn">Open Portal →</a>
        </div>
      </section>

      <!-- Footer -->
      <section class="fo-footer">
        <p>SkillSphere B2B Corporate — Powered by Angular 18 + Spring Boot</p>
      </section>
    </div>
  `,
  styles: [`
    .corporate-home { max-width: 1200px; margin: 0 auto; padding: 0; }

    /* ---- HERO ---- */
    .hero {
      position: relative; padding: 60px 32px 48px; border-radius: 24px; margin: 24px 16px;
      overflow: hidden; min-height: 340px; display: flex; align-items: center; gap: 40px;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: linear-gradient(135deg, #312e81 0%, #4f46e5 40%, #7c3aed 100%);
    }
    .hero-bg::after {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%);
    }
    .hero-content { position: relative; z-index: 1; flex: 1; }
    .hero-badge {
      display: inline-block; padding: 6px 16px; border-radius: 20px;
      background: rgba(255,255,255,0.15); color: #e0e7ff; font-size: 13px;
      font-weight: 600; margin-bottom: 16px; backdrop-filter: blur(4px);
    }
    .hero h1 {
      font-size: 42px; font-weight: 900; color: #fff; margin: 0 0 12px;
      line-height: 1.1; letter-spacing: -0.5px;
    }
    .highlight { color: #a5b4fc; }
    .hero-sub { font-size: 16px; color: rgba(255,255,255,0.8); max-width: 500px; line-height: 1.6; margin-bottom: 24px; }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-primary {
      padding: 14px 28px; border-radius: 14px; font-weight: 700; font-size: 15px;
      background: #fff; color: #4f46e5; text-decoration: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15); transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    .btn-secondary {
      padding: 14px 28px; border-radius: 14px; font-weight: 700; font-size: 15px;
      background: rgba(255,255,255,0.15); color: #fff; text-decoration: none;
      border: 1.5px solid rgba(255,255,255,0.3); transition: all 0.2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.25); }

    .hero-visual {
      position: relative; z-index: 1; width: 280px; height: 220px; flex-shrink: 0;
    }
    .float-card {
      position: absolute; padding: 14px 20px; border-radius: 16px;
      background: rgba(255,255,255,0.12); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18); display: flex; align-items: center; gap: 10px;
      animation: float 3s ease-in-out infinite; color: #fff; font-weight: 600; font-size: 14px;
    }
    .fc-icon { font-size: 22px; }
    .c1 { top: 0; left: 20px; animation-delay: 0s; }
    .c2 { top: 70px; right: 0; animation-delay: 1s; }
    .c3 { bottom: 0; left: 40px; animation-delay: 2s; }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* ---- STATS ---- */
    .stats-section {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
      padding: 0 16px; margin: -20px 0 40px;
      position: relative; z-index: 2;
    }
    .stat-card {
      background: var(--card-bg, #fff); border-radius: 18px; padding: 24px 20px;
      text-align: center; border: 1.5px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06); transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); }
    :root.dark-mode .stat-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .stat-icon-wrap {
      width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center;
      justify-content: center; font-size: 24px; margin: 0 auto 12px;
    }
    .stat-value { font-size: 32px; font-weight: 900; color: var(--text-primary, #0f172a); }
    :root.dark-mode .stat-value { color: #f1f5f9; }
    .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }

    .stat-card.skeleton { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .skel-circle { width: 52px; height: 52px; border-radius: 14px; background: #e2e8f0; animation: pulse 1.5s ease infinite; }
    .skel-line { height: 14px; border-radius: 6px; background: #e2e8f0; animation: pulse 1.5s ease infinite; }
    .w60 { width: 60%; }
    .w40 { width: 40%; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    :root.dark-mode .skel-circle, :root.dark-mode .skel-line { background: #334155; }

    /* ---- FEATURES ---- */
    .features-section { padding: 0 16px; margin-bottom: 48px; }
    .section-title {
      font-size: 28px; font-weight: 800; color: var(--text-primary, #0f172a);
      text-align: center; margin: 0 0 8px;
    }
    :root.dark-mode .section-title { color: #f1f5f9; }
    .section-sub { text-align: center; color: #64748b; font-size: 15px; margin-bottom: 32px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .feature-card {
      background: var(--card-bg, #fff); border-radius: 20px; padding: 28px;
      border: 1.5px solid rgba(0,0,0,0.06); transition: all 0.3s;
      text-decoration: none;
    }
    .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: #6366f1; }
    :root.dark-mode .feature-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .feature-icon {
      width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center;
      justify-content: center; font-size: 26px; margin-bottom: 16px;
    }
    .feature-card h3 { font-size: 18px; font-weight: 700; margin: 0 0 8px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .feature-card h3 { color: #f1f5f9; }
    .feature-card p { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 16px; }
    .feature-link { font-size: 14px; font-weight: 700; color: #6366f1; }
    .feature-card:hover .feature-link { text-decoration: underline; }

    /* ---- HOW IT WORKS ---- */
    .how-section { padding: 48px 16px; margin-bottom: 48px; border-radius: 24px; background: linear-gradient(135deg, #f0f0ff 0%, #e0f2fe 100%); }
    :root.dark-mode .how-section { background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.08)); }
    .steps-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 32px; }
    .step { text-align: center; }
    .step-number {
      width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 20px; font-weight: 800; margin: 0 auto 14px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }
    .step h4 { font-size: 16px; font-weight: 700; margin: 0 0 8px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .step h4 { color: #f1f5f9; }
    .step p { font-size: 13px; color: #64748b; line-height: 1.5; }

    /* ---- ROLES ---- */
    .roles-section { padding: 0 16px; margin-bottom: 48px; }
    .roles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
    .role-card {
      background: var(--card-bg, #fff); border-radius: 18px; padding: 24px;
      border: 1.5px solid rgba(0,0,0,0.06); text-align: center;
    }
    :root.dark-mode .role-card { background: #1e293b; border-color: rgba(255,255,255,0.06); }
    .role-icon { font-size: 36px; margin-bottom: 12px; }
    .role-card h4 { font-size: 16px; font-weight: 700; margin: 0 0 12px; color: var(--text-primary, #0f172a); }
    :root.dark-mode .role-card h4 { color: #f1f5f9; }
    .role-card ul { list-style: none; padding: 0; margin: 0; text-align: left; }
    .role-card li {
      font-size: 13px; color: #64748b; padding: 4px 0; border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .role-card li::before { content: '✓ '; color: #22c55e; font-weight: 700; }

    /* ---- CTA ---- */
    .cta-section { padding: 0 16px; margin-bottom: 48px; }
    .cta-card {
      display: flex; align-items: center; justify-content: space-between; gap: 24px;
      padding: 36px 40px; border-radius: 24px;
      background: linear-gradient(135deg, #312e81, #4f46e5); color: #fff;
    }
    .cta-left h2 { font-size: 24px; font-weight: 800; margin: 0 0 8px; }
    .cta-left p { font-size: 15px; color: rgba(255,255,255,0.8); margin: 0; max-width: 500px; }
    .cta-btn {
      padding: 16px 36px; border-radius: 14px; font-weight: 700; font-size: 16px;
      background: #fff; color: #4f46e5; text-decoration: none; white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15); transition: all 0.2s;
    }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

    /* ---- FOOTER ---- */
    .fo-footer { text-align: center; padding: 32px 16px 40px; }
    .fo-footer p { font-size: 13px; color: #94a3b8; }

    /* ---- RESPONSIVE ---- */
    @media (max-width: 900px) {
      .hero { flex-direction: column; padding: 40px 24px; }
      .hero-visual { display: none; }
      .hero h1 { font-size: 32px; }
      .stats-section { grid-template-columns: repeat(2, 1fr); }
      .features-grid { grid-template-columns: 1fr; }
      .steps-row { grid-template-columns: repeat(2, 1fr); }
      .cta-card { flex-direction: column; text-align: center; }
    }
    @media (max-width: 640px) {
      .stats-section { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class CorporateHomeComponent implements OnInit {
  loading = true;
  userRole = '';
  showPortalCTA = false;
  portalLink = '/corporate';

  stats: { icon: string; value: number; label: string; bg: string }[] = [];

  features = [
    {
      icon: '📦', title: 'Training Catalog',
      desc: 'Browse premium training packs for your employees with detailed pricing and content.',
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
      link: '/catalog'
    },
    {
      icon: '💼', title: 'Job Offers',
      desc: 'Discover career opportunities from partner companies. Apply directly online.',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.12))',
      link: '/careers'
    },
    {
      icon: '🚀', title: 'Freelance Missions',
      desc: 'Find freelance missions matching your skills. Propose your rate and apply.',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.12))',
      link: '/freelance'
    },
    {
      icon: '👥', title: 'Employee Management',
      desc: 'Manage employees, assign training courses and track their progress in real time.',
      gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.12))',
      link: '/corporate'
    },
    {
      icon: '📊', title: 'Analytics Dashboard',
      desc: 'Visualize KPIs with interactive charts: training completion, budget usage, trends.',
      gradient: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(236,72,153,0.12))',
      link: '/corporate'
    },
    {
      icon: '📋', title: 'Activity Log',
      desc: 'Full audit trail of all actions: employee creation, assignments, status changes.',
      gradient: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.12))',
      link: '/corporate'
    }
  ];

  steps = [
    { title: 'Create Company', desc: 'Admin creates the company and its HR account on the platform.' },
    { title: 'Add Employees', desc: 'HR imports or creates employee accounts with roles.' },
    { title: 'Assign Training', desc: 'Manager or HR assigns training packs to employees.' },
    { title: 'Track Progress', desc: 'Monitor completion rates, analytics and certifications.' }
  ];

  roles = [
    {
      icon: '👑', name: 'Administrator',
      perms: ['Manage all companies', 'View global analytics', 'Full platform access']
    },
    {
      icon: '🏢', name: 'HR Manager',
      perms: ['Manage employees', 'Assign training', 'Post job offers', 'View analytics']
    },
    {
      icon: '📋', name: 'Manager',
      perms: ['View team members', 'Track team progress', 'Assign training to team']
    },
    {
      icon: '🎓', name: 'Employee',
      perms: ['View assigned courses', 'Track personal progress', 'Apply to job offers']
    },
    {
      icon: '🚀', name: 'Freelancer',
      perms: ['Browse missions', 'Submit proposals', 'Manage contracts']
    }
  ];

  constructor(
    private authService: AuthService,
    private packSvc: B2bPackService,
    private jobSvc: B2bJobOfferService,
    private missionSvc: B2bMissionService,
    private companySvc: B2bCompanyService
  ) {}

  ngOnInit() {
    this.authService.userRole$.subscribe(role => {
      this.userRole = role || '';
      this.showPortalCTA = ['RH_ENTREPRISE', 'MANAGER', 'ADMIN'].includes(this.userRole);
      this.portalLink = this.userRole === 'ADMIN' ? '/admin/corporate' : '/corporate';
    });

    forkJoin({
      packs: this.packSvc.getAll().pipe(catchError(() => of([]))),
      jobs: this.jobSvc.getOpen().pipe(catchError(() => of([]))),
      missions: this.missionSvc.getOpen().pipe(catchError(() => of([]))),
      companies: this.companySvc.getAll().pipe(catchError(() => of([])))
    }).subscribe(({ packs, jobs, missions, companies }) => {
      this.stats = [
        { icon: '🏢', value: companies.length, label: 'Partner Companies', bg: 'rgba(99,102,241,0.1)' },
        { icon: '📦', value: packs.filter(p => p.isActive).length, label: 'Training Packs', bg: 'rgba(34,197,94,0.1)' },
        { icon: '💼', value: jobs.length, label: 'Open Job Offers', bg: 'rgba(59,130,246,0.1)' },
        { icon: '🚀', value: missions.length, label: 'Freelance Missions', bg: 'rgba(245,158,11,0.1)' }
      ];
      this.loading = false;
    });
  }
}
