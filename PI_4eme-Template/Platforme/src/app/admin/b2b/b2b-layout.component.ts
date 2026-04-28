import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-b2b-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="b2b-layout">
      <nav class="b2b-subnav">
        <a *ngFor="let item of navItems"
           [routerLink]="item.path"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: item.exact || false }"
           class="subnav-link">
          <span class="subnav-icon">{{ item.icon }}</span>
          <span class="subnav-label">{{ item.label }}</span>
        </a>
      </nav>
      <div class="b2b-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .b2b-layout {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .b2b-subnav {
      display: flex;
      gap: 4px;
      padding: 12px 24px;
      background: var(--admin-surface-1, rgba(255,255,255,0.72));
      border-bottom: 1px solid var(--admin-border, rgba(0,0,0,0.08));
      overflow-x: auto;
      flex-shrink: 0;
    }

    .subnav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--admin-text-secondary, #64748b);
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .subnav-link:hover {
      background: var(--admin-surface-2, rgba(0,0,0,0.04));
      color: var(--admin-text-primary, #0f172a);
    }

    .subnav-link.active {
      background: var(--admin-primary, #6366f1);
      color: #fff;
      box-shadow: 0 2px 8px rgba(99,102,241,0.25);
    }

    .subnav-icon {
      font-size: 16px;
    }

    .b2b-content {
      flex: 1;
      overflow-y: auto;
    }

    :root.dark-mode .b2b-subnav {
      background: var(--admin-surface-1, rgba(30,41,59,0.72));
      border-color: var(--admin-border, rgba(255,255,255,0.08));
    }
  `]
})
export class B2bLayoutComponent {
  navItems = [
    { icon: '📊', label: 'Dashboard', path: '/admin/corporate', exact: true },
    { icon: '🏢', label: 'Companies', path: '/admin/corporate/companies' },
    { icon: '👥', label: 'Employees', path: '/admin/corporate/employees' },
    { icon: '📦', label: 'Packs & Purchases', path: '/admin/corporate/packs' },
    { icon: '📚', label: 'Trainings', path: '/admin/corporate/assignments' },
    { icon: '💼', label: 'Recruitment', path: '/admin/corporate/recruitment' },
    { icon: '🎯', label: 'Freelance', path: '/admin/corporate/freelance' }
  ];
}
