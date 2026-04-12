import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, catchError, finalize, of } from 'rxjs';
import { ToastService } from '@core/services';
import { Conversation, Message } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import { ChatSocketService, LiveTypingEvent } from '../../services/chat-socket.service';
import {
  CommunityUserDirectoryService,
  CommunityUserDisplay
} from '../../services/community-user-directory.service';
import { FollowRelationship, FollowService } from '../../services/follow.service';
import { AudioRecordService } from '../../services/audio-record.service';
import { SupabaseService } from '../../services/supabase.service';

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
  private readonly ngZone = inject(NgZone);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;

  selectedConversation: ConversationView | null = null;
  conversations: ConversationView[] = [];
  followedUsers: ConversationView[] = [];
  isViewingSpecificUser = false;
  isLoadingConversation = false;
  isLoadingFollowedUsers = false;
  isSocketConnected = false;
  isSocketConnecting = false;
  isRecordingVoice = false;
  isUploadingVoice = false;
  isUploadingAttachment = false;
  typingUserId: number | null = null;
  errorMessage = '';
  voiceErrorMessage = '';
  attachmentErrorMessage = '';

  private readonly currentUserId: number | null;
  private readonly typingStopDelayMs = 1200;

  readonly searchControl = this.fb.nonNullable.control('');
  readonly messageForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.pattern(/\S/)]]
  });

  private routeSubscription: Subscription | null = null;
  private recordingStateSubscription: Subscription | null = null;
  private socketStateSubscription: Subscription | null = null;
  private socketMessageSubscription: Subscription | null = null;
  private socketTypingSubscription: Subscription | null = null;
  private typingResetHandle: ReturnType<typeof setTimeout> | null = null;
  private typingStopEmitHandle: ReturnType<typeof setTimeout> | null = null;
  private pollingHandle: ReturnType<typeof setInterval> | null = null;
  private pollingTick = 0;
  private readonly pollingIntervalMs = 3000;
  private readonly selectionStorageKey = 'community.messages.selectedUser.v1';
  private restoredSelectionUserId: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly chatSocketService: ChatSocketService,
    private readonly followService: FollowService,
    private readonly userDirectory: CommunityUserDirectoryService,
    private readonly audioRecordService: AudioRecordService,
    private readonly supabaseService: SupabaseService,
    private readonly toast: ToastService
  ) {
    this.currentUserId = this.followService.getCurrentUserIdSafe();
  }

  ngOnInit(): void {
    this.recordingStateSubscription = this.audioRecordService.isRecording$.subscribe((isRecording) => {
      this.isRecordingVoice = isRecording;
      this.updateMessageControlDisabledState();
    });

    this.updateMessageControlDisabledState();

    this.restoredSelectionUserId = this.readSelectedConversationUserId();
    this.initSocketConnection();
    this.initFallbackPolling();
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
    this.recordingStateSubscription?.unsubscribe();
    this.socketStateSubscription?.unsubscribe();
    this.socketMessageSubscription?.unsubscribe();
    this.socketTypingSubscription?.unsubscribe();

    if (this.typingResetHandle) {
      clearTimeout(this.typingResetHandle);
    }

    if (this.typingStopEmitHandle) {
      clearTimeout(this.typingStopEmitHandle);
    }

    if (this.pollingHandle) {
      clearInterval(this.pollingHandle);
    }

    if (this.isRecordingVoice) {
      this.audioRecordService.cancelRecording();
    }

    this.chatSocketService.disconnect();
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

  get isSelectedUserTyping(): boolean {
    return this.typingUserId !== null && this.typingUserId === this.selectedConversation?.other_user.id;
  }

  trackByMessage(index: number, message: Message): string | number {
    if (message.id > 0) {
      return message.id;
    }

    if (message.client_id) {
      return message.client_id;
    }

    return `${message.sender_id}-${message.receiver_id}-${message.created_at}-${message.content}-${index}`;
  }

  private initSocketConnection(): void {
    if (this.currentUserId === null) {
      this.isSocketConnected = false;
      this.isSocketConnecting = false;
      return;
    }

    this.socketStateSubscription = this.chatSocketService.connectionState$.subscribe((state) => {
      this.isSocketConnected = state === 'connected';
      this.isSocketConnecting = state === 'connecting';
    });

    this.socketMessageSubscription = this.chatSocketService.incomingMessages$.subscribe((message) => {
      this.handleIncomingSocketMessage(message);
    });

    this.socketTypingSubscription = this.chatSocketService.typingEvents$.subscribe((event) => {
      this.handleIncomingTypingEvent(event);
    });

    void this.chatSocketService.connect(this.currentUserId);
  }

  private initFallbackPolling(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.pollingHandle) {
      clearInterval(this.pollingHandle);
    }

    this.ngZone.runOutsideAngular(() => {
      this.pollingHandle = setInterval(() => {
        if (this.isSocketConnected || this.isSocketConnecting) {
          return;
        }

        if (!this.selectedConversation || this.isLoadingConversation) {
          return;
        }

        this.ngZone.run(() => {
          if (!this.selectedConversation || this.isLoadingConversation) {
            return;
          }

          if (this.isAnyMediaPlaying()) {
            return;
          }

          this.loadConversationMessages(this.selectedConversation.other_user.id, { background: true });

          this.pollingTick += 1;
          if (this.pollingTick % 4 === 0) {
            this.loadConversations();
          }
        });
      }, this.pollingIntervalMs);
    });
  }

  private handleIncomingSocketMessage(message: Message): void {
    this.errorMessage = '';

    const mapped = this.mapMessage(message);
    mapped.delivery_status = 'sent';
    this.hydrateMessageUsers([mapped]);

    const conversation = this.ensureConversationForMessage(mapped);
    this.replaceOrAppendMessage(conversation, mapped);

    const messageTargetsCurrentUser = this.currentUserId !== null && mapped.receiver_id === this.currentUserId;
    const isSelectedConversation = this.selectedConversation?.other_user.id === conversation.other_user.id;

    if (isSelectedConversation) {
      conversation.unread_count = 0;
      this.selectedConversation = conversation;
      this.typingUserId = null;
      this.scrollToLatest();
    } else if (messageTargetsCurrentUser) {
      conversation.unread_count = (conversation.unread_count ?? 0) + 1;
    }

    this.conversations = this.sortConversationsByLatest(this.conversations);
    this.followedUsers = this.followedUsers.filter((item) => item.other_user.id !== conversation.other_user.id);
  }

  private handleIncomingTypingEvent(event: LiveTypingEvent): void {
    if (this.currentUserId === null || !this.selectedConversation) {
      return;
    }

    if (event.toUserId !== this.currentUserId || event.fromUserId !== this.selectedConversation.other_user.id) {
      return;
    }

    if (!event.isTyping) {
      this.typingUserId = null;
      if (this.typingResetHandle) {
        clearTimeout(this.typingResetHandle);
        this.typingResetHandle = null;
      }
      return;
    }

    this.typingUserId = event.fromUserId;
    if (this.typingResetHandle) {
      clearTimeout(this.typingResetHandle);
    }

    this.typingResetHandle = setTimeout(() => {
      this.typingUserId = null;
      this.typingResetHandle = null;
    }, 1800);
  }

  loadConversations(): void {
    this.messageService.getConversations().subscribe({
      next: (conversations) => {
        this.errorMessage = '';
        this.conversations = this.sortConversationsByLatest(
          conversations.map((conversation) => this.mapConversation(conversation))
        );
        this.hydrateConversationUsers(this.conversations);
        this.restoreSelectedConversationIfNeeded();
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
    this.persistSelectedConversationUserId(selected.other_user.id);
    selected.unread_count = 0;
    this.typingUserId = null;
    if (this.typingResetHandle) {
      clearTimeout(this.typingResetHandle);
      this.typingResetHandle = null;
    }
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

    if (this.isRecordingVoice || this.isUploadingVoice || this.isUploadingAttachment) {
      return;
    }

    if (!this.selectedConversation) {
      return;
    }

    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const content = this.messageForm.controls.content.value.trim();
    this.messageForm.reset({ content: '' });
    this.sendPreparedMessage(content);
  }

  onMessageInput(): void {
    if (this.isRecordingVoice || this.isUploadingVoice || this.isUploadingAttachment) {
      return;
    }

    this.sendTypingSignal(true);
  }

  startRecording(): void {
    if (!this.selectedConversation) {
      this.voiceErrorMessage = 'Select a conversation before recording a voice message.';
      return;
    }

    if (this.isUploadingVoice || this.isUploadingAttachment || this.isRecordingVoice) {
      return;
    }

    this.voiceErrorMessage = '';

    this.audioRecordService.startRecording().catch((error: Error) => {
      this.voiceErrorMessage = error.message;
      this.toast.error(error.message);
    });
  }

  stopRecording(): void {
    if (!this.selectedConversation || !this.isRecordingVoice || this.isUploadingVoice || this.isUploadingAttachment) {
      return;
    }

    this.voiceErrorMessage = '';
    this.setVoiceUploadingState(true);

    this.audioRecordService
      .stopRecording()
      .then((blob) => {
        this.supabaseService
          .uploadVoiceMessage(blob)
          .pipe(finalize(() => this.setVoiceUploadingState(false)))
          .subscribe({
            next: (audioUrl) => {
              this.errorMessage = '';
              this.sendPreparedMessage(audioUrl);
            },
            error: (error: Error) => {
              this.voiceErrorMessage = error.message;
              this.toast.error(error.message);
            }
          });
      })
      .catch((error: Error) => {
        this.setVoiceUploadingState(false);
        this.voiceErrorMessage = error.message;
        this.toast.error(error.message);
      });
  }

  onImageSelected(event: Event): void {
    this.handleImageSelection(event);
  }

  isVoiceMessage(message: Message): boolean {
    return this.supabaseService.isSupabaseVoiceUrl(message.content);
  }

  isImageMessage(message: Message): boolean {
    return this.supabaseService.isSupabaseImageUrl(message.content);
  }

  isVideoMessage(message: Message): boolean {
    return this.supabaseService.isSupabaseVideoUrl(message.content);
  }

  conversationPreviewLabel(content: string): string {
    if (this.supabaseService.isSupabaseVoiceUrl(content)) {
      return '🎤 Voice message';
    }

    if (this.supabaseService.isSupabaseImageUrl(content)) {
      return '📷 Image';
    }

    if (this.supabaseService.isSupabaseVideoUrl(content)) {
      return '🎬 Video';
    }

    return content;
  }

  private handleImageSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!this.selectedConversation) {
      this.attachmentErrorMessage = 'Select a conversation before sending media.';
      this.toast.error(this.attachmentErrorMessage);
      return;
    }

    if (this.isRecordingVoice || this.isUploadingVoice || this.isUploadingAttachment) {
      return;
    }

    this.attachmentErrorMessage = '';
    this.voiceErrorMessage = '';
    this.setAttachmentUploadingState(true);

    this.supabaseService
      .uploadMessageImage(file)
      .pipe(finalize(() => this.setAttachmentUploadingState(false)))
      .subscribe({
        next: (mediaUrl) => {
          this.errorMessage = '';
          this.sendPreparedMessage(mediaUrl);
        },
        error: (error: Error) => {
          this.attachmentErrorMessage = error.message;
          this.toast.error(error.message);
        }
      });
  }

  private sendPreparedMessage(content: string): void {
    if (!this.selectedConversation) {
      return;
    }

    const receiverId = this.selectedConversation.other_user.id;
    const optimisticMessage = this.createOptimisticMessage(receiverId, content);
    this.appendMessageToConversation(this.selectedConversation, optimisticMessage);

    this.sendTypingSignal(false);
    this.scrollToLatest();

    const published = this.chatSocketService.sendMessage({
      receiverId,
      content,
      conversationId: this.selectedConversation.id,
      clientMessageId: optimisticMessage.client_id
    });

    if (published) {
      this.updateMessageDeliveryStatus(this.selectedConversation, optimisticMessage, 'sent');
      return;
    }

    this.messageService.sendMessage(receiverId, content).subscribe({
      next: (message) => {
        this.errorMessage = '';
        const mappedMessage = this.mapMessage({ ...message, client_id: optimisticMessage.client_id });
        mappedMessage.delivery_status = 'sent';
        this.hydrateMessageUsers([mappedMessage]);

        if (!this.selectedConversation || this.selectedConversation.other_user.id !== receiverId) {
          return;
        }

        this.replaceMessage(this.selectedConversation, optimisticMessage, mappedMessage);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.updateMessageDeliveryStatus(this.selectedConversation, optimisticMessage, 'failed');
        this.toast.error('Live channel unavailable. Message was not delivered.');
      }
    });
  }

  isOwnMessage(message: Message): boolean {
    if (this.selectedConversation) {
      if (message.sender_id === this.selectedConversation.other_user.id) {
        return false;
      }

      if (message.receiver_id === this.selectedConversation.other_user.id) {
        return true;
      }
    }

    if (this.currentUserId !== null) {
      return message.sender_id === this.currentUserId;
    }

    return false;
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

  private loadConversationMessages(otherUserId: number, options?: { background?: boolean }): void {
    const isBackground = options?.background === true;
    if (!isBackground) {
      this.isLoadingConversation = true;
    }

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
          if (!isBackground) {
            this.scrollToLatest();
          }
        }

        this.conversations = this.sortConversationsByLatest(this.conversations);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        if (!isBackground) {
          this.toast.error('Failed to load conversation history');
        }
      },
      complete: () => {
        if (!isBackground) {
          this.isLoadingConversation = false;
        }
      }
    });
  }

  private restoreSelectedConversationIfNeeded(): void {
    const preferredUserId = this.selectedConversation?.other_user.id ?? this.restoredSelectionUserId;
    if (!preferredUserId || !Number.isFinite(preferredUserId)) {
      return;
    }

    const target = this.mergedConversations().find((conversation) => conversation.other_user.id === preferredUserId);
    if (!target) {
      return;
    }

    const selected = this.upsertConversation(target);
    selected.unread_count = 0;
    this.selectedConversation = selected;
    this.persistSelectedConversationUserId(preferredUserId);

    if (!selected.messages.length) {
      this.loadConversationMessages(preferredUserId, { background: true });
    }

    this.restoredSelectionUserId = null;
  }

  private persistSelectedConversationUserId(userId: number): void {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.setItem(this.selectionStorageKey, String(userId));
  }

  private readSelectedConversationUserId(): number | null {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      return null;
    }

    const raw = sessionStorage.getItem(this.selectionStorageKey);
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private createOptimisticMessage(receiverId: number, content: string): Message {
    const senderId = this.currentUserId ?? 0;
    const clientId = `tmp-${Date.now()}-${Math.round(Math.random() * 100000)}`;

    return this.mapMessage({
      id: -Math.floor(Date.now() + Math.random() * 1000),
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      created_at: new Date().toISOString(),
      is_read: true,
      client_id: clientId,
      delivery_status: 'sending'
    });
  }

  private appendMessageToConversation(conversation: ConversationView, message: Message): void {
    this.replaceOrAppendMessage(conversation, message);
    conversation.unread_count = 0;
    this.selectedConversation = conversation;
    this.followedUsers = this.followedUsers.filter((item) => item.other_user.id !== conversation.other_user.id);
    this.conversations = this.sortConversationsByLatest(this.conversations);
  }

  private updateMessageDeliveryStatus(
    conversation: ConversationView | null,
    target: Message,
    status: 'sending' | 'sent' | 'failed'
  ): void {
    if (!conversation) {
      return;
    }

    const index = conversation.messages.findIndex((item) => this.isSameMessage(item, target));
    if (index < 0) {
      return;
    }

    conversation.messages[index] = {
      ...conversation.messages[index],
      delivery_status: status
    };

    this.selectedConversation = conversation;
  }

  private replaceMessage(conversation: ConversationView, target: Message, replacement: Message): void {
    const index = conversation.messages.findIndex((item) => this.isSameMessage(item, target));
    if (index >= 0) {
      conversation.messages[index] = replacement;
    } else {
      conversation.messages = [...conversation.messages, replacement];
    }

    conversation.messages = this.sortMessages(this.uniqueById(conversation.messages));
    conversation.last_message = replacement.content;
    conversation.last_message_time = replacement.created_at;
    conversation.isFollowSuggestion = false;

    this.upsertConversation(conversation);
    this.selectedConversation = conversation;
    this.conversations = this.sortConversationsByLatest(this.conversations);
    this.followedUsers = this.followedUsers.filter((item) => item.other_user.id !== conversation.other_user.id);
  }

  private replaceOrAppendMessage(conversation: ConversationView, message: Message): void {
    const index = conversation.messages.findIndex((item) => this.isSameMessage(item, message));
    if (index >= 0) {
      conversation.messages[index] = {
        ...conversation.messages[index],
        ...message,
        delivery_status: message.delivery_status ?? 'sent'
      };
    } else {
      conversation.messages = [...conversation.messages, message];
    }

    conversation.messages = this.sortMessages(this.uniqueById(conversation.messages));
    conversation.last_message = message.content;
    conversation.last_message_time = message.created_at;
    conversation.isFollowSuggestion = false;
    this.upsertConversation(conversation);
  }

  private ensureConversationForMessage(message: Message): ConversationView {
    const otherUserId = this.resolveOtherUserId(message);
    const existing = this.mergedConversations().find((conversation) => conversation.other_user.id === otherUserId);
    if (existing) {
      const promoted = this.upsertConversation(existing);
      promoted.isFollowSuggestion = false;
      return promoted;
    }

    const created = this.createPlaceholderConversation(otherUserId);
    created.last_message = 'No messages yet';
    created.isFollowSuggestion = false;
    return this.upsertConversation(created);
  }

  private resolveOtherUserId(message: Message): number {
    if (this.currentUserId !== null && message.sender_id === this.currentUserId) {
      return message.receiver_id;
    }

    return message.sender_id;
  }

  private isSameMessage(left: Message, right: Message): boolean {
    if (left.id > 0 && right.id > 0 && left.id === right.id) {
      return true;
    }

    if (left.client_id && right.client_id && left.client_id === right.client_id) {
      return true;
    }

    if (
      left.sender_id === right.sender_id &&
      left.receiver_id === right.receiver_id &&
      left.content === right.content
    ) {
      const leftTime = this.createdAtTimestamp(left.created_at);
      const rightTime = this.createdAtTimestamp(right.created_at);
      const deltaMs = Math.abs(leftTime - rightTime);

      if ((left.id < 0 || right.id < 0) && deltaMs <= 15000) {
        return true;
      }
    }

    return false;
  }

  private sortMessages(messages: Message[]): Message[] {
    return [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  private isAnyMediaPlaying(): boolean {
    const container = this.messagesContainer?.nativeElement;
    if (!container) {
      return false;
    }

    const players = container.querySelectorAll<HTMLMediaElement>('audio, video');
    for (const player of Array.from(players)) {
      if (!player.paused && !player.ended) {
        return true;
      }
    }

    return false;
  }

  private setVoiceUploadingState(isUploading: boolean): void {
    this.isUploadingVoice = isUploading;
    this.updateMessageControlDisabledState();
  }

  private setAttachmentUploadingState(isUploading: boolean): void {
    this.isUploadingAttachment = isUploading;
    this.updateMessageControlDisabledState();
  }

  private updateMessageControlDisabledState(): void {
    const contentControl = this.messageForm.controls.content;
    const shouldDisable = this.isRecordingVoice || this.isUploadingVoice || this.isUploadingAttachment;

    if (shouldDisable && contentControl.enabled) {
      contentControl.disable({ emitEvent: false });
      return;
    }

    if (!shouldDisable && contentControl.disabled) {
      contentControl.enable({ emitEvent: false });
    }
  }

  private sendTypingSignal(isTyping: boolean): void {
    if (!this.selectedConversation || this.currentUserId === null) {
      return;
    }

    if (this.typingStopEmitHandle) {
      clearTimeout(this.typingStopEmitHandle);
      this.typingStopEmitHandle = null;
    }

    this.chatSocketService.sendTyping({
      fromUserId: this.currentUserId,
      toUserId: this.selectedConversation.other_user.id,
      isTyping,
      conversationId: this.selectedConversation.id
    });

    if (isTyping) {
      this.typingStopEmitHandle = setTimeout(() => {
        this.sendTypingSignal(false);
      }, this.typingStopDelayMs);
    }
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
    const createdAt = (message.created_at || '').trim();

    return {
      ...message,
      created_at: createdAt || new Date().toISOString(),
      client_id: message.client_id,
      delivery_status: message.delivery_status ?? 'sent',
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
    const seenIds = new Set<number>();
    const seenClientIds = new Set<string>();
    const unique: Message[] = [];

    messages.forEach((message) => {
      if (message.client_id && seenClientIds.has(message.client_id)) {
        return;
      }

      if (message.id > 0 && seenIds.has(message.id)) {
        return;
      }

      if (message.client_id) {
        seenClientIds.add(message.client_id);
      }

      if (message.id > 0) {
        seenIds.add(message.id);
      }

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
