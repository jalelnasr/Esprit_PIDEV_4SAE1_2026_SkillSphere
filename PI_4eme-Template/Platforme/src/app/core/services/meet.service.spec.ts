import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeetService, MeetResponse, MeetRequest, CalendarEvent } from './meet.service';
import { AuthService } from './auth.service';

describe('MeetService', () => {
  let service: MeetService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8087/formation-service/api';

  const mockUser = { idUser: 10, email: 'test@test.com', role: 'FORMATEUR' };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getToken']);
    authSpy.getCurrentUser.and.returnValue(mockUser);
    authSpy.getToken.and.returnValue('mock-jwt-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MeetService,
        { provide: AuthService, useValue: authSpy }
      ]
    });
    service = TestBed.inject(MeetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── createMeet ────────────────────────────────────────────────────────────

  it('should create meet for a session', () => {
    const request: MeetRequest = {
      title: 'Weekly Standup',
      description: 'Team sync',
      scheduledAt: new Date().toISOString(),
      durationMinutes: 60
    };

    const mockResponse: MeetResponse = {
      id: 1, sessionId: 1, sessionCourseTitle: 'Java', formateurId: 10,
      title: 'Weekly Standup', description: 'Team sync',
      scheduledAt: request.scheduledAt, durationMinutes: 60,
      meetToken: 'token123', meetLink: 'https://meet.jit.si/token123',
      status: 'SCHEDULED', createdAt: new Date().toISOString(), participantCount: 0
    };

    service.createMeet(1, request).subscribe(meet => {
      expect(meet.id).toBe(1);
      expect(meet.title).toBe('Weekly Standup');
      expect(meet.meetLink).toContain('meet.jit.si');
      expect(meet.status).toBe('SCHEDULED');
    });

    const req = httpMock.expectOne(`${base}/sessions/1/meets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  // ── getMeetsBySession ─────────────────────────────────────────────────────

  it('should get meets by session', () => {
    const mockMeets: MeetResponse[] = [
      { id: 1, sessionId: 1, sessionCourseTitle: 'Java', formateurId: 10,
        title: 'Meet 1', description: '', scheduledAt: '', durationMinutes: 60,
        meetToken: 'tok1', meetLink: 'https://meet.jit.si/tok1',
        status: 'SCHEDULED', createdAt: '', participantCount: 5 },
      { id: 2, sessionId: 1, sessionCourseTitle: 'Java', formateurId: 10,
        title: 'Meet 2', description: '', scheduledAt: '', durationMinutes: 90,
        meetToken: 'tok2', meetLink: 'https://meet.jit.si/tok2',
        status: 'ENDED', createdAt: '', participantCount: 10 }
    ];

    service.getMeetsBySession(1).subscribe(meets => {
      expect(meets.length).toBe(2);
      expect(meets[0].title).toBe('Meet 1');
      expect(meets[1].status).toBe('ENDED');
    });

    const req = httpMock.expectOne(`${base}/sessions/1/meets`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMeets);
  });

  // ── recordJoin ────────────────────────────────────────────────────────────

  it('should record join for a meet', () => {
    service.recordJoin(1).subscribe(res => expect(res).toBeFalsy());

    const req = httpMock.expectOne(`${base}/meets/1/join`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  // ── getUpcomingMeets ──────────────────────────────────────────────────────

  it('should get upcoming meets', () => {
    const mockMeets: MeetResponse[] = [
      { id: 1, sessionId: 1, sessionCourseTitle: 'Java', formateurId: 10,
        title: 'Upcoming Meet', description: '', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 60, meetToken: 'tok', meetLink: 'https://meet.jit.si/tok',
        status: 'SCHEDULED', createdAt: '', participantCount: 3 }
    ];

    service.getUpcomingMeets().subscribe(meets => {
      expect(meets.length).toBe(1);
      expect(meets[0].title).toBe('Upcoming Meet');
    });

    const req = httpMock.expectOne(`${base}/meets/upcoming`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMeets);
  });

  // ── getTodayMeets ─────────────────────────────────────────────────────────

  it('should get today meets', () => {
    const mockMeets: MeetResponse[] = [
      { id: 1, sessionId: 1, sessionCourseTitle: 'Java', formateurId: 10,
        title: "Today's Meet", description: '', scheduledAt: new Date().toISOString(),
        durationMinutes: 60, meetToken: 'tok', meetLink: 'https://meet.jit.si/tok',
        status: 'LIVE', createdAt: '', participantCount: 8 }
    ];

    service.getTodayMeets().subscribe(meets => {
      expect(meets.length).toBe(1);
      expect(meets[0].status).toBe('LIVE');
    });

    const req = httpMock.expectOne(`${base}/meets/today`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMeets);
  });

  // ── getCalendar ───────────────────────────────────────────────────────────

  it('should get calendar events for a month', () => {
    const mockEvents: CalendarEvent[] = [
      { id: 1, title: 'Virtual Meet', start: '', end: '', type: 'VIRTUAL',
        color: '#3B82F6', meetLink: 'https://meet.jit.si/tok', sessionId: 1, meetId: 1, status: 'SCHEDULED' },
      { id: 2, title: 'In-Person Session', start: '', end: '', type: 'IN_PERSON',
        color: '#10B981', location: 'Room 101', sessionId: 2, status: 'PLANNED' }
    ];

    service.getCalendar('2026-04').subscribe(events => {
      expect(events.length).toBe(2);
      expect(events[0].type).toBe('VIRTUAL');
      expect(events[1].type).toBe('IN_PERSON');
    });

    const req = httpMock.expectOne(`${base}/meets/calendar?month=2026-04`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  // ── updateMeetStatus ──────────────────────────────────────────────────────

  it('should update meet status', () => {
    const updated: MeetResponse = {
      id: 1, sessionId: 1, sessionCourseTitle: 'Java', formateurId: 10,
      title: 'Meet', description: '', scheduledAt: '', durationMinutes: 60,
      meetToken: 'tok', meetLink: 'https://meet.jit.si/tok',
      status: 'ENDED', createdAt: '', participantCount: 15
    };

    service.updateMeetStatus(1, 'ENDED').subscribe(meet => {
      expect(meet.status).toBe('ENDED');
    });

    const req = httpMock.expectOne(`${base}/meets/1/status`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  // ── deleteMeet ────────────────────────────────────────────────────────────

  it('should delete meet', () => {
    service.deleteMeet(1).subscribe(res => expect(res).toBeFalsy());

    const req = httpMock.expectOne(`${base}/meets/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  it('should handle 404 when meet not found', () => {
    service.getMeetsBySession(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });

    const req = httpMock.expectOne(`${base}/sessions/999/meets`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle 403 when unauthorized to create meet', () => {
    const request: MeetRequest = { title: 'Test', scheduledAt: '', durationMinutes: 60 };

    service.createMeet(1, request).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(403)
    });

    const req = httpMock.expectOne(`${base}/sessions/1/meets`);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });
});
