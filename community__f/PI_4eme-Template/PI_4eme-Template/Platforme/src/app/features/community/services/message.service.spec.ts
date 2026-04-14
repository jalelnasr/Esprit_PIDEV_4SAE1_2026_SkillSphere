import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 3 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MessageService]
    });

    service = TestBed.inject(MessageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sendMessage sends POST to /messages/:receiverId', () => {
    service.sendMessage(7, 'Hello!').subscribe(msg => {
      expect(msg.id).toBe(100);
      expect(msg.content).toBe('Hello!');
      expect(msg.sender_id).toBe(3);
      expect(msg.receiver_id).toBe(7);
    });

    const req = http.expectOne(`${base}/messages/7`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.content).toBe('Hello!');
    req.flush({ messageId: 100, content: 'Hello!', senderId: 3, receiverId: 7, createdAt: '2024-01-01T10:00:00', isRead: false });
  });

  it('getConversation sends GET to /messages/conversation/:id', () => {
    service.getConversation(7).subscribe(messages => {
      expect(messages.length).toBe(2);
      expect(messages[0].sender_id).toBe(3);
      expect(messages[1].sender_id).toBe(7);
    });

    const req = http.expectOne(`${base}/messages/conversation/7`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { messageId: 1, content: 'Hi', senderId: 3, receiverId: 7, createdAt: '2024-01-01T09:00:00', isRead: true },
      { messageId: 2, content: 'Hey', senderId: 7, receiverId: 3, createdAt: '2024-01-01T09:01:00', isRead: false }
    ]);
  });

  it('getConversations groups messages by other user', () => {
    service.getConversations().subscribe(conversations => {
      expect(conversations.length).toBe(2);

      const withUser7 = conversations.find(c => c.other_user_id === 7);
      const withUser8 = conversations.find(c => c.other_user_id === 8);

      expect(withUser7).toBeTruthy();
      expect(withUser8).toBeTruthy();
      expect(withUser7?.messages?.length).toBe(2);
      expect(withUser8?.messages?.length).toBe(1);
    });

    const sentReq = http.expectOne(`${base}/messages/sent/3`);
    const receivedReq = http.expectOne(`${base}/messages/received/3`);

    sentReq.flush([
      { messageId: 1, content: 'Hi', senderId: 3, receiverId: 7, createdAt: '2024-01-01T09:00:00', isRead: true },
      { messageId: 2, content: 'Hello', senderId: 3, receiverId: 8, createdAt: '2024-01-01T10:00:00', isRead: true }
    ]);
    receivedReq.flush([
      { messageId: 3, content: 'Hey back', senderId: 7, receiverId: 3, createdAt: '2024-01-01T09:05:00', isRead: false }
    ]);
  });

  it('getConversations counts unread messages correctly', () => {
    service.getConversations().subscribe(conversations => {
      const withUser7 = conversations.find(c => c.other_user_id === 7);
      expect(withUser7?.unread_count).toBe(1);
    });

    const sentReq = http.expectOne(`${base}/messages/sent/3`);
    const receivedReq = http.expectOne(`${base}/messages/received/3`);

    sentReq.flush([]);
    receivedReq.flush([
      { messageId: 1, content: 'Hey', senderId: 7, receiverId: 3, createdAt: '2024-01-01T09:00:00', isRead: false }
    ]);
  });

  it('getConversations sets last_message from most recent message', () => {
    service.getConversations().subscribe(conversations => {
      expect(conversations[0].last_message).toBe('Second message');
    });

    const sentReq = http.expectOne(`${base}/messages/sent/3`);
    const receivedReq = http.expectOne(`${base}/messages/received/3`);

    sentReq.flush([
      { messageId: 1, content: 'First message', senderId: 3, receiverId: 7, createdAt: '2024-01-01T08:00:00', isRead: true },
      { messageId: 2, content: 'Second message', senderId: 3, receiverId: 7, createdAt: '2024-01-01T09:00:00', isRead: true }
    ]);
    receivedReq.flush([]);
  });

  it('mapMessage handles snake_case field names', () => {
    service.getConversation(5).subscribe(messages => {
      expect(messages[0].sender_id).toBe(3);
      expect(messages[0].receiver_id).toBe(5);
      expect(messages[0].is_read).toBeFalse();
    });

    const req = http.expectOne(`${base}/messages/conversation/5`);
    req.flush([{ message_id: 10, content: 'Test', sender_id: 3, receiver_id: 5, created_at: '2024-01-01T10:00:00', is_read: false }]);
  });

  it('handles error on sendMessage', () => {
    let errorCaught = false;

    service.sendMessage(7, 'Hi').subscribe({ error: () => { errorCaught = true; } });

    const req = http.expectOne(`${base}/messages/7`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(errorCaught).toBeTrue();
  });
});
