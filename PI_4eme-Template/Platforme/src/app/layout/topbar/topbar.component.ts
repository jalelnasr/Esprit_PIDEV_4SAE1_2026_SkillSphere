import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services';
import { ThemeService } from '../../services/theme.service';
import { RouterLink } from '@angular/router';
import { NotificationCenterComponent } from '../../shared/components/notification-center/notification-center.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationCenterComponent],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;
  isDarkMode = false;
  userRole: string | null = null;

  notifications = [
    { id: 1, message: 'New course available', time: '5 minutes ago', read: false },
    { id: 2, message: 'You completed a quiz!', time: '2 hours ago', read: true },
    { id: 3, message: 'Join the Web Development Bootcamp', time: '1 day ago', read: true }
  ];

  unreadCount = 1;

  get currentUser$() {
    return this.authService.currentUser$;
  }

  get shouldHidePaymentOptions(): boolean {
    return this.userRole === 'FORMATEUR' || this.userRole === 'ADMIN';
  }

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  markAsRead(id: number): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      this.unreadCount--;
    }
  }

  search(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeMenus();
    this.router.navigateByUrl('/home');
  }

  closeMenus(): void {
    this.showNotifications = false;
    this.showUserMenu = false;
  }
}