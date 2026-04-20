import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Notification } from '../../../core/models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Charger les notifications
    this.loadNotifications();

    // S'abonner au compteur de notifications non lues
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    // S'abonner aux nouvelles notifications
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('🔔 Loading notifications for user:', user.idUser);
        this.notificationService.getUserNotifications(user.idUser).subscribe(
          notifications => {
            console.log('✅ Notifications loaded:', notifications);
          },
          error => {
            console.error('❌ Error loading notifications:', error);
          }
        );
        this.notificationService.getUnreadCount(user.idUser).subscribe(
          count => {
            console.log('✅ Unread count:', count);
          },
          error => {
            console.error('❌ Error loading unread count:', error);
          }
        );
      }
    });
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    console.log('🔔 Panel toggled:', this.isOpen, 'Notifications:', this.notifications.length);
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.idNotification).subscribe(() => {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  markAllAsRead(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.notificationService.markAllAsRead(user.idUser).subscribe(() => {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
        });
      }
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.idNotification).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.idNotification !== notification.idNotification);
      if (!notification.isRead) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'NEW_MESSAGE': return '💬';
      case 'RANKING_CHANGE': return '📊';
      case 'COMPETITION_START': return '🚀';
      case 'COMPETITION_END': return '🏁';
      case 'TEAM_ASSIGNED': return '👥';
      case 'ANNOUNCEMENT': return '📢';
      case 'WINNER_ANNOUNCED': return '🏆';
      default: return '🔔';
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    return `Il y a ${Math.floor(seconds / 86400)} j`;
  }
}
