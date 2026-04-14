import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CommunityNotification,
  CommunityNotificationRoute,
  CommunityNotificationType
} from '../models/notification.model';

type NotificationStreamState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class NotificationStreamService implements OnDestroy {
  private readonly isBrowser = typeof window !== 'undefined';
  private readonly maxStoredNotifications = 60;
  private readonly maxVisibleToasts = 4;
  private readonly toastDurationMs = 8000;
  private readonly lastSeenStoragePrefix = 'community.notifications.lastSeenAt';

  private eventSource: EventSource | null = null;
  private activeStreamUrl: string | null = null;
  private reconnectHandle: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private streamSessionId = 0;
  private readonly toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private readonly notificationsSubject = new BehaviorSubject<CommunityNotification[]>([]);
  private readonly toastNotificationsSubject = new BehaviorSubject<CommunityNotification[]>([]);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly streamStateSubject = new BehaviorSubject<NotificationStreamState>('idle');

  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly toastNotifications$ = this.toastNotificationsSubject.asObservable();
  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  readonly streamState$ = this.streamStateSubject.asObservable();

  start(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.eventSource) {
      return;
    }

    const token = this.readToken();
    if (!token) {
      this.stop('disconnected');
      return;
    }

    void this.openStream(token, false);
  }

  stop(nextState: NotificationStreamState = 'disconnected', clearStore = false): void {
    this.streamSessionId += 1;
    this.clearReconnectTimer();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.activeStreamUrl = null;

    this.streamStateSubject.next(nextState);

    if (clearStore) {
      this.notificationsSubject.next([]);
      this.toastNotificationsSubject.next([]);
      this.unreadCountSubject.next(0);
      this.toastTimers.forEach((timer) => clearTimeout(timer));
      this.toastTimers.clear();
    }
  }

  markAsRead(notificationId: string): void {
    const updated = this.notificationsSubject.value.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );

    this.notificationsSubject.next(updated);
    this.refreshUnreadCount(updated);
  }

  markAllAsRead(): void {
    const updated = this.notificationsSubject.value.map((notification) => ({
      ...notification,
      read: true
    }));

    this.notificationsSubject.next(updated);
    this.refreshUnreadCount(updated);
  }

  dismissToast(notificationId: string): void {
    const current = this.toastNotificationsSubject.value;
    const next = current.filter((notification) => notification.id !== notificationId);
    this.toastNotificationsSubject.next(next);

    const timer = this.toastTimers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      this.toastTimers.delete(notificationId);
    }
  }

  resolveRoute(notification: CommunityNotification): CommunityNotificationRoute {
    if (notification.type === 'follow' && this.isValidId(notification.relatedUserId)) {
      return { commands: ['/community/profile', notification.relatedUserId as number] };
    }

    if (notification.type === 'message') {
      if (this.isValidId(notification.relatedUserId)) {
        return { commands: ['/community/messages', notification.relatedUserId as number] };
      }

      return { commands: ['/community/messages'] };
    }

    if (notification.type === 'like') {
      if (this.isValidId(notification.postId ?? null)) {
        return {
          commands: ['/community/feed'],
          queryParams: { postId: notification.postId as number }
        };
      }

      return { commands: ['/community/feed'] };
    }

    return { commands: ['/community/feed'] };
  }

  ngOnDestroy(): void {
    this.stop();
    this.toastTimers.forEach((timer) => clearTimeout(timer));
    this.toastTimers.clear();
  }

  private async openStream(token: string, isReconnect: boolean): Promise<void> {
    this.streamSessionId += 1;
    const sessionId = this.streamSessionId;
    this.streamStateSubject.next(isReconnect ? 'reconnecting' : 'connecting');

    const streamUrl = await this.resolveStreamUrl(token, sessionId);
    if (!streamUrl || !this.isCurrentSession(sessionId)) {
      return;
    }

    let source: EventSource;
    try {
      source = new EventSource(streamUrl);
    } catch {
      this.scheduleReconnect(token, sessionId);
      return;
    }

    this.eventSource = source;

    source.onopen = () => {
      if (!this.isCurrentSession(sessionId)) {
        source.close();
        return;
      }

      this.reconnectAttempt = 0;
      this.streamStateSubject.next('connected');
    };

    source.onmessage = (event) => {
      if (!this.isCurrentSession(sessionId)) {
        return;
      }

      this.handleIncomingEventData(event.data);
    };

    source.addEventListener('notification', (event: MessageEvent<string>) => {
      if (!this.isCurrentSession(sessionId)) {
        return;
      }

      this.handleIncomingEventData(event.data);
    });

    source.onerror = () => {
      if (!this.isCurrentSession(sessionId)) {
        return;
      }

      source.close();
      this.eventSource = null;
      this.activeStreamUrl = null;
      this.streamStateSubject.next('reconnecting');
      this.scheduleReconnect(token, sessionId);
    };
  }

  private scheduleReconnect(token: string, sessionId: number): void {
    if (!this.isCurrentSession(sessionId)) {
      return;
    }

    this.clearReconnectTimer();
    this.reconnectAttempt += 1;
    const delay = Math.min(20000, 1500 * this.reconnectAttempt);

    this.reconnectHandle = setTimeout(() => {
      if (!this.isCurrentSession(sessionId)) {
        return;
      }

      void this.openStream(token, true);
    }, delay);
  }

  private async preflightStreamStatus(url: string): Promise<number | null> {
    if (!this.isBrowser || typeof window.fetch === 'undefined') {
      return null;
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 1800);

    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          Accept: 'text/event-stream'
        }
      });

      try {
        await response.body?.cancel();
      } catch {
        // ignore
      }

      return response.status;
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectHandle) {
      return;
    }

    clearTimeout(this.reconnectHandle);
    this.reconnectHandle = null;
  }

  private isCurrentSession(sessionId: number): boolean {
    return this.streamSessionId === sessionId;
  }

  private handleIncomingEventData(raw: string): void {
    const parsed = this.parseRecord(raw);
    if (!parsed) {
      return;
    }

    const mapped = this.mapNotification(parsed);
    if (!mapped) {
      return;
    }

    this.ingestNotification(mapped, true);
  }

  private ingestNotification(notification: CommunityNotification, showToast: boolean): void {
    const existing = this.notificationsSubject.value;
    const duplicate = existing.some((item) => this.isDuplicateNotification(item, notification));
    if (duplicate) {
      this.persistLastSeen(notification.createdAt);
      return;
    }

    const nextNotifications = [notification, ...existing].slice(0, this.maxStoredNotifications);
    this.notificationsSubject.next(nextNotifications);
    this.refreshUnreadCount(nextNotifications);
    this.persistLastSeen(notification.createdAt);

    if (showToast) {
      this.pushToast(notification);
    }
  }

  private mapNotification(record: Record<string, unknown>): CommunityNotification | null {
    const payload = this.extractPayload(record, ['notification', 'data', 'payload']);

    const type = this.normalizeType(payload['type']);
    const text = this.toText(payload['text'] ?? payload['message'] ?? payload['description']);
    if (!type || !text) {
      return null;
    }

    const relatedUserId = this.toNumber(
      payload['relatedUserId'] ?? payload['related_user_id'] ?? payload['userId'] ?? payload['fromUserId']
    );
    const postId = this.toNumber(payload['postId'] ?? payload['post_id']);
    const messageId = this.toNumber(payload['messageId'] ?? payload['message_id']);
    const createdAt = this.toText(payload['createdAt'] ?? payload['created_at']) ?? new Date().toISOString();
    const id =
      this.toText(payload['id'] ?? payload['notificationId'] ?? payload['notification_id']) ??
      this.generateNotificationId(type, createdAt, relatedUserId, postId, messageId);

    return {
      id,
      type,
      text,
      relatedUserId,
      postId,
      messageId,
      createdAt,
      read: false
    };
  }

  private extractPayload(record: Record<string, unknown>, keys: string[]): Record<string, unknown> {
    for (const key of keys) {
      const candidate = record[key];
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        return candidate as Record<string, unknown>;
      }
    }

    return record;
  }

  private pushToast(notification: CommunityNotification): void {
    const current = this.toastNotificationsSubject.value;
    const next = [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, this.maxVisibleToasts);
    this.toastNotificationsSubject.next(next);

    const existingTimer = this.toastTimers.get(notification.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.dismissToast(notification.id);
    }, this.toastDurationMs);

    this.toastTimers.set(notification.id, timer);
  }

  private refreshUnreadCount(notifications: CommunityNotification[]): void {
    const unread = notifications.filter((notification) => !notification.read).length;
    this.unreadCountSubject.next(unread);
  }

  private isDuplicateNotification(existing: CommunityNotification, incoming: CommunityNotification): boolean {
    if (existing.id === incoming.id) {
      return true;
    }

    if (
      existing.type === incoming.type &&
      existing.text === incoming.text &&
      existing.relatedUserId === incoming.relatedUserId &&
      (existing.postId ?? null) === (incoming.postId ?? null) &&
      (existing.messageId ?? null) === (incoming.messageId ?? null)
    ) {
      const left = Date.parse(existing.createdAt || '');
      const right = Date.parse(incoming.createdAt || '');
      if (Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= 2000) {
        return true;
      }
    }

    return false;
  }

  private parseRecord(raw: string): Record<string, unknown> | null {
    if (!raw || raw.trim().length === 0) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }

    return null;
  }

  private normalizeType(value: unknown): CommunityNotificationType | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === 'like' || normalized === 'follow' || normalized === 'message') {
      return normalized;
    }

    return null;
  }

  private toText(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  }

  private isValidId(value: number | null): boolean {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
  }

  private readToken(): string | null {
    if (!this.isBrowser || typeof window.localStorage === 'undefined') {
      return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const normalized = token.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async resolveStreamUrl(token: string, sessionId: number): Promise<string | null> {
    if (this.activeStreamUrl) {
      return this.activeStreamUrl;
    }

    const candidates = this.buildStreamCandidateUrls(token);

    for (const candidate of candidates) {
      const status = await this.preflightStreamStatus(candidate);
      if (!this.isCurrentSession(sessionId)) {
        return null;
      }

      if (status === null) {
        continue;
      }

      if (status === 404) {
        continue;
      }

      if (status === 401 || status === 403) {
        this.streamStateSubject.next('disconnected');
        return null;
      }

      if (status >= 500) {
        continue;
      }

      this.activeStreamUrl = candidate;
      return candidate;
    }

    this.streamStateSubject.next('disconnected');
    return null;
  }

  private buildStreamCandidateUrls(token: string): string[] {
    const candidates: string[] = [];

    this.resolveApiBaseUrls().forEach((baseUrl) => {
      candidates.push(this.buildCommunityStreamUrl(baseUrl, token));

      if (!this.isLocalGatewayBase(baseUrl)) {
        candidates.push(this.buildDefaultStreamUrl(baseUrl, token));
      }
    });

    return Array.from(new Set(candidates));
  }

  private isLocalGatewayBase(baseUrl: string): boolean {
    return /localhost:8081(\/|$)/i.test(baseUrl) || /127\.0\.0\.1:8081(\/|$)/i.test(baseUrl);
  }

  private buildDefaultStreamUrl(base: string, token: string): string {
    const endpoint = base.endsWith('/api') ? `${base}/notifications/stream` : `${base}/api/notifications/stream`;
    return this.appendStreamParams(endpoint, token);
  }

  private buildCommunityStreamUrl(base: string, token: string): string {
    const endpoint = base.endsWith('/api')
      ? `${base}/community/notifications/stream`
      : `${base}/api/community/notifications/stream`;
    return this.appendStreamParams(endpoint, token);
  }

  private appendStreamParams(endpoint: string, token: string): string {
    const params = new URLSearchParams();
    params.set('token', token);

    const since = this.readLastSeenAt();
    if (since) {
      params.set('since', since);
    }

    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}${params.toString()}`;
  }

  private resolveApiBaseUrls(): string[] {
    const baseUrls: string[] = [];

    const communityApiUrl = this.toText((environment as Record<string, unknown>)['communityApiUrl']);
    const apiUrl = this.toText((environment as Record<string, unknown>)['apiUrl']);
    const normalizedCommunityApiUrl = communityApiUrl?.replace(/\/+$/, '');
    const normalizedApiUrl = apiUrl?.replace(/\/+$/, '');

    if (normalizedCommunityApiUrl) {
      baseUrls.push(normalizedCommunityApiUrl);
    }

    if (normalizedApiUrl) {
      baseUrls.push(normalizedApiUrl);
    }

    if (baseUrls.length === 0) {
      baseUrls.push('http://localhost:8081');
    }

    return Array.from(new Set(baseUrls));
  }

  private generateNotificationId(
    type: CommunityNotificationType,
    createdAt: string,
    relatedUserId: number | null,
    postId: number | null,
    messageId: number | null
  ): string {
    const seed = `${type}-${createdAt}-${relatedUserId ?? 0}-${postId ?? 0}-${messageId ?? 0}-${Math.random()}`;
    return seed.replace(/\s+/g, '-');
  }

  private persistLastSeen(createdAt: string): void {
    if (!this.isBrowser || typeof window.localStorage === 'undefined') {
      return;
    }

    const createdAtMs = Date.parse(createdAt || '');
    if (!Number.isFinite(createdAtMs)) {
      return;
    }

    const currentLastSeen = this.readLastSeenAt();
    const currentLastSeenMs = currentLastSeen ? Date.parse(currentLastSeen) : Number.NaN;
    if (Number.isFinite(currentLastSeenMs) && currentLastSeenMs >= createdAtMs) {
      return;
    }

    localStorage.setItem(this.lastSeenStorageKey(), new Date(createdAtMs).toISOString());
  }

  private readLastSeenAt(): string | null {
    if (!this.isBrowser || typeof window.localStorage === 'undefined') {
      return null;
    }

    const value = localStorage.getItem(this.lastSeenStorageKey());
    if (!value) {
      return null;
    }

    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    const parsedMs = Date.parse(normalized);
    if (!Number.isFinite(parsedMs)) {
      return null;
    }

    return new Date(parsedMs).toISOString();
  }

  private lastSeenStorageKey(): string {
    return `${this.lastSeenStoragePrefix}.${this.currentUserScope()}`;
  }

  private currentUserScope(): string {
    if (!this.isBrowser || typeof window.localStorage === 'undefined') {
      return 'guest';
    }

    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      return 'guest';
    }

    try {
      const parsed = JSON.parse(rawUser) as Record<string, unknown>;
      const candidate = parsed['idUser'] ?? parsed['userId'] ?? parsed['id'];

      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return String(candidate);
      }

      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    } catch {
      return 'guest';
    }

    return 'guest';
  }
}
