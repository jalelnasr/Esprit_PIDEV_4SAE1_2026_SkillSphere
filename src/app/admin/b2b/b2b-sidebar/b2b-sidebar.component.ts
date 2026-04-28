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
    <aside class="b2b-sidebar" [class.open]="!collapsed">
      <div class="sidebar-header">
        <h3>Menu</h3>
        <button class="close-sidebar" (click)="toggle.emit()">✕</button>
      </div>

      <a *ngIf="userRole === 'ADMIN'"
         routerLink="/admin/dashboard"
         class="menu-item back-admin-link"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: false }">
        <span class="menu-icon">⬅️</span>
        <span class="menu-label">Back to Admin</span>
      </a>

      <div class="sidebar-menu">
        <div *ngFor="let group of visibleGroups" class="menu-group">
          <div class="group-label" *ngIf="group.label">{{ group.label }}</div>
          <a *ngFor="let item of group.items"
             [routerLink]="item.path"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.path === basePath + '/dashboard' }"
             class="menu-item"
             [title]="item.label">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
          </a>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-info">
          <p>{{ brandText }}</p>
          <p>{{ roleName }}</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .b2b-sidebar {
      width: 280px;
      background: var(--b2b-sidebar-bg, rgba(255, 255, 255, 0.72));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid var(--b2b-border, rgba(15, 23, 42, 0.08));
      padding: 2rem 0;
      overflow-y: auto;
      overflow-x: hidden;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      transition: all 0.3s ease;
      position: relative;
    }
    :root.dark-mode .b2b-sidebar {
      --b2b-sidebar-bg: rgba(15, 23, 42, 0.95);
      --b2b-border: rgba(148, 163, 184, 0.1);
      box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
    }

    .sidebar-header {
      padding: 0 1.5rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--b2b-border, rgba(15, 23, 42, 0.08));
      margin-bottom: 1.25rem;
    }
    .sidebar-header h3 {
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-secondary, #475569);
      margin: 0;
    }

    .close-sidebar {
      display: none;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;
      align-items: center;
      justify-content: center;
    }
    .close-sidebar:hover { background: rgba(239, 68, 68, 0.2); transform: scale(1.08); }

    .sidebar-menu {
      list-style: none;
      padding: 0 1rem;
      margin-bottom: 1.5rem;
    }

    .menu-group { margin-bottom: 1rem; }
    .group-label {
      padding: 0 0.6rem 0.4rem;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary, #64748b);
      opacity: 0.85;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1rem;
      color: var(--text-secondary, #475569);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-weight: 500;
      font-size: 0.9rem;
      position: relative;
      margin-bottom: 0.35rem;
    }

    .menu-item:hover {
      background: rgba(8, 145, 178, 0.15);
      color: #0e7490;
      transform: translateX(5px);
    }

    .menu-item.active {
      background: linear-gradient(135deg, rgba(8, 145, 178, 0.2), rgba(139, 92, 246, 0.2));
      color: #0e7490;
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.2);
      border-left: 3px solid #0891b2;
      padding-left: calc(1rem - 3px);
    }

    :root.dark-mode .menu-item { color: #94a3b8; }
    :root.dark-mode .menu-item:hover,
    :root.dark-mode .menu-item.active {
      color: #e2e8f0;
    }

    .menu-icon {
      font-size: 1.15rem;
      min-width: 1.4rem;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--b2b-border, rgba(15, 23, 42, 0.08));
      margin-top: auto;
    }

    .sidebar-info {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-secondary, #64748b);
      line-height: 1.5;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .b2b-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 999;
        transform: translateX(-100%);
        width: 280px;
      }

      .b2b-sidebar.open {
        transform: translateX(0);
      }

      .close-sidebar {
        display: inline-flex;
      }
    }

    @media (max-width: 480px) {
      .b2b-sidebar {
        width: 100%;
      }
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
