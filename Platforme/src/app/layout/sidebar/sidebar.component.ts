import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { ThemeService } from '../../services/theme.service';
import { ALL_MENU_ITEMS, MenuItem, BackendRole } from '../menu.config';

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

  // ✅ backend roles
  userRole: BackendRole | null = null;

  get currentUser$() {
    return this.authService.currentUser$;
  }

  allMenuItems: MenuItem[] = ALL_MENU_ITEMS;

  menuItems: MenuItem[] = [];
  expandedItems: { [key: string]: boolean } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Subscribe to user role changes (BackendRole)
    this.authService.userRole$.subscribe(role => {
      this.userRole = role as BackendRole | null;
      this.updateMenuItems();
    });

    // Initial load
    this.updateMenuItems();
  }

  updateMenuItems(): void {
    if (this.userRole) {
      this.menuItems = this.allMenuItems
        .filter(item => item.roles.includes(this.userRole!))
        .map(item => ({
          ...item,
          subItems: item.subItems?.filter(subItem =>
            !subItem.roles || subItem.roles.includes(this.userRole!)
          )
        }));
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