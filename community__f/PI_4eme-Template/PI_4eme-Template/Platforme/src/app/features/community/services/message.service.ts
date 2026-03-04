import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map } from 'rxjs';
import { CommunityBaseService } from './community-base.service';
import { Conversation, Message } from '../models/message.model';

interface BackendMessage {
  messageId: number;
  content: string;
  createdAt?: string;
  isRead?: boolean;
  senderId: number;
  receiverId: number;
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
    return this.http
      .post<BackendMessage | { message?: BackendMessage; data?: BackendMessage }>(
        `${this.communityBaseUrl}/messages/${receiverId}`,
        { content },
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
      const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
      const conversationMessages = grouped.get(otherUserId) ?? [];
      conversationMessages.push(this.mapMessage(message));
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
    return {
      id: message.messageId,
      content: message.content,
      created_at: message.createdAt ?? '',
      is_read: message.isRead ?? false,
      sender_id: message.senderId,
      receiver_id: message.receiverId
    };
  }
}
