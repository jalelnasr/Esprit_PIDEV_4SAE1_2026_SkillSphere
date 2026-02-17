import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { ThemeService } from '../../services/theme.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string | null;
  roles: ('learner' | 'instructor' | 'enterprise' | 'admin')[];
  subItems?: SubItem[];
}

interface SubItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isDarkMode = false;
  userRole: 'learner' | 'instructor' | 'enterprise' | 'admin' | null = null;

  get currentUser$() {
    return this.authService.currentUser$;
  }

  allMenuItems: MenuItem[] = [
    { icon: '🏠', label: 'Home', route: '/dashboard', badge: null, roles: ['learner', 'instructor', 'enterprise'] },
    { 
      icon: '📚', 
      label: 'Learning', 
      route: '/learning',
      roles: ['learner', 'instructor'],
      subItems: [
        { label: 'Browse Courses', route: '/learning/browse' },
        { label: 'My Courses', route: '/learning/my-courses' },
        { label: 'Wishlist', route: '/learning/wishlist' }
      ]
    },
    { 
      icon: '🎓', 
      label: 'Certification', 
      route: '/certification',
      roles: ['learner', 'instructor'],
      subItems: [
        { label: 'Exams', route: '/certification/exams' },
        { label: 'My Certificates', route: '/certification/certificates' }
      ]
    },
    { 
      icon: '🏢', 
      label: 'Corporate', 
      route: '/corporate',
      roles: ['enterprise'],
      subItems: [
        { label: 'Dashboard', route: '/corporate/dashboard' },
        { label: 'Team Management', route: '/corporate/teams' }
      ]
    },
    { 
      icon: '🎮', 
      label: 'Gamification', 
      route: '/gamification',
      roles: ['learner', 'instructor'],
      subItems: [
        { label: 'Labs', route: '/gamification/labs' },
        { label: 'Leaderboard', route: '/gamification/leaderboard' }
      ]
    },
    { 
      icon: '👥', 
      label: 'Community', 
      route: '/community',
      roles: ['learner', 'instructor', 'enterprise'],
      subItems: [
        { label: 'Feed', route: '/community/feed' },
        { label: 'Q&A', route: '/community/qa' },
        { label: 'Groups', route: '/community/groups' }
      ]
    },
    { 
      icon: '🎪', 
      label: 'Events', 
      route: '/events',
      roles: ['learner', 'instructor', 'enterprise'],
      subItems: [
        { label: 'Browse Events', route: '/events/browse' },
        { label: 'My Events', route: '/events/my-events' }
      ]
    }
  ];

  menuItems: MenuItem[] = [];
  expandedItems: { [key: string]: boolean } = {};

  constructor(private authService: AuthService, private router: Router, public themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Subscribe to user role changes
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
      this.updateMenuItems();
    });

    // Initial load
    this.updateMenuItems();
  }

  updateMenuItems(): void {
    if (this.userRole) {
      this.menuItems = this.allMenuItems.filter(item => 
        item.roles.includes(this.userRole!)
      );
    } else {
      this.menuItems = [];
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: any): void {
    if (item.subItems) {
      this.expandedItems[item.label] = !this.expandedItems[item.label];
    }
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
