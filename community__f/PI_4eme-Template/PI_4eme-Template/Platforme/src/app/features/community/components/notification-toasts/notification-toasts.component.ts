import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommunityNotification, CommunityNotificationType } from '../../models/notification.model';
import { NotificationStreamService } from '../../services/notification-stream.service';

@Component({
  selector: 'app-notification-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toasts.component.html',
  styleUrls: ['./notification-toasts.component.css']
})
export class NotificationToastsComponent {
  constructor(
    private readonly notificationStreamService: NotificationStreamService,
    private readonly router: Router
  ) {}

  get toastNotifications$() {
    return this.notificationStreamService.toastNotifications$;
  }

  dismiss(notificationId: string): void {
    this.notificationStreamService.dismissToast(notificationId);
  }

  open(notification: CommunityNotification): void {
    const target = this.notificationStreamService.resolveRoute(notification);

    this.notificationStreamService.markAsRead(notification.id);
    this.notificationStreamService.dismissToast(notification.id);

    void this.router.navigate(target.commands, {
      queryParams: target.queryParams
    });
  }

  icon(type: CommunityNotificationType): string {
    if (type === 'like') {
      return '❤️';
    }

    if (type === 'follow') {
      return '👤';
    }

    return '💬';
  }

  trackById(_index: number, notification: CommunityNotification): string {
    return notification.id;
  }
}
