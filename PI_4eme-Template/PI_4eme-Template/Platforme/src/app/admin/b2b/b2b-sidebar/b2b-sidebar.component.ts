import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavGroup {
  label: string;
  items: { icon: string; label: string; path: string; roles: string[] }[];
}

@Component({
  selector: 'app-b2b-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Brand -->
      <div class="sidebar-brand">
        <span class="brand-icon">🏢</span>
        <span class="brand-text" *ngIf="!collapsed">{{ brandText }}</span>
        <button class="collapse-btn" (click)="toggle.emit()">
          {{ collapsed ? '▶' : '◀' }}
        </button>
      </div>

      <!-- Back to Admin (ADMIN only) -->
      <a *ngIf="userRole === 'ADMIN' && !collapsed"
         routerLink="/admin/dashboard"
         class="back-admin-link">
        ← Back to Admin
      </a>
      <a *ngIf="userRole === 'ADMIN' && collapsed"
         routerLink="/admin/dashboard"
         class="back-admin-link compact"
         title="Back to Admin">
        ←
      </a>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div *ngFor="let group of visibleGroups" class="nav-group">
          <div class="nav-group-label" *ngIf="group.label && !collapsed">{{ group.label }}</div>
          <a *ngFor="let item of group.items"
             [routerLink]="item.path"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.path === basePath + '/dashboard' }"
             class="nav-item"
             [title]="item.label">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
          </a>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="sidebar-role">
          <span class="role-dot"></span>
          {{ roleName }}
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      transition: width 0.3s, min-width 0.3s;
      overflow: hidden;
      position: sticky;
      top: 0;
    }
    .sidebar.collapsed { width: 64px; min-width: 64px; }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-icon { font-size: 24px; }
    .brand-text { font-size: 16px; font-weight: 700; white-space: nowrap; }
    .collapse-btn {
      margin-left: auto;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .collapse-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

    .back-admin-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      margin: 4px 8px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.15);
      transition: all 0.2s;
    }
    .back-admin-link:hover { background: rgba(99,102,241,0.18); color: #a5b4fc; }
    .back-admin-link.compact { justify-content: center; padding: 10px; margin: 4px 6px; font-size: 16px; }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 0;
    }

    .nav-group { margin-bottom: 8px; }
    .nav-group-label {
      padding: 8px 20px 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #64748b;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      margin: 2px 8px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .nav-item.active {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }
    .nav-icon { font-size: 18px; min-width: 20px; text-align: center; }
    .nav-label { flex: 1; }

    .sidebar.collapsed .nav-item { padding: 10px; margin: 2px 6px; justify-content: center; }
    .sidebar.collapsed .nav-group-label { display: none; }
    .sidebar.collapsed .sidebar-footer { display: none; }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .sidebar-role {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #64748b;
    }
    .role-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #22c55e;
    }

    @media (max-width: 768px) {
      .sidebar { position: fixed; z-index: 100; }
      .sidebar.collapsed { width: 0; min-width: 0; padding: 0; }
    }
  `]
})
export class B2bSidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  userRole = '';
  roleName = '';
  brandText = 'Corporate';
  basePath = '/corporate'; // '/corporate' for FO roles, '/admin/corporate' for ADMIN

  // Computed brand text based on role
  private updateBrand() {
    switch (this.userRole) {
      case 'ADMIN': this.brandText = 'B2B Admin'; break;
      case 'RH_ENTREPRISE': this.brandText = 'HR Portal'; break;
      case 'MANAGER': this.brandText = 'Manager Portal'; break;
      case 'APPRENANT': this.brandText = 'My Workspace'; break;
      case 'FORMATEUR': this.brandText = 'Freelance Portal'; break;
      default: this.brandText = 'Corporate';
    }
  }

  private buildGroups(): NavGroup[] {
    const p = this.basePath;
    return [
      // ── Dashboard (everyone) ──
      {
        label: '',
        items: [
          { icon: '📊', label: 'Dashboard', path: p + '/dashboard', roles: ['ADMIN','RH_ENTREPRISE','MANAGER','APPRENANT','FORMATEUR'] }
        ]
      },

      // ── Companies (Admin only) ──
      {
        label: 'Companies',
        items: [
          { icon: '🏢', label: 'Companies', path: p + '/companies', roles: ['ADMIN'] }
        ]
      },

      // ── RH: Full company management ──
      {
        label: 'Management',
        items: [
          { icon: '👥', label: 'Employees', path: p + '/employees', roles: ['ADMIN','RH_ENTREPRISE'] },
          { icon: '📥', label: 'Excel Import', path: p + '/employees/import', roles: ['ADMIN','RH_ENTREPRISE'] },
          { icon: '🔑', label: 'Accounts', path: p + '/accounts', roles: ['ADMIN','RH_ENTREPRISE'] }
        ]
      },

      // ── Manager: Team management ──
      {
        label: 'My Team',
        items: [
          { icon: '👥', label: 'Team Members', path: p + '/employees', roles: ['MANAGER'] },
          { icon: '📋', label: 'Assign Training', path: p + '/assignments', roles: ['MANAGER'] },
          { icon: '📈', label: 'Team Progress', path: p + '/progress', roles: ['MANAGER'] }
        ]
      },

      // ── Employee (Ahmed): My training ──
      {
        label: 'My Training',
        items: [
          { icon: '📚', label: 'My Courses', path: p + '/my-training', roles: ['APPRENANT'] },
          { icon: '📋', label: 'My Assignments', path: p + '/assignments', roles: ['APPRENANT'] },
          { icon: '📈', label: 'My Progress', path: p + '/progress', roles: ['APPRENANT'] }
        ]
      },

      // ── RH: Training management ──
      {
        label: 'Training',
        items: [
          { icon: '📦', label: 'Packs', path: p + '/packs', roles: ['ADMIN','RH_ENTREPRISE'] },
          { icon: '📋', label: 'Assignments', path: p + '/assignments', roles: ['ADMIN','RH_ENTREPRISE'] },
          { icon: '📈', label: 'Progress', path: p + '/progress', roles: ['ADMIN','RH_ENTREPRISE'] }
        ]
      },

      // ── Recruitment: RH only ──
      {
        label: 'Recruitment',
        items: [
          { icon: '💼', label: 'Job Offers', path: p + '/jobs', roles: ['ADMIN','RH_ENTREPRISE'] },
          { icon: '👤', label: 'Candidates', path: p + '/candidates', roles: ['ADMIN','RH_ENTREPRISE'] },
          { icon: '📅', label: 'Interviews', path: '/admin/corporate-admin/interviews', roles: ['ADMIN','RH_ENTREPRISE'] }
        ]
      },

      // ── Freelance: RH manages, FORMATEUR browses ──
      {
        label: 'Freelance',
        items: [
          { icon: '🎯', label: 'Missions', path: p + '/missions', roles: ['ADMIN','RH_ENTREPRISE','FORMATEUR'] },
          { icon: '📄', label: 'Contracts', path: p + '/contracts', roles: ['ADMIN','RH_ENTREPRISE','FORMATEUR'] }
        ]
      },

      // ── Advanced: RH + Manager ──
      {
        label: 'Advanced',
        items: [
          { icon: '📊', label: 'Analytics', path: p + '/analytics', roles: ['ADMIN','RH_ENTREPRISE','MANAGER'] },
          { icon: '📋', label: 'Activity Log', path: p + '/activity-log', roles: ['ADMIN','RH_ENTREPRISE'] }
        ]
      }
    ];
  }

  visibleGroups: NavGroup[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.userRole$.subscribe(role => {
      this.userRole = role || 'APPRENANT';
      // ADMIN uses /admin/corporate, others use /corporate
      this.basePath = this.userRole === 'ADMIN' ? '/admin/corporate' : '/corporate';
      this.roleName = this.roleLabel(this.userRole);
      this.updateBrand();
      const groups = this.buildGroups();
      this.visibleGroups = groups
        .map(g => ({
          label: g.label,
          items: g.items.filter(i => i.roles.includes(this.userRole))
        }))
        .filter(g => g.items.length > 0);
    });
  }

  private roleLabel(r: string): string {
    switch (r) {
      case 'RH_ENTREPRISE': return 'HR Manager';
      case 'MANAGER': return 'Manager';
      case 'APPRENANT': return 'Employee';
      case 'FORMATEUR': return 'Freelance';
      case 'ADMIN': return 'Administrator';
      default: return r;
    }
  }
}
