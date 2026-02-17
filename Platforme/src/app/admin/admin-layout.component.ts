import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  isDarkMode = false;
  
  currentUser = {
    name: 'Administrator',
    email: 'admin@skillsphere.com',
    role: 'Super Admin',
    avatar: '👨‍💼'
  };

  menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '📚', label: 'Courses', path: '/admin/courses' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
    { icon: '💼', label: 'B2B Corporate', path: '/admin/corporate' },
    { icon: '🎓', label: 'Certifications', path: '/admin/certifications' },
    { icon: '⚙️', label: 'Settings', path: '/admin/settings' }
  ];

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    // Load admin data
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    // Handle logout
  }
}
