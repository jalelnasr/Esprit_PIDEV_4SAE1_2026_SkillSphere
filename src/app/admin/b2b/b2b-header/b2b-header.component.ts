import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-b2b-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="b2b-header">
      <div class="header-left">
        <button class="sidebar-toggle" (click)="toggleSidebar.emit()" aria-label="Toggle sidebar">
          <span>☰</span>
        </button>
        <div class="navbar-logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">SkillSphere Corporate</span>
        </div>
      </div>

      <div class="header-right">
        <button class="theme-toggle-btn" (click)="toggleTheme()" [title]="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>

        <div class="admin-profile">
          <div class="profile-info">
            <div class="profile-name">{{ userName }}</div>
            <div class="profile-role">{{ roleName }}</div>
          </div>
          <div class="profile-avatar">{{ initials || 'U' }}</div>
        </div>

        <button class="logout-btn" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .b2b-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--b2b-navbar-bg, rgba(255, 255, 255, 0.75));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--b2b-border, rgba(15, 23, 42, 0.08));
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: all 0.3s ease;
    }
    :root.dark-mode .b2b-header {
      --b2b-navbar-bg: rgba(15, 23, 42, 0.8);
      --b2b-border: rgba(148, 163, 184, 0.1);
      box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .sidebar-toggle {
      background: rgba(8, 145, 178, 0.1);
      border: 1px solid rgba(8, 145, 178, 0.2);
      width: 42px;
      height: 42px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1.2rem;
      color: #06b6d4;
      transition: all 0.3s ease;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .sidebar-toggle:hover {
      background: rgba(8, 145, 178, 0.2);
      border-color: #0891b2;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
    }

    .navbar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 800;
      font-size: 1.25rem;
    }
    .logo-icon {
      font-size: 1.6rem;
      filter: drop-shadow(0 0 8px rgba(8, 145, 178, 0.5));
    }
    .logo-text {
      background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.4px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle-btn {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      border: 1px solid rgba(8, 145, 178, 0.2);
      background: rgba(8, 145, 178, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      transition: all 0.3s ease;
    }
    .theme-toggle-btn:hover {
      background: rgba(8, 145, 178, 0.15);
      border-color: #0891b2;
      transform: scale(1.05) rotate(15deg);
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1rem;
      background: rgba(8, 145, 178, 0.1);
      border: 1px solid rgba(8, 145, 178, 0.2);
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    .admin-profile:hover {
      background: rgba(8, 145, 178, 0.15);
      border-color: #0891b2;
      transform: translateY(-1px);
    }

    .profile-info { text-align: right; }
    .profile-name {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--text-primary, #0f172a);
      line-height: 1.2;
    }
    .profile-role {
      font-size: 0.75rem;
      color: var(--text-secondary, #475569);
      font-weight: 500;
    }

    .profile-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0891b2 0%, #8b5cf6 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.4);
    }

    .logout-btn {
      padding: 0.6rem 1.2rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    @media (max-width: 768px) {
      .sidebar-toggle { display: flex; }
      .b2b-header { padding: 1rem 1.25rem; }
      .profile-info { display: none; }
      .header-right { gap: 0.5rem; }
      .logout-btn { padding: 0.5rem 1rem; font-size: 0.8rem; }
    }

    @media (max-width: 480px) {
      .logo-text { display: none; }
    }
  `]
})
export class B2bHeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  userName = '';
  initials = '';
  roleName = '';
  isDark = false;
  greeting = '';

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.userName = `${u.prenom} ${u.nom}`;
        this.initials = (u.prenom?.[0] || '') + (u.nom?.[0] || '');
      }
    });
    this.authService.userRole$.subscribe(r => {
      this.roleName = this.roleLabel(r || '');
    });
    this.themeService.isDarkMode$.subscribe(d => this.isDark = d);

    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Good morning 👋' : h < 18 ? 'Good afternoon 👋' : 'Good evening 👋';
  }

  toggleTheme() { this.themeService.toggleDarkMode(); }
  logout() { this.authService.logout(); this.router.navigate(['/auth/login']); }

  private roleLabel(r: string): string {
    const map: Record<string, string> = {
      'RH_ENTREPRISE': 'HR', 'MANAGER': 'Manager', 'APPRENANT': 'Learner', 'ADMIN': 'Admin'
    };
    return map[r] || r;
  }
}
