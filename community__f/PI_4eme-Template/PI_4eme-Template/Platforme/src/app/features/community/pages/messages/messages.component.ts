import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { ToastService } from '@core/services';
import { Conversation, Message } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import {
  CommunityUserDirectoryService,
  CommunityUserDisplay
} from '../../services/community-user-directory.service';
import { FollowRelationship, FollowService } from '../../services/follow.service';

interface ConversationView {
  id: number;
  other_user: {
    id: number;
    name: string;
    avatar: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: Message[];
  isFollowSuggestion?: boolean;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;

  selectedConversation: ConversationView | null = null;
  conversations: ConversationView[] = [];
  followedUsers: ConversationView[] = [];
  isViewingSpecificUser = false;
  isLoadingConversation = false;
  isLoadingFollowedUsers = false;
  errorMessage = '';

  private readonly currentUserId: number | null;

  readonly searchControl = this.fb.nonNullable.control('');
  readonly messageForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.pattern(/\S/)]]
  });

  private routeSubscription: Subscription | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly followService: FollowService,
    private readonly userDirectory: CommunityUserDirectoryService,
    private readonly toast: ToastService
  ) {
    this.currentUserId = this.followService.getCurrentUserIdSafe();
  }

  ngOnInit(): void {
    this.loadConversations();

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const rawUserId = params.get('userId');
      if (!rawUserId) {
        this.isViewingSpecificUser = false;
        return;
      }

      this.startConversationWithSpecificUser(Number(rawUserId));
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  get filteredConversations(): ConversationView[] {
    const allConversations = this.mergedConversations();
    const query = this.searchControl.value.trim().toLowerCase();
    if (!query) {
      return allConversations;
    }

    return allConversations.filter((conversation) =>
      conversation.other_user.name.toLowerCase().includes(query)
    );
  }

  get conversationSearchSuggestions(): string[] {
    const suggestions = new Set<string>();
    this.mergedConversations().forEach((conversation) => {
      const name = conversation.other_user.name.trim();
      if (name) {
        suggestions.add(name);
      }
    });

    return Array.from(suggestions).slice(0, 12);
  }

  loadConversations(): void {
    this.messageService.getConversations().subscribe({
      next: (conversations) => {
        this.errorMessage = '';
        this.conversations = this.sortConversationsByLatest(
          conversations.map((conversation) => this.mapConversation(conversation))
        );
        this.hydrateConversationUsers(this.conversations);
        this.loadFollowedUsers();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.toast.error('Failed to load conversations');
      }
    });
  }

  selectConversation(conversation: ConversationView): void {
    const selected = this.upsertConversation(conversation);
    selected.isFollowSuggestion = false;
    this.selectedConversation = selected;
    selected.unread_count = 0;
    this.loadConversationMessages(selected.other_user.id);
  }

  startConversationWithSpecificUser(userId: number): void {
    if (!Number.isFinite(userId) || userId <= 0) {
      return;
    }

    this.isViewingSpecificUser = true;

    const existing = this.mergedConversations().find((conversation) => conversation.other_user.id === userId);
    if (existing) {
      this.hydrateConversationUsers([existing]);
      this.selectConversation(existing);
      return;
    }

    const placeholder = this.createPlaceholderConversation(userId);
    this.conversations = this.sortConversationsByLatest([placeholder, ...this.conversations]);
    this.hydrateConversationUsers([placeholder]);
    this.selectConversation(placeholder);
  }

  sendMessage(event?: Event): void {
    if (event instanceof KeyboardEvent && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }

    if (!this.selectedConversation) {
      return;
    }

    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const content = this.messageForm.controls.content.value.trim();
    const receiverId = this.selectedConversation.other_user.id;

    this.messageService.sendMessage(receiverId, content).subscribe({
      next: (message) => {
        this.errorMessage = '';
        const mappedMessage = this.mapMessage(message);
        this.hydrateMessageUsers([mappedMessage]);

        if (!this.selectedConversation) {
          return;
        }

        const alreadyExists = this.selectedConversation.messages.some((item) => item.id === mappedMessage.id);
        if (!alreadyExists) {
          this.selectedConversation.messages = [...this.selectedConversation.messages, mappedMessage];
        }

        this.selectedConversation.messages = [...this.selectedConversation.messages].sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        );
        this.selectedConversation.last_message = mappedMessage.content;
        this.selectedConversation.last_message_time = mappedMessage.created_at;
        this.selectedConversation.isFollowSuggestion = false;

        this.upsertConversation(this.selectedConversation);
        this.conversations = this.sortConversationsByLatest(this.conversations);
        this.followedUsers = this.followedUsers.filter(
          (conversation) => conversation.other_user.id !== this.selectedConversation?.other_user.id
        );

        this.messageForm.reset({ content: '' });
        this.scrollToLatest();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.toast.error('Failed to send message');
      }
    });
  }

  isOwnMessage(message: Message): boolean {
    if (!this.selectedConversation) {
      return false;
    }

    return message.sender_id !== this.selectedConversation.other_user.id;
  }

  messageAvatar(message: Message): string {
    if (this.isOwnMessage(message)) {
      return 'ME';
    }

    return this.selectedConversation?.other_user.avatar ?? 'U';
  }

  goBack(): void {
    this.router.navigate(['/community/feed']);
  }

  backToAllMessages(): void {
    this.isViewingSpecificUser = false;
    this.router.navigate(['/community/messages']);
  }

  private loadFollowedUsers(): void {
    if (this.currentUserId === null) {
      this.followedUsers = [];
      return;
    }

    this.isLoadingFollowedUsers = true;

    this.followService
      .getFollowing(this.currentUserId)
      .pipe(catchError(() => of<FollowRelationship[]>([])))
      .subscribe({
        next: (relationships) => {
          const existingIds = new Set(this.conversations.map((conversation) => conversation.other_user.id));
          const followedIds = Array.from(
            new Set(
              relationships
                .map((relationship) => relationship.followingId)
                .filter((userId) => Number.isFinite(userId) && userId > 0 && userId !== this.currentUserId)
            )
          );

          this.followedUsers = followedIds
            .filter((userId) => !existingIds.has(userId))
            .map((userId) => this.createFollowSuggestionConversation(userId));

          this.hydrateConversationUsers(this.followedUsers);
        },
        complete: () => {
          this.isLoadingFollowedUsers = false;
        }
      });
  }

  private loadConversationMessages(otherUserId: number): void {
    this.isLoadingConversation = true;

    this.messageService.getConversation(otherUserId).subscribe({
      next: (messages) => {
        this.errorMessage = '';
        const conversation = this.conversations.find((item) => item.other_user.id === otherUserId);
        if (!conversation) {
          return;
        }

        const sorted = [...messages.map((message) => this.mapMessage(message))].sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        );

        conversation.messages = this.uniqueById(sorted);
        this.hydrateMessageUsers(conversation.messages);

        if (conversation.messages.length > 0) {
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          conversation.last_message = lastMessage.content;
          conversation.last_message_time = lastMessage.created_at;
        }

        if (this.selectedConversation?.other_user.id === otherUserId) {
          this.selectedConversation = conversation;
          this.scrollToLatest();
        }
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.toast.error('Failed to load conversation history');
      },
      complete: () => {
        this.isLoadingConversation = false;
      }
    });
  }

  private mapConversation(conversation: Conversation): ConversationView {
    const otherUserId = conversation.other_user_id;
    const otherUserName = this.normalizeDisplayName(conversation.other_user_name, otherUserId);

    return {
      id: otherUserId,
      other_user: {
        id: otherUserId,
        name: otherUserName,
        avatar: this.initials(otherUserName, otherUserId)
      },
      last_message: conversation.last_message || 'No messages yet',
      last_message_time: conversation.last_message_time || '',
      unread_count: conversation.unread_count ?? 0,
      messages: Array.isArray(conversation.messages)
        ? conversation.messages.map((message) => this.mapMessage(message))
        : [],
      isFollowSuggestion: false
    };
  }

  private mapMessage(message: Message): Message {
    return {
      ...message,
      created_at: message.created_at || 'now',
      sender_name: message.sender_name || `User #${message.sender_id}`,
      receiver_name: message.receiver_name || `User #${message.receiver_id}`,
      sender_avatar: message.sender_avatar || this.initials(message.sender_name, message.sender_id),
      receiver_avatar: message.receiver_avatar || this.initials(message.receiver_name, message.receiver_id)
    };
  }

  private createPlaceholderConversation(userId: number): ConversationView {
    const name = `User #${userId}`;

    return {
      id: userId,
      other_user: {
        id: userId,
        name,
        avatar: this.initials(name, userId)
      },
      last_message: 'Loading conversation...',
      last_message_time: '',
      unread_count: 0,
      messages: [],
      isFollowSuggestion: false
    };
  }

  private createFollowSuggestionConversation(userId: number): ConversationView {
    const name = `User #${userId}`;

    return {
      id: userId,
      other_user: {
        id: userId,
        name,
        avatar: this.initials(name, userId)
      },
      last_message: 'Start a conversation',
      last_message_time: '',
      unread_count: 0,
      messages: [],
      isFollowSuggestion: true
    };
  }

  private mergedConversations(): ConversationView[] {
    const merged = new Map<number, ConversationView>();

    this.conversations.forEach((conversation) => {
      merged.set(conversation.other_user.id, conversation);
    });

    this.followedUsers.forEach((conversation) => {
      if (!merged.has(conversation.other_user.id)) {
        merged.set(conversation.other_user.id, conversation);
      }
    });

    return this.sortConversationsByLatest(Array.from(merged.values()));
  }

  private upsertConversation(conversation: ConversationView): ConversationView {
    const existingIndex = this.conversations.findIndex((item) => item.other_user.id === conversation.other_user.id);
    if (existingIndex >= 0) {
      this.conversations[existingIndex] = {
        ...this.conversations[existingIndex],
        ...conversation,
        isFollowSuggestion: false
      };

      return this.conversations[existingIndex];
    }

    const inserted: ConversationView = {
      ...conversation,
      isFollowSuggestion: false
    };

    this.conversations = [inserted, ...this.conversations];
    this.followedUsers = this.followedUsers.filter((item) => item.other_user.id !== inserted.other_user.id);
    return inserted;
  }

  private sortConversationsByLatest(conversations: ConversationView[]): ConversationView[] {
    return [...conversations].sort((left, right) => {
      const leftTime = this.createdAtTimestamp(left.last_message_time);
      const rightTime = this.createdAtTimestamp(right.last_message_time);

      if (leftTime === rightTime) {
        if (left.isFollowSuggestion && !right.isFollowSuggestion) {
          return 1;
        }

        if (!left.isFollowSuggestion && right.isFollowSuggestion) {
          return -1;
        }

        return left.other_user.name.localeCompare(right.other_user.name);
      }

      return rightTime - leftTime;
    });
  }

  private createdAtTimestamp(value: string): number {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private initials(name: string | undefined, fallbackId: number): string {
    const value = (name ?? '').trim();
    if (!value) {
      const cached = this.userDirectory.getCachedDisplay(fallbackId);
      return cached?.initials ?? `U${fallbackId}`;
    }

    const initials = value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || `U${fallbackId}`;
  }

  private hydrateConversationUsers(conversations: ConversationView[]): void {
    const userIds = conversations.map((conversation) => conversation.other_user.id);

    this.userDirectory.resolveUsers(userIds).subscribe({
      next: (users) => {
        conversations.forEach((conversation) => {
          const display = users.get(conversation.other_user.id);
          if (!display) {
            return;
          }

          this.applyDisplayToConversation(conversation, display);
        });
      }
    });
  }

  private hydrateMessageUsers(messages: Message[]): void {
    const userIds = messages.flatMap((message) => [message.sender_id, message.receiver_id]);

    this.userDirectory.resolveUsers(userIds).subscribe({
      next: (users) => {
        messages.forEach((message) => {
          const sender = users.get(message.sender_id);
          const receiver = users.get(message.receiver_id);

          if (sender) {
            message.sender_name = sender.fullName;
            message.sender_avatar = sender.initials;
          }

          if (receiver) {
            message.receiver_name = receiver.fullName;
            message.receiver_avatar = receiver.initials;
          }
        });
      }
    });
  }

  private applyDisplayToConversation(conversation: ConversationView, display: CommunityUserDisplay): void {
    conversation.other_user.name = display.fullName;
    conversation.other_user.avatar = display.initials;
  }

  private normalizeDisplayName(value: string | undefined, fallbackId: number): string {
    const normalized = (value ?? '').trim();
    return normalized ? normalized : `User #${fallbackId}`;
  }

  private uniqueById(messages: Message[]): Message[] {
    const seen = new Set<number>();
    const unique: Message[] = [];

    messages.forEach((message) => {
      if (seen.has(message.id)) {
        return;
      }

      seen.add(message.id);
      unique.push(message);
    });

    return unique;
  }

  private scrollToLatest(): void {
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 30);
  }
}
