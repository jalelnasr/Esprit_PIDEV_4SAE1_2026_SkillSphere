import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  isDarkMode = false;
  
  get currentUser$() {
    return this.authService.currentUser$;
  }

  menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '📚', label: 'Courses', path: '/admin/courses' },
    { icon: '🌐', label: 'Community', path: '/admin/community' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
    { icon: '💼', label: 'B2B Corporate', path: '/admin/corporate' },
    { icon: '🎓', label: 'Certifications', path: '/admin/certifications' },
    { icon: '⚙️', label: 'Settings', path: '/admin/settings' }
  ];

  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
