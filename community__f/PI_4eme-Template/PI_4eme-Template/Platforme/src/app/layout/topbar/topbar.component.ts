import { ApplicationRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { filter, Subscription, take } from 'rxjs';
import { AuthService } from '@core/services';
import { ThemeService } from '../../services/theme.service';
import { CommunityNotification } from '../../features/community/models/notification.model';
import { NotificationStreamService } from '../../features/community/services/notification-stream.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit, OnDestroy {
  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;
  isDarkMode = false;
  notifications: CommunityNotification[] = [];
  unreadCount = 0;
  streamState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' = 'idle';

  private readonly subscriptions = new Subscription();

  get currentUser$() {
    return this.authService.currentUser$;
  }

  constructor(
    private authService: AuthService,
    private notificationStreamService: NotificationStreamService,
    public themeService: ThemeService,
    private router: Router,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.appRef.isStable.pipe(filter(Boolean), take(1)).subscribe(() => {
        this.notificationStreamService.start();
      })
    );

    this.subscriptions.add(
      this.themeService.isDarkMode$.subscribe((isDark) => {
        this.isDarkMode = isDark;
      })
    );

    this.subscriptions.add(
      this.notificationStreamService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
      })
    );

    this.subscriptions.add(
      this.notificationStreamService.unreadCount$.subscribe((unreadCount) => {
        this.unreadCount = unreadCount;
      })
    );

    this.subscriptions.add(
      this.notificationStreamService.streamState$.subscribe((state) => {
        this.streamState = state;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  markAsRead(id: string): void {
    this.notificationStreamService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationStreamService.markAllAsRead();
  }

  openNotification(notification: CommunityNotification): void {
    this.markAsRead(notification.id);
    this.showNotifications = false;

    const target = this.notificationStreamService.resolveRoute(notification);
    void this.router.navigate(target.commands, { queryParams: target.queryParams });
  }

  notificationIcon(notification: CommunityNotification): string {
    if (notification.type === 'like') {
      return '❤️';
    }

    if (notification.type === 'follow') {
      return '👤';
    }

    return '💬';
  }

  notificationTime(notification: CommunityNotification): string {
    const createdAt = Date.parse(notification.createdAt || '');
    if (!Number.isFinite(createdAt)) {
      return 'just now';
    }

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
    if (elapsedSeconds < 60) {
      return 'just now';
    }

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
      return `${elapsedHours}h ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays}d ago`;
  }

  streamStatusLabel(): string {
    if (this.streamState === 'connected') {
      return 'Live';
    }

    if (this.streamState === 'connecting' || this.streamState === 'reconnecting') {
      return 'Connecting...';
    }

    return 'Offline';
  }

  search(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
    }
  }

  logout(): void {
    this.notificationStreamService.stop('disconnected', true);
    this.authService.logout();
    this.closeMenus();
    this.router.navigateByUrl('/home');
  }

  closeMenus(): void {
    this.showNotifications = false;
    this.showUserMenu = false;
  }
}
