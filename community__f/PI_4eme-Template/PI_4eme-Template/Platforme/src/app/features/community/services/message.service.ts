import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map } from 'rxjs';
import { CommunityBaseService } from './community-base.service';
import { Conversation, Message } from '../models/message.model';

interface BackendMessage {
  messageId?: number;
  message_id?: number;
  id?: number;
  content?: string;
  createdAt?: string;
  created_at?: string;
  isRead?: boolean;
  is_read?: boolean;
  senderId?: number;
  sender_id?: number;
  receiverId?: number;
  receiver_id?: number;
}

@Injectable({ providedIn: 'root' })
export class MessageService extends CommunityBaseService {
  constructor(private http: HttpClient) {
    super();
  }

  getConversations(): Observable<Conversation[]> {
    const currentUserId = this.currentUserId();

    return forkJoin({
      sent: this.http
        .get<BackendMessage[] | { data?: BackendMessage[]; items?: BackendMessage[]; content?: BackendMessage[] }>(
          `${this.communityBaseUrl}/messages/sent/${currentUserId}`,
          this.authOptions()
        )
        .pipe(map((response) => this.extractList<BackendMessage>(response))),
      received: this.http
        .get<BackendMessage[] | { data?: BackendMessage[]; items?: BackendMessage[]; content?: BackendMessage[] }>(
          `${this.communityBaseUrl}/messages/received/${currentUserId}`,
          this.authOptions()
        )
        .pipe(map((response) => this.extractList<BackendMessage>(response)))
    }).pipe(
      map(({ sent, received }) => this.buildConversations(currentUserId, [...sent, ...received])),
      catchError(this.handleError('Get conversations'))
    );
  }

  getConversation(otherUserId: number): Observable<Message[]> {
    return this.http
      .get<BackendMessage[] | { data?: BackendMessage[]; items?: BackendMessage[]; content?: BackendMessage[] }>(
        `${this.communityBaseUrl}/messages/conversation/${otherUserId}`,
        this.authOptions()
      )
      .pipe(
        map((response) =>
          this.extractList<BackendMessage>(response).map((message) => this.mapMessage(message))
        ),
        catchError(this.handleError('Get conversation'))
      );
  }

  sendMessage(receiverId: number, content: string): Observable<Message> {
    const senderId = this.currentUserId();

    return this.http
      .post<BackendMessage | { message?: BackendMessage; data?: BackendMessage }>(
        `${this.communityBaseUrl}/messages/${receiverId}`,
        {
          content,
          sender_id: senderId,
          receiver_id: receiverId,
          senderId,
          receiverId
        },
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapMessage(this.extractEntity<BackendMessage>(response, ['message', 'data']))),
        catchError(this.handleError('Send message'))
      );
  }

  private buildConversations(currentUserId: number, messages: BackendMessage[]): Conversation[] {
    const grouped = new Map<number, Message[]>();

    for (const message of messages) {
      const mapped = this.mapMessage(message);
      const otherUserId = mapped.sender_id === currentUserId ? mapped.receiver_id : mapped.sender_id;

      if (!Number.isFinite(otherUserId) || otherUserId <= 0 || otherUserId === currentUserId) {
        continue;
      }

      const conversationMessages = grouped.get(otherUserId) ?? [];
      conversationMessages.push(mapped);
      grouped.set(otherUserId, conversationMessages);
    }

    const conversations: Conversation[] = [];

    for (const [otherUserId, conversationMessages] of grouped.entries()) {
      const sortedMessages = [...conversationMessages].sort((a, b) =>
        a.created_at.localeCompare(b.created_at)
      );

      const lastMessage = sortedMessages[sortedMessages.length - 1];
      const unreadCount = sortedMessages.filter(
        (message) => message.receiver_id === currentUserId && message.is_read === false
      ).length;

      conversations.push({
        other_user_id: otherUserId,
        other_user_name: `User #${otherUserId}`,
        other_user_avatar: `U${otherUserId}`,
        last_message: lastMessage?.content ?? '',
        last_message_time: lastMessage?.created_at ?? '',
        unread_count: unreadCount,
        messages: sortedMessages
      });
    }

    return conversations.sort((a, b) => (b.last_message_time || '').localeCompare(a.last_message_time || ''));
  }

  private mapMessage(message: BackendMessage): Message {
    const id =
      this.tryParseNumber(message.messageId) ??
      this.tryParseNumber(message.message_id) ??
      this.tryParseNumber(message.id) ??
      -Math.floor(Date.now() + Math.random() * 1000);

    const senderId = this.tryParseNumber(message.senderId) ?? this.tryParseNumber(message.sender_id) ?? 0;
    const receiverId = this.tryParseNumber(message.receiverId) ?? this.tryParseNumber(message.receiver_id) ?? 0;
    const createdAt =
      this.tryParseString(message.createdAt) ??
      this.tryParseString(message.created_at) ??
      new Date().toISOString();

    return {
      id,
      content: this.tryParseString(message.content) ?? '',
      created_at: createdAt,
      is_read: this.tryParseBoolean(message.isRead) ?? this.tryParseBoolean(message.is_read) ?? false,
      sender_id: senderId,
      receiver_id: receiverId
    };
  }

  private tryParseNumber(value: unknown): number | null {
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

  private tryParseString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private tryParseBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') {
        return true;
      }

      if (normalized === 'false') {
        return false;
      }
    }

    return null;
  }
}
