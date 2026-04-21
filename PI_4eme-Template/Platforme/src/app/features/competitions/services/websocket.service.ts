import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  messageId?: number;
  competitionId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  messageText: string;
  messageType?: string;
  recipientType?: string; // GENERAL, TEAM, PRIVATE
  recipientId?: number; // userId for private messages
  teamId?: number; // teamId for team messages
  sentAt?: string;
  isRead?: boolean;
}

export interface ParticipantUpdate {
  type: 'USER_JOINED' | 'USER_LEFT';
  participant?: any;
  userId?: number;
  onlineUsers: any[];
  onlineCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  private participants = new BehaviorSubject<any[]>([]);

  connected$ = this.connected.asObservable();
  messages$ = this.messages.asObservable();
  participants$ = this.participants.asObservable();

  connect(competitionId: number, userId: number, userName: string, userRole: string): void {
    if (this.client?.connected) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket connected');
        this.connected.next(true);

        // Subscribe to general messages
        this.client!.subscribe(`/topic/chat/${competitionId}`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          const currentMessages = this.messages.value;
          this.messages.next([...currentMessages, chatMessage]);
        });

        // Subscribe to team messages
        this.client!.subscribe(`/topic/chat/${competitionId}/team/*`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          const currentMessages = this.messages.value;
          this.messages.next([...currentMessages, chatMessage]);
        });

        // Subscribe to private messages for this user
        this.client!.subscribe(`/topic/chat/${competitionId}/private/${userId}`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          const currentMessages = this.messages.value;
          this.messages.next([...currentMessages, chatMessage]);
        });

        // Subscribe to participants updates
        this.client!.subscribe(`/topic/chat/${competitionId}/participants`, (message: IMessage) => {
          const update: ParticipantUpdate = JSON.parse(message.body);
          this.participants.next(update.onlineUsers);
        });

        // Send join notification
        this.client!.publish({
          destination: `/app/chat/${competitionId}/join`,
          body: JSON.stringify({ userId, userName, userRole })
        });
      },
      onDisconnect: () => {
        console.log('❌ WebSocket disconnected');
        this.connected.next(false);
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
      }
    });

    this.client.activate();
  }

  sendMessage(competitionId: number, message: ChatMessage): void {
    if (this.client?.connected) {
      this.client.publish({
        destination: `/app/chat/${competitionId}/send`,
        body: JSON.stringify(message)
      });
    }
  }

  disconnect(competitionId: number, userId: number): void {
    if (this.client?.connected) {
      this.client.publish({
        destination: `/app/chat/${competitionId}/leave`,
        body: JSON.stringify({ userId })
      });
      this.client.deactivate();
      this.client = null;
      this.connected.next(false);
      this.messages.next([]);
      this.participants.next([]);
    }
  }
}
