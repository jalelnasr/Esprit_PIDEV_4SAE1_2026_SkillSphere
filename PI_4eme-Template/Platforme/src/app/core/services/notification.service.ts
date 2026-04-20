import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification, NotificationCount } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.competitionsApiUrl}/notifications`;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer toutes les notifications
  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(notifications => this.notificationsSubject.next(notifications))
    );
  }

  // Récupérer les notifications non lues
  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  // Compter les notifications non lues
  getUnreadCount(userId: number): Observable<NotificationCount> {
    return this.http.get<NotificationCount>(`${this.apiUrl}/user/${userId}/unread/count`).pipe(
      tap(result => this.unreadCountSubject.next(result.count))
    );
  }

  // Marquer comme lue
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Marquer toutes comme lues
  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  // Supprimer une notification
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  // Envoyer une annonce (FORMATEUR)
  sendAnnouncement(competitionId: number | null, title: string, message: string, userIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/announcement`, {
      competitionId,
      title,
      message,
      userIds
    });
  }

  // Ajouter une notification en temps réel (appelé par WebSocket)
  addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }
}
