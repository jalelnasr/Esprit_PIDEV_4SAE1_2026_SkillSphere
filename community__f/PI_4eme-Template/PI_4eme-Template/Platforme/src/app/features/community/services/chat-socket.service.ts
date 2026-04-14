import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, IStompSocket, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Message } from '../models/message.model';

type SocketConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface LiveChatOutgoingMessage {
  receiverId: number;
  content: string;
  conversationId?: number | null;
  clientMessageId?: string;
}

export interface LiveTypingEvent {
  fromUserId: number;
  toUserId: number;
  isTyping: boolean;
  conversationId?: number | null;
}

type SockJsCtor = new (
  url: string,
  _protocols?: string | string[] | null,
  _options?: Record<string, unknown>
) => IStompSocket;

@Injectable({ providedIn: 'root' })
export class ChatSocketService implements OnDestroy {
  private readonly isBrowser = typeof window !== 'undefined';

  private client: Client | null = null;
  private stompSubscriptions: StompSubscription[] = [];
  private connectedUserId: number | null = null;
  private connectAttemptId = 0;
  private syntheticMessageId = -1;

  private readonly connectionStateSubject = new BehaviorSubject<SocketConnectionState>('disconnected');
  private readonly incomingMessagesSubject = new Subject<Message>();
  private readonly typingEventsSubject = new Subject<LiveTypingEvent>();

  readonly connectionState$ = this.connectionStateSubject.asObservable();
  readonly incomingMessages$ = this.incomingMessagesSubject.asObservable();
  readonly typingEvents$ = this.typingEventsSubject.asObservable();

  async connect(currentUserId: number): Promise<void> {
    if (!this.isBrowser || !Number.isFinite(currentUserId) || currentUserId <= 0) {
      return;
    }

    if (this.client?.active && this.connectedUserId === currentUserId) {
      return;
    }

    this.disconnect();
    this.connectedUserId = currentUserId;
    this.connectionStateSubject.next('connecting');

    const attemptId = ++this.connectAttemptId;
    let wsFactory: () => IStompSocket;
    try {
      wsFactory = await this.buildSockJsFactory();
    } catch {
      this.connectionStateSubject.next('disconnected');
      return;
    }

    if (attemptId !== this.connectAttemptId) {
      return;
    }

    const client = new Client({
      webSocketFactory: wsFactory,
      connectHeaders: this.buildConnectHeaders(currentUserId),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000
    });

    client.onConnect = () => {
      this.connectionStateSubject.next('connected');
      this.subscribeToLiveQueues(client);
    };

    client.onWebSocketClose = () => {
      this.clearStompSubscriptions();

      if (client.active && this.connectedUserId !== null) {
        this.connectionStateSubject.next('connecting');
        return;
      }

      this.connectionStateSubject.next('disconnected');
    };

    client.onStompError = () => {
      this.connectionStateSubject.next('disconnected');
    };

    this.client = client;
    client.activate();
  }

  disconnect(): void {
    this.connectAttemptId += 1;
    this.clearStompSubscriptions();

    if (this.client) {
      const activeClient = this.client;
      this.client = null;
      if (activeClient.active) {
        void activeClient.deactivate();
      }
    }

    this.connectedUserId = null;
    this.connectionStateSubject.next('disconnected');
  }

  sendMessage(payload: LiveChatOutgoingMessage): boolean {
    const client = this.client;
    if (!client || !client.connected) {
      return false;
    }

    const body = {
      receiverId: payload.receiverId,
      content: payload.content,
      conversationId: payload.conversationId ?? null,
      clientMessageId: payload.clientMessageId ?? null
    };

    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(body)
    });

    return true;
  }

  sendTyping(event: LiveTypingEvent): boolean {
    const client = this.client;
    if (!client || !client.connected) {
      return false;
    }

    client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        fromUserId: event.fromUserId,
        toUserId: event.toUserId,
        isTyping: event.isTyping,
        conversationId: event.conversationId ?? null
      })
    });

    return true;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private async buildSockJsFactory(): Promise<() => IStompSocket> {
    const sockJsModule = await import('sockjs-client');
    const SockJS = (sockJsModule.default ?? sockJsModule) as SockJsCtor;
    const endpoint = this.resolveSockJsEndpoint();

    return () => new SockJS(endpoint);
  }

  private resolveSockJsEndpoint(): string {
    const base = this.resolveWebSocketBaseUrl().replace(/\/+$/, '');
    const withPath = /\/ws$/i.test(base) ? base : `${base}/ws`;
    return withPath.replace(/^ws:/i, 'http:').replace(/^wss:/i, 'https:');
  }

  private resolveWebSocketBaseUrl(): string {
    const value = this.stringValue((environment as Record<string, unknown>)['wsUrl']);
    if (value) {
      return value;
    }

    const apiUrl = this.stringValue((environment as Record<string, unknown>)['apiUrl']);
    if (apiUrl) {
      return apiUrl;
    }

    return 'http://localhost:8081';
  }

  private buildConnectHeaders(currentUserId: number): Record<string, string> {
    const headers: Record<string, string> = {
      userId: String(currentUserId),
      'x-user-id': String(currentUserId)
    };

    const token = this.readToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private readToken(): string | null {
    if (!this.isBrowser || typeof window.localStorage === 'undefined') {
      return null;
    }

    const token = localStorage.getItem('token');
    return token && token.trim().length > 0 ? token : null;
  }

  private subscribeToLiveQueues(client: Client): void {
    this.clearStompSubscriptions();

    this.stompSubscriptions.push(
      client.subscribe('/user/queue/messages', (frame) => {
        const mapped = this.parseMessageFrame(frame);
        if (mapped) {
          this.incomingMessagesSubject.next(mapped);
        }
      })
    );

    this.stompSubscriptions.push(
      client.subscribe('/user/queue/typing', (frame) => {
        const mapped = this.parseTypingFrame(frame);
        if (mapped) {
          this.typingEventsSubject.next(mapped);
        }
      })
    );
  }

  private clearStompSubscriptions(): void {
    this.stompSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.stompSubscriptions = [];
  }

  private parseMessageFrame(frame: IMessage): Message | null {
    const data = this.parseFrameBody(frame.body);
    if (!data) {
      return null;
    }

    const payload = this.extractNestedPayload(data, ['message', 'data']);

    const senderId = this.toNumber(payload['senderId'] ?? payload['sender_id']);
    const receiverId = this.toNumber(payload['receiverId'] ?? payload['receiver_id']);
    const content = this.stringValue(payload['content']);

    if (senderId === null || receiverId === null || !content) {
      return null;
    }

    const messageId = this.toNumber(payload['messageId'] ?? payload['message_id'] ?? payload['id']) ?? this.syntheticMessageId--;
    const createdAt = this.stringValue(payload['createdAt'] ?? payload['created_at']) ?? new Date().toISOString();
    const isRead = this.toBoolean(payload['isRead'] ?? payload['is_read']) ?? false;
    const clientId = this.stringValue(payload['clientMessageId'] ?? payload['client_message_id']);

    return {
      id: messageId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      created_at: createdAt,
      is_read: isRead,
      client_id: clientId ?? undefined,
      delivery_status: 'sent'
    };
  }

  private parseTypingFrame(frame: IMessage): LiveTypingEvent | null {
    const data = this.parseFrameBody(frame.body);
    if (!data) {
      return null;
    }

    const payload = this.extractNestedPayload(data, ['typing', 'data']);
    const fromUserId = this.toNumber(payload['fromUserId'] ?? payload['senderId'] ?? payload['from_user_id']);
    const toUserId = this.toNumber(payload['toUserId'] ?? payload['receiverId'] ?? payload['to_user_id']);
    const isTyping = this.toBoolean(payload['isTyping'] ?? payload['typing']);

    if (fromUserId === null || toUserId === null || isTyping === null) {
      return null;
    }

    const conversationId = this.toNumber(payload['conversationId'] ?? payload['conversation_id']);

    return {
      fromUserId,
      toUserId,
      isTyping,
      conversationId
    };
  }

  private parseFrameBody(body: string): Record<string, unknown> | null {
    if (!body || body.trim().length === 0) {
      return null;
    }

    try {
      const parsed = JSON.parse(body) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }

    return null;
  }

  private extractNestedPayload(record: Record<string, unknown>, keys: string[]): Record<string, unknown> {
    for (const key of keys) {
      const nested = record[key];
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        return nested as Record<string, unknown>;
      }
    }

    return record;
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

  private toBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        return true;
      }

      if (value.toLowerCase() === 'false') {
        return false;
      }
    }

    return null;
  }

  private stringValue(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
