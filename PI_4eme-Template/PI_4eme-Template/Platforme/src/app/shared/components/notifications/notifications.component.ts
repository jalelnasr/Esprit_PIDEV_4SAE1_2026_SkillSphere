import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  link: string;
  relatedEntityId: number;
  relatedEntityType: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  priority: string;
  icon: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notifications-container">
      <!-- Bouton de notification avec badge -->
      <button class="notification-bell" (click)="toggleDropdown()" [class.has-unread]="unreadCount > 0">
        <span class="bell-icon">🔔</span>
        <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
      </button>

      <!-- Dropdown des notifications -->
      <div class="notifications-dropdown" *ngIf="showDropdown" (click)="$event.stopPropagation()">
        <div class="dropdown-header">
          <h3>📬 Notifications</h3>
          <div class="header-actions">
            <button *ngIf="unreadCount > 0" (click)="markAllAsRead()" class="btn-mark-all">
              ✓ Tout marquer comme lu
            </button>
            <button (click)="toggleDropdown()" class="btn-close">✕</button>
          </div>
        </div>

        <div class="notifications-list" *ngIf="notifications.length > 0">
          <div 
            *ngFor="let notif of notifications" 
            class="notification-item"
            [class.unread]="!notif.isRead"
            [class.priority-high]="notif.priority === 'HIGH'"
            [class.priority-urgent]="notif.priority === 'URGENT'"
            (click)="handleNotificationClick(notif)">
            
            <div class="notif-icon">{{ notif.icon || '📢' }}</div>
            
            <div class="notif-content">
              <div class="notif-header">
                <h4>{{ notif.title }}</h4>
                <span class="notif-time">{{ formatTime(notif.createdAt) }}</span>
              </div>
              <p class="notif-message">{{ notif.message }}</p>
              <div class="notif-footer">
                <span class="notif-type">{{ getTypeLabel(notif.type) }}</span>
                <button 
                  *ngIf="!notif.isRead" 
                  (click)="markAsRead(notif.id, $event)" 
                  class="btn-mark-read">
                  Marquer comme lu
                </button>
              </div>
            </div>

            <button (click)="deleteNotification(notif.id, $event)" class="btn-delete">
              🗑️
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="notifications.length === 0">
          <div class="empty-icon">📭</div>
          <p>Aucune notification</p>
        </div>

        <div class="dropdown-footer">
          <a routerLink="/notifications" (click)="toggleDropdown()" class="btn-view-all">
            Voir toutes les notifications
          </a>
        </div>
      </div>

      <!-- Overlay pour fermer le dropdown -->
      <div class="dropdown-overlay" *ngIf="showDropdown" (click)="toggleDropdown()"></div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: relative;
    }

    .notification-bell {
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-bell:hover {
      background: rgba(99,102,241,0.1);
    }

    .notification-bell.has-unread {
      animation: ring 2s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }

    .bell-icon {
      font-size: 24px;
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 999px;
      min-width: 18px;
      text-align: center;
    }

    .dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 998;
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 420px;
      max-height: 600px;
      background: var(--card-bg, #fff);
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      z-index: 999;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(0,0,0,0.08);
    }

    :root.dark-mode .notifications-dropdown {
      background: #1e293b;
      border-color: rgba(255,255,255,0.08);
    }

    .dropdown-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148,163,184,0.16);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .dropdown-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    :root.dark-mode .dropdown-header h3 {
      color: #f8fafc;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-mark-all {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(99,102,241,0.1);
      color: #6366f1;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-mark-all:hover {
      background: rgba(99,102,241,0.2);
    }

    .btn-close {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: rgba(148,163,184,0.1);
      color: #64748b;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background: rgba(239,68,68,0.1);
      color: #ef4444;
    }

    .notifications-list {
      overflow-y: auto;
      max-height: 480px;
    }

    .notification-item {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148,163,184,0.08);
      display: flex;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .notification-item:hover {
      background: rgba(99,102,241,0.04);
    }

    .notification-item.unread {
      background: rgba(99,102,241,0.06);
    }

    .notification-item.unread::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #6366f1;
    }

    .notification-item.priority-high {
      border-left: 3px solid #f59e0b;
    }

    .notification-item.priority-urgent {
      border-left: 3px solid #ef4444;
    }

    .notif-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 4px;
    }

    .notif-header h4 {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    :root.dark-mode .notif-header h4 {
      color: #f8fafc;
    }

    .notif-time {
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
    }

    .notif-message {
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
      margin: 0 0 8px;
    }

    :root.dark-mode .notif-message {
      color: #94a3b8;
    }

    .notif-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .notif-type {
      font-size: 11px;
      font-weight: 600;
      color: #6366f1;
      background: rgba(99,102,241,0.1);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .btn-mark-read {
      font-size: 11px;
      font-weight: 600;
      color: #6366f1;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .btn-mark-read:hover {
      background: rgba(99,102,241,0.1);
    }

    .btn-delete {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      border-radius: 4px;
      opacity: 0;
      transition: all 0.2s ease;
    }

    .notification-item:hover .btn-delete {
      opacity: 1;
    }

    .btn-delete:hover {
      background: rgba(239,68,68,0.1);
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .dropdown-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(148,163,184,0.16);
    }

    .btn-view-all {
      display: block;
      text-align: center;
      padding: 8px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #6366f1;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-view-all:hover {
      background: rgba(99,102,241,0.1);
    }

    @media (max-width: 640px) {
      .notifications-dropdown {
        width: calc(100vw - 32px);
        right: -16px;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;
  userId: number | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🔔 NotificationsComponent initialized');
    
    // Récupérer l'utilisateur connecté
    this.authService.currentUser$.subscribe(user => {
      console.log('👤 Current user from authService:', user);
      
      if (user && user.idUser) {
        this.userId = user.idUser;
        console.log('✅ User ID set to:', this.userId);
        this.loadNotifications();
        this.startAutoRefresh();
      } else {
        console.warn('⚠️ No user or no idUser found');
        
        // Fallback: essayer de récupérer depuis localStorage
        try {
          // Essayer d'abord 'user' (clé utilisée par AuthService)
          let storedUser = localStorage.getItem('user');
          
          // Si pas trouvé, essayer 'currentUser' (ancienne clé)
          if (!storedUser) {
            storedUser = localStorage.getItem('currentUser');
          }
          
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('📦 User from localStorage:', parsedUser);
            
            // Essayer différents champs pour l'ID
            const userId = parsedUser.idUser || parsedUser.id_user || parsedUser.id;
            
            if (userId) {
              this.userId = userId;
              console.log('✅ User ID set from localStorage:', this.userId);
              this.loadNotifications();
              this.startAutoRefresh();
            } else {
              console.error('❌ No valid user ID found in stored user:', parsedUser);
            }
          } else {
            console.error('❌ No user found in localStorage (tried "user" and "currentUser")');
          }
        } catch (e) {
          console.error('❌ Error reading user from localStorage:', e);
        }
      }
    });

    // Fermer le dropdown si on clique ailleurs
    document.addEventListener('click', this.closeDropdownOnClickOutside.bind(this));
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    document.removeEventListener('click', this.closeDropdownOnClickOutside.bind(this));
  }

  loadNotifications() {
    if (!this.userId) {
      console.warn('⚠️ Cannot load notifications: userId is null');
      return;
    }

    console.log('📡 Loading notifications for user:', this.userId);
    
    // Charger les notifications
    this.http.get<Notification[]>(`/b2b-api/notifications/user/${this.userId}`)
      .subscribe({
        next: (data) => {
          console.log('✅ Notifications loaded:', data.length, 'notifications');
          this.notifications = data;
          this.updateUnreadCount();
        },
        error: (err) => {
          console.error('❌ Error loading notifications:', err);
          console.error('   URL:', `/b2b-api/notifications/user/${this.userId}`);
          console.error('   Status:', err.status);
          console.error('   Message:', err.message);
        }
      });
  }

  updateUnreadCount() {
    if (!this.userId) {
      console.warn('⚠️ Cannot update unread count: userId is null');
      return;
    }

    this.http.get<number>(`/b2b-api/notifications/user/${this.userId}/unread-count`)
      .subscribe({
        next: (count) => {
          console.log('📊 Unread count:', count);
          this.unreadCount = count;
        },
        error: (err) => {
          console.error('❌ Error getting unread count:', err);
        }
      });
  }

  startAutoRefresh() {
    // Rafraîchir toutes les 30 secondes
    this.refreshSubscription = interval(30000)
      .pipe(switchMap(() => {
        if (!this.userId) return [];
        return this.http.get<Notification[]>(`/b2b-api/notifications/user/${this.userId}`);
      }))
      .subscribe({
        next: (data) => {
          this.notifications = data;
          this.updateUnreadCount();
        }
      });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.loadNotifications();
    }
  }

  closeDropdownOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notifications-container')) {
      this.showDropdown = false;
    }
  }

  handleNotificationClick(notif: Notification) {
    // Marquer comme lu
    if (!notif.isRead) {
      this.markAsRead(notif.id);
    }

    // Naviguer vers le lien si disponible
    if (notif.link) {
      window.location.href = notif.link;
    }

    this.toggleDropdown();
  }

  markAsRead(notifId: number, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }

    this.http.put(`/b2b-api/notifications/${notifId}/read`, null)
      .subscribe({
        next: () => {
          const notif = this.notifications.find(n => n.id === notifId);
          if (notif) {
            notif.isRead = true;
          }
          this.updateUnreadCount();
        },
        error: (err) => console.error('Erreur marquage notification:', err)
      });
  }

  markAllAsRead() {
    if (!this.userId) return;

    this.http.put(`/b2b-api/notifications/user/${this.userId}/read-all`, null)
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
        },
        error: (err) => console.error('Erreur marquage toutes notifications:', err)
      });
  }

  deleteNotification(notifId: number, event: MouseEvent) {
    event.stopPropagation();

    if (!confirm('Supprimer cette notification ?')) return;

    this.http.delete(`/b2b-api/notifications/${notifId}`)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notifId);
          this.updateUnreadCount();
        },
        error: (err) => console.error('Erreur suppression notification:', err)
      });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'NEW_APPLICATION': 'Nouvelle candidature',
      'APPLICATION_ACCEPTED': 'Acceptée',
      'APPLICATION_REJECTED': 'Refusée',
      'NEW_CONTRACT': 'Nouveau contrat',
      'MATCHING_MISSION': 'Mission',
      'PAYMENT_RECEIVED': 'Paiement'
    };
    return labels[type] || type;
  }
}
