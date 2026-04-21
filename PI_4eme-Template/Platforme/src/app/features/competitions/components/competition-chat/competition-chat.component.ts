import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WebSocketService, ChatMessage } from '../../services/websocket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-competition-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './competition-chat.component.html',
  styleUrls: ['./competition-chat.component.css']
})
export class CompetitionChatComponent implements OnInit, OnDestroy {
  @Input() competitionId!: number;
  
  messages: ChatMessage[] = [];
  participants: any[] = [];
  newMessage = '';
  connected = false;
  currentUserId: number = 0;
  currentUserName: string = '';
  currentUserRole: string = '';
  currentTeamId: number | null = null;
  formateurId: number | null = null;
  
  // Message type selection
  selectedRecipientType: 'GENERAL' | 'TEAM' | 'PRIVATE' = 'GENERAL';
  
  // For formateur: tabs and private conversations
  activeTab: 'general' | 'private' | 'team' = 'general';
  selectedPrivateUserId: number | null = null;
  selectedPrivateUserName: string = '';
  privateConversations: Map<number, ChatMessage[]> = new Map();

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.idUser;
        this.currentUserName = `${user.prenom} ${user.nom}`;
        this.currentUserRole = user.role;
        
        console.log('🔍 Chat Debug - User:', {
          userId: this.currentUserId,
          userName: this.currentUserName,
          userRole: this.currentUserRole
        });
        
        // Get user's team if participant
        if (this.currentUserRole !== 'FORMATEUR') {
          this.getUserTeam();
          this.getFormateurIdFromBackend();
        } else {
          // Load chat history for formateur
          this.loadChatHistory();
        }
        
        // Connect to WebSocket
        this.wsService.connect(
          this.competitionId,
          this.currentUserId,
          this.currentUserName,
          this.currentUserRole
        );
      }
    });

    // Subscribe to connection status
    this.wsService.connected$.subscribe(status => {
      this.connected = status;
    });

    // Subscribe to messages
    this.wsService.messages$.subscribe(messages => {
      if (this.currentUserRole === 'FORMATEUR') {
        // For formateur: organize messages by type
        this.organizeFormateurMessages(messages);
      } else {
        // For participants: filter messages
        this.messages = this.filterMessagesForUser(messages);
      }
      setTimeout(() => this.scrollToBottom(), 100);
    });

    // Subscribe to participants
    this.wsService.participants$.subscribe(participants => {
      this.participants = participants;
    });
  }

  ngOnDestroy(): void {
    this.wsService.disconnect(this.competitionId, this.currentUserId);
  }

  loadChatHistory(): void {
    // Both formateur and participants load ALL their messages
    const url = `${environment.competitionsApiUrl}/chat/competition/${this.competitionId}/history/filtered?userId=${this.currentUserId}&userRole=${this.currentUserRole}&teamId=${this.currentTeamId || ''}`;
    
    this.http.get<ChatMessage[]>(url)
      .subscribe({
        next: (history) => {
          console.log('📥 Chat history loaded:', history.length, 'messages');
          
          if (this.currentUserRole === 'FORMATEUR') {
            // For formateur: organize messages by type
            this.organizeFormateurMessages(history);
          } else {
            // For participants: store all messages (tabs will filter)
            this.messages = history;
          }
          
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => console.error('Error loading chat history:', err)
      });
  }

  getUserTeam(): void {
    // Get user's team from team_members table
    this.http.get<any>(`${environment.competitionsApiUrl}/competitions/${this.competitionId}/my-team`)
      .subscribe({
        next: (teamMember) => {
          this.currentTeamId = teamMember?.teamId || null;
          this.loadChatHistory();
        },
        error: (err) => {
          console.error('Error getting user team:', err);
          this.currentTeamId = null;
          this.loadChatHistory();
        }
      });
  }

  getFormateurIdFromBackend(): void {
    // Get competition details to find formateur ID
    this.http.get<any>(`${environment.competitionsApiUrl}/competitions/${this.competitionId}`)
      .subscribe({
        next: (competition) => {
          console.log('🔍 Competition data received:', JSON.stringify(competition, null, 2));
          
          // Try different field names
          this.formateurId = competition?.createdBy || competition?.formateurId || competition?.formateur_id || competition?.created_by || null;
          console.log('🔍 Formateur ID extracted:', this.formateurId);
          
          if (!this.formateurId) {
            console.warn('⚠️ formateurId not found in competition, trying participants...');
            // Fallback: get formateur from participants list
            this.loadParticipantsAndFindFormateur();
          }
        },
        error: (err) => {
          console.error('Error getting formateur ID:', err);
          // Fallback: try to get from participants
          this.loadParticipantsAndFindFormateur();
        }
      });
  }

  loadParticipantsAndFindFormateur(): void {
    this.http.get<any[]>(`${environment.competitionsApiUrl}/competitions/${this.competitionId}/participants`)
      .subscribe({
        next: (participants) => {
          console.log('🔍 Participants loaded:', participants);
          const formateur = participants.find(p => p.role === 'FORMATEUR' || p.userRole === 'FORMATEUR');
          if (formateur) {
            this.formateurId = formateur.userId || formateur.user_id || formateur.id;
            console.log('✅ Formateur ID found from participants:', this.formateurId);
          } else {
            console.error('❌ No formateur found in participants list');
          }
        },
        error: (err) => {
          console.error('Error loading participants:', err);
        }
      });
  }

  filterMessagesForUser(messages: ChatMessage[]): ChatMessage[] {
    // PARTICIPANT sees ALL messages (filtering is done in tabs)
    return messages;
  }

  organizeFormateurMessages(messages: ChatMessage[]): void {
    console.log('🔧 Organizing formateur messages, total:', messages.length);
    
    // Separate general/team messages from private messages
    this.messages = messages.filter(msg => 
      msg.recipientType === 'GENERAL' || msg.recipientType === 'TEAM' || !msg.recipientType
    );
    console.log('📊 General/Team messages:', this.messages.length);

    // Organize private messages by user
    this.privateConversations.clear();
    const privateMessages = messages.filter(msg => msg.recipientType === 'PRIVATE');
    console.log('🔒 Private messages found:', privateMessages.length);
    
    privateMessages.forEach(msg => {
      console.log('🔍 Processing private message:', {
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        currentUserId: this.currentUserId,
        text: msg.messageText
      });
      
      // Get the other user ID (not formateur)
      const otherUserId = msg.senderId === this.currentUserId ? msg.recipientId! : msg.senderId;
      console.log('👤 Other user ID:', otherUserId);
      
      if (!this.privateConversations.has(otherUserId)) {
        this.privateConversations.set(otherUserId, []);
      }
      this.privateConversations.get(otherUserId)!.push(msg);
    });
    
    console.log('💬 Private conversations organized:', this.privateConversations.size, 'conversations');
  }

  getPrivateConversationsList(): Array<{userId: number, userName: string, messages: ChatMessage[], unreadCount: number}> {
    const list: Array<{userId: number, userName: string, messages: ChatMessage[], unreadCount: number}> = [];
    
    this.privateConversations.forEach((messages, userId) => {
      if (messages.length === 0) return;
      
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(m => !m.isRead && m.senderId !== this.currentUserId).length;
      
      // Get the participant's name (not formateur)
      const participantMessage = messages.find(m => m.senderRole !== 'FORMATEUR');
      const userName = participantMessage ? participantMessage.senderName : lastMessage.senderName;
      
      list.push({
        userId,
        userName,
        messages,
        unreadCount
      });
    });
    
    return list.sort((a, b) => {
      const aTime = a.messages[a.messages.length - 1].sentAt || '';
      const bTime = b.messages[b.messages.length - 1].sentAt || '';
      return bTime.localeCompare(aTime);
    });
  }

  selectPrivateConversation(userId: number, userName: string): void {
    this.selectedPrivateUserId = userId;
    this.selectedPrivateUserName = userName;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  getPrivateMessages(): ChatMessage[] {
    if (!this.selectedPrivateUserId) return [];
    return this.privateConversations.get(this.selectedPrivateUserId) || [];
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.connected) {
      return;
    }

    const message: ChatMessage = {
      competitionId: this.competitionId,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      senderRole: this.currentUserRole,
      messageText: this.newMessage.trim(),
      messageType: 'TEXT',
      recipientType: this.selectedRecipientType
    };

    // Add team ID for team messages
    if (this.selectedRecipientType === 'TEAM' && this.currentTeamId) {
      message.teamId = this.currentTeamId;
    }

    // Add recipient ID for private messages
    if (this.selectedRecipientType === 'PRIVATE') {
      if (this.currentUserRole === 'FORMATEUR') {
        // Formateur sends to selected participant
        if (this.selectedPrivateUserId) {
          message.recipientId = this.selectedPrivateUserId;
        }
      } else {
        // Participant sends to formateur - use formateurId from backend
        if (this.formateurId) {
          message.recipientId = this.formateurId;
          console.log('📤 Sending private message to formateur:', this.formateurId);
        } else {
          console.error('❌ Formateur ID not found!');
          alert('Impossible d\'envoyer le message privé. Formateur non trouvé.');
          return;
        }
      }
    }

    this.wsService.sendMessage(this.competitionId, message);
    this.newMessage = '';
  }

  getFormateurId(): number | undefined {
    // Find formateur in participants list
    const formateur = this.participants.find(p => p.userRole === 'FORMATEUR');
    return formateur?.userId;
  }

  getRecipientTypeLabel(): string {
    switch (this.selectedRecipientType) {
      case 'GENERAL': return '👥 Groupe général';
      case 'TEAM': return '🏆 Mon équipe';
      case 'PRIVATE': return '🔒 Message privé au formateur';
      default: return '';
    }
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  // Filter messages by type for participant tabs
  getGeneralMessages(): ChatMessage[] {
    return this.messages.filter(msg => 
      msg.recipientType === 'GENERAL' || !msg.recipientType
    );
  }

  getTeamMessages(): ChatMessage[] {
    return this.messages.filter(msg => 
      msg.recipientType === 'TEAM' && msg.teamId === this.currentTeamId
    );
  }

  getPrivateMessagesForParticipant(): ChatMessage[] {
    return this.messages.filter(msg => 
      msg.recipientType === 'PRIVATE' && 
      (msg.senderId === this.currentUserId || msg.recipientId === this.currentUserId)
    );
  }

  // Close private conversation for formateur
  closePrivateConversation(): void {
    this.selectedPrivateUserId = null;
    this.selectedPrivateUserName = '';
  }

  private scrollToBottom(): void {
    const chatBox = document.querySelector('.chat-messages');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
}
