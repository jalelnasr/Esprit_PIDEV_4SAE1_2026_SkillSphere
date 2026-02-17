import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/services';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;
  isDarkMode = false;

  get currentUser$() {
    return this.authService.currentUser$;
  }

  notifications = [
    { id: 1, message: 'New course "Advanced Angular" is available', time: '5 minutes ago', read: false },
    { id: 2, message: 'You completed the Python quiz!', time: '2 hours ago', read: true },
    { id: 3, message: 'Join us for the Web Development Bootcamp', time: '1 day ago', read: true }
  ];

  unreadCount = 1;

  constructor(private authService: AuthService, public themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
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
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount--;
    }
  }

  search(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // TODO: Implement search functionality
    }
  }

  logout(): void {
    this.authService.logout();
  }

  closeMenus(): void {
    this.showNotifications = false;
    this.showUserMenu = false;
  }
}
