import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.competitionsApiUrl}/notifications`;

  const mockNotification = {
    idNotification: 1,
    userId: 11,
    type: 'COMPETITION_UPDATE',
    title: 'Compétition mise à jour',
    message: 'Le Hackathon 2026 a été modifié',
    isRead: false,
    createdAt: '2026-04-14T10:00:00',
    competitionId: 39
  };

  const mockNotifications = [
    mockNotification,
    { ...mockNotification, idNotification: 2, isRead: true, title: 'Inscription confirmée' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== GET USER NOTIFICATIONS =====

  it('getUserNotifications() should call GET and return notifications', () => {
    service.getUserNotifications(11).subscribe(notifications => {
      expect(notifications.length).toBe(2);
      expect(notifications[0].title).toBe('Compétition mise à jour');
    });

    const req = httpMock.expectOne(`${apiUrl}/user/11`);
    expect(req.request.method).toBe('GET');
    req.flush(mockNotifications);
  });

  it('getUserNotifications() should update notifications$ observable', (done) => {
    service.getUserNotifications(11).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/user/11`);
    req.flush(mockNotifications);

    service.notifications$.subscribe(notifications => {
      if (notifications.length > 0) {
        expect(notifications.length).toBe(2);
        done();
      }
    });
  });

  // ===== GET UNREAD NOTIFICATIONS =====

  it('getUnreadNotifications() should call GET unread endpoint', () => {
    service.getUnreadNotifications(11).subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].isRead).toBeFalse();
    });

    const req = httpMock.expectOne(`${apiUrl}/user/11/unread`);
    expect(req.request.method).toBe('GET');
    req.flush([mockNotification]);
  });

  // ===== GET UNREAD COUNT =====

  it('getUnreadCount() should return count and update unreadCount$', (done) => {
    service.getUnreadCount(11).subscribe(result => {
      expect(result.count).toBe(5);
    });

    const req = httpMock.expectOne(`${apiUrl}/user/11/unread/count`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 5 });

    service.unreadCount$.subscribe(count => {
      if (count === 5) {
        expect(count).toBe(5);
        done();
      }
    });
  });

  it('unreadCount$ should start at 0', (done) => {
    service.unreadCount$.subscribe(count => {
      expect(count).toBe(0);
      done();
    });
  });

  // ===== MARK AS READ =====

  it('markAsRead() should call PUT to mark notification as read', () => {
    service.markAsRead(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1/read`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ===== MARK ALL AS READ =====

  it('markAllAsRead() should call PUT and reset unreadCount$ to 0', (done) => {
    // D'abord mettre un count > 0
    service.getUnreadCount(11).subscribe();
    const countReq = httpMock.expectOne(`${apiUrl}/user/11/unread/count`);
    countReq.flush({ count: 3 });

    // Puis marquer tout comme lu
    service.markAllAsRead(11).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/user/11/read-all`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);

    service.unreadCount$.subscribe(count => {
      if (count === 0) {
        expect(count).toBe(0);
        done();
      }
    });
  });

  // ===== DELETE NOTIFICATION =====

  it('deleteNotification() should call DELETE', () => {
    service.deleteNotification(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ===== SEND ANNOUNCEMENT =====

  it('sendAnnouncement() should call POST with correct body', () => {
    service.sendAnnouncement(39, 'Annonce', 'Message important', [11, 12, 13]).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/announcement`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      competitionId: 39,
      title: 'Annonce',
      message: 'Message important',
      userIds: [11, 12, 13]
    });
    req.flush(null);
  });

  it('sendAnnouncement() should allow null competitionId for global announcements', () => {
    service.sendAnnouncement(null, 'Global', 'Message global', [11]).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/announcement`);
    expect(req.request.body.competitionId).toBeNull();
    req.flush(null);
  });

  // ===== ADD NOTIFICATION (temps réel) =====

  it('addNotification() should prepend notification to list', (done) => {
    // Initialiser avec une notification
    service.getUserNotifications(11).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/user/11`);
    req.flush([mockNotification]);

    // Ajouter une nouvelle notification en temps réel
    const newNotif = { ...mockNotification, idNotification: 99, title: 'Nouveau message' };
    service.addNotification(newNotif as any);

    service.notifications$.subscribe(notifications => {
      if (notifications.length === 2) {
        expect(notifications[0].title).toBe('Nouveau message'); // en tête de liste
        expect(notifications[1].title).toBe('Compétition mise à jour');
        done();
      }
    });
  });

  it('addNotification() should increment unreadCount$', (done) => {
    service.addNotification(mockNotification as any);

    service.unreadCount$.subscribe(count => {
      if (count === 1) {
        expect(count).toBe(1);
        done();
      }
    });
  });
});
