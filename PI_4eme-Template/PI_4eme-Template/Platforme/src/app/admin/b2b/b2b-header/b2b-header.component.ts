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
        <button class="menu-toggle" (click)="toggleSidebar.emit()">☰</button>
        <h2 class="header-title">{{ greeting }}</h2>
      </div>
      <div class="header-right">
        <button class="theme-btn" (click)="toggleTheme()" [title]="isDark ? 'Light mode' : 'Dark mode'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <div class="user-info">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-meta">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ roleName }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()">🚪</button>
      </div>
    </header>
  `,
  styles: [`
    .b2b-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      background: var(--b2b-header-bg, #ffffff);
      border-bottom: 1px solid var(--b2b-border, rgba(0,0,0,0.08));
      position: sticky;
      top: 0;
      z-index: 50;
    }
    :root.dark-mode .b2b-header { --b2b-header-bg: #1e293b; --b2b-border: rgba(255,255,255,0.08); }

    .header-left { display: flex; align-items: center; gap: 16px; }
    .menu-toggle {
      background: none; border: none; font-size: 20px; cursor: pointer;
      color: var(--b2b-text, #0f172a); display: none;
    }
    :root.dark-mode .menu-toggle { color: #e2e8f0; }
    @media (max-width: 768px) { .menu-toggle { display: block; } }

    .header-title {
      font-size: 18px; font-weight: 600;
      color: var(--b2b-text, #0f172a);
    }
    :root.dark-mode .header-title { color: #f1f5f9; }

    .header-right { display: flex; align-items: center; gap: 12px; }

    .theme-btn {
      background: none; border: 1px solid var(--b2b-border, rgba(0,0,0,0.1));
      border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 16px;
    }
    .theme-btn:hover { background: rgba(0,0,0,0.04); }
    :root.dark-mode .theme-btn { border-color: rgba(255,255,255,0.12); }
    :root.dark-mode .theme-btn:hover { background: rgba(255,255,255,0.06); }

    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700;
    }
    .user-meta { display: flex; flex-direction: column; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--b2b-text, #0f172a); }
    .user-role { font-size: 11px; color: #64748b; }
    :root.dark-mode .user-name { color: #f1f5f9; }

    .logout-btn {
      background: none; border: none; font-size: 18px; cursor: pointer;
      opacity: 0.6; transition: opacity 0.2s;
    }
    .logout-btn:hover { opacity: 1; }
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
