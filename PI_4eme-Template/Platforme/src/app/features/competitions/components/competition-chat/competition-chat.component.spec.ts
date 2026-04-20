import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionChatComponent } from './competition-chat.component';
import { WebSocketService, ChatMessage } from '../../services/websocket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() { return of({}); }
}

// ✅ Mock complet de WebSocketService pour éviter l'import de SockJS
class MockWebSocketService {
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private participantsSubject = new BehaviorSubject<any[]>([]);

  connected$ = this.connectedSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  participants$ = this.participantsSubject.asObservable();

  connect = jasmine.createSpy('connect');
  sendMessage = jasmine.createSpy('sendMessage');
  disconnect = jasmine.createSpy('disconnect');

  // Helpers pour les tests
  setConnected(val: boolean) { this.connectedSubject.next(val); }
  setMessages(msgs: ChatMessage[]) { this.messagesSubject.next(msgs); }
}

describe('CompetitionChatComponent', () => {
  let component: CompetitionChatComponent;
  let fixture: ComponentFixture<CompetitionChatComponent>;
  let mockWsService: MockWebSocketService;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser = {
    idUser: 11,
    nom: 'Ben Ali',
    prenom: 'Ahmed',
    email: 'ahmed@test.com',
    role: 'APPRENANT' as any
  };

  const mockFormateurUser = {
    idUser: 8,
    nom: 'Aziz',
    prenom: 'Formateur',
    email: 'aziz@test.com',
    role: 'FORMATEUR' as any
  };

  const connectedSubject = new BehaviorSubject<boolean>(false);
  const messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  const participantsSubject = new BehaviorSubject<any[]>([]);

  beforeEach(async () => {
    mockWsService = new MockWebSocketService();

    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserRole'], {
      currentUser$: new BehaviorSubject(mockUser).asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        CompetitionChatComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: WebSocketService, useValue: mockWsService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitionChatComponent);
    component = fixture.componentInstance;
    component.competitionId = 1;
  });

  // ===== CRÉATION =====
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have competitionId input', () => {
    expect(component.competitionId).toBe(1);
  });

  // ===== ÉTAT INITIAL =====
  it('should initialize with empty messages', () => {
    expect(component.messages).toEqual([]);
  });

  it('should initialize with GENERAL recipient type', () => {
    expect(component.selectedRecipientType).toBe('GENERAL');
  });

  it('should initialize with general tab active', () => {
    expect(component.activeTab).toBe('general');
  });

  it('should initialize connected as false', () => {
    expect(component.connected).toBeFalse();
  });

  // ===== isMyMessage =====
  it('should return true for my own message', () => {
    component.currentUserId = 11;
    const msg: ChatMessage = {
      competitionId: 1, senderId: 11, senderName: 'Ahmed',
      senderRole: 'APPRENANT', messageText: 'Hello'
    };
    expect(component.isMyMessage(msg)).toBeTrue();
  });

  it('should return false for other user message', () => {
    component.currentUserId = 11;
    const msg: ChatMessage = {
      competitionId: 1, senderId: 8, senderName: 'Aziz',
      senderRole: 'FORMATEUR', messageText: 'Hello'
    };
    expect(component.isMyMessage(msg)).toBeFalse();
  });

  // ===== getGeneralMessages =====
  it('should filter GENERAL messages correctly', () => {
    component.messages = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'General', recipientType: 'GENERAL' },
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Team', recipientType: 'TEAM' },
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Private', recipientType: 'PRIVATE' }
    ];

    const general = component.getGeneralMessages();
    expect(general.length).toBe(1);
    expect(general[0].messageText).toBe('General');
  });

  it('should include messages without recipientType in general', () => {
    component.messages = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'No type' }
    ];

    const general = component.getGeneralMessages();
    expect(general.length).toBe(1);
  });

  // ===== getTeamMessages =====
  it('should filter TEAM messages for current team', () => {
    component.currentTeamId = 5;
    component.messages = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Team 5', recipientType: 'TEAM', teamId: 5 },
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Team 6', recipientType: 'TEAM', teamId: 6 }
    ];

    const teamMessages = component.getTeamMessages();
    expect(teamMessages.length).toBe(1);
    expect(teamMessages[0].messageText).toBe('Team 5');
  });

  it('should return empty array when no team messages for current team', () => {
    component.currentTeamId = 5;
    component.messages = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Team 6', recipientType: 'TEAM', teamId: 6 }
    ];

    expect(component.getTeamMessages().length).toBe(0);
  });

  // ===== getPrivateMessagesForParticipant =====
  it('should filter PRIVATE messages for current user as sender', () => {
    component.currentUserId = 11;
    component.messages = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Private', recipientType: 'PRIVATE', recipientId: 8 },
      { competitionId: 1, senderId: 8, senderName: 'Aziz', senderRole: 'FORMATEUR', messageText: 'Reply', recipientType: 'PRIVATE', recipientId: 11 },
      { competitionId: 1, senderId: 12, senderName: 'Other', senderRole: 'APPRENANT', messageText: 'Other', recipientType: 'PRIVATE', recipientId: 8 }
    ];

    const privateMessages = component.getPrivateMessagesForParticipant();
    expect(privateMessages.length).toBe(2);
  });

  // ===== sendMessage =====
  it('should NOT send empty message', () => {
    component.newMessage = '';
    component.connected = true;
    component.sendMessage();
    expect(mockWsService.sendMessage).not.toHaveBeenCalled();
  });

  it('should NOT send when not connected', () => {
    component.newMessage = 'Hello';
    component.connected = false;
    component.sendMessage();
    expect(mockWsService.sendMessage).not.toHaveBeenCalled();
  });

  it('should send GENERAL message when connected', () => {
    component.newMessage = 'Hello World';
    component.connected = true;
    component.currentUserId = 11;
    component.currentUserName = 'Ahmed Ben Ali';
    component.currentUserRole = 'APPRENANT';
    component.selectedRecipientType = 'GENERAL';

    component.sendMessage();

    expect(mockWsService.sendMessage).toHaveBeenCalledWith(1, jasmine.objectContaining({
      messageText: 'Hello World',
      recipientType: 'GENERAL',
      senderId: 11
    }));
  });

  it('should clear newMessage after sending', () => {
    component.newMessage = 'Hello';
    component.connected = true;
    component.currentUserId = 11;
    component.currentUserName = 'Ahmed';
    component.currentUserRole = 'APPRENANT';

    component.sendMessage();

    expect(component.newMessage).toBe('');
  });

  it('should send TEAM message with teamId', () => {
    component.newMessage = 'Team message';
    component.connected = true;
    component.currentUserId = 11;
    component.currentUserName = 'Ahmed';
    component.currentUserRole = 'APPRENANT';
    component.selectedRecipientType = 'TEAM';
    component.currentTeamId = 5;

    component.sendMessage();

    expect(mockWsService.sendMessage).toHaveBeenCalledWith(1, jasmine.objectContaining({
      recipientType: 'TEAM',
      teamId: 5
    }));
  });

  // ===== filterMessagesForUser =====
  it('should return all messages for participant', () => {
    const messages: ChatMessage[] = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Msg1' },
      { competitionId: 1, senderId: 8, senderName: 'Aziz', senderRole: 'FORMATEUR', messageText: 'Msg2' }
    ];

    const result = component.filterMessagesForUser(messages);
    expect(result.length).toBe(2);
  });

  // ===== organizeFormateurMessages =====
  it('should separate general and private messages for formateur', () => {
    component.currentUserId = 8;
    const messages: ChatMessage[] = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'General', recipientType: 'GENERAL' },
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Private', recipientType: 'PRIVATE', recipientId: 8 }
    ];

    component.organizeFormateurMessages(messages);

    expect(component.messages.length).toBe(1);
    expect(component.messages[0].messageText).toBe('General');
    expect(component.privateConversations.size).toBe(1);
  });

  // ===== closePrivateConversation =====
  it('should close private conversation', () => {
    component.selectedPrivateUserId = 11;
    component.selectedPrivateUserName = 'Ahmed';

    component.closePrivateConversation();

    expect(component.selectedPrivateUserId).toBeNull();
    expect(component.selectedPrivateUserName).toBe('');
  });

  // ===== selectPrivateConversation =====
  it('should select private conversation', () => {
    component.selectPrivateConversation(11, 'Ahmed');

    expect(component.selectedPrivateUserId).toBe(11);
    expect(component.selectedPrivateUserName).toBe('Ahmed');
  });

  // ===== getRecipientTypeLabel =====
  it('should return correct label for GENERAL', () => {
    component.selectedRecipientType = 'GENERAL';
    expect(component.getRecipientTypeLabel()).toContain('général');
  });

  it('should return correct label for TEAM', () => {
    component.selectedRecipientType = 'TEAM';
    expect(component.getRecipientTypeLabel()).toContain('équipe');
  });

  it('should return correct label for PRIVATE', () => {
    component.selectedRecipientType = 'PRIVATE';
    expect(component.getRecipientTypeLabel()).toContain('privé');
  });

  // ===== getPrivateMessages =====
  it('should return empty array when no private conversation selected', () => {
    component.selectedPrivateUserId = null;
    expect(component.getPrivateMessages()).toEqual([]);
  });

  it('should return messages for selected private conversation', () => {
    const msgs: ChatMessage[] = [
      { competitionId: 1, senderId: 11, senderName: 'Ahmed', senderRole: 'APPRENANT', messageText: 'Hello' }
    ];
    component.privateConversations.set(11, msgs);
    component.selectedPrivateUserId = 11;

    expect(component.getPrivateMessages().length).toBe(1);
  });

  // ===== ngOnDestroy =====
  it('should disconnect WebSocket on destroy', () => {
    component.currentUserId = 11;
    component.ngOnDestroy();
    expect(mockWsService.disconnect).toHaveBeenCalledWith(1, 11);
  });
});
