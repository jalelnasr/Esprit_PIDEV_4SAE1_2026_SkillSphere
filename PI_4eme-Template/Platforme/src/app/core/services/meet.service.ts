import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface MeetResponse {
  id: number;
  sessionId: number;
  sessionCourseTitle: string;
  formateurId: number;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  meetToken: string;
  meetLink: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  createdAt: string;
  participantCount: number;
}

export interface MeetRequest {
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes?: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  type: 'VIRTUAL' | 'IN_PERSON';
  color: string;
  meetLink?: string;
  location?: string;
  sessionId: number;
  meetId?: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class MeetService {
  private readonly BASE = 'http://localhost:8080/formation-service/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-User-Id': String(user?.idUser ?? ''),
      'X-User-Role': user?.role ?? ''
    });
  }

  // ── FORMATEUR ──────────────────────────────────────────────────────────────
  createMeet(sessionId: number, request: MeetRequest): Observable<MeetResponse> {
    return this.http.post<MeetResponse>(
      `${this.BASE}/sessions/${sessionId}/meets`,
      request,
      { headers: this.headers() }
    );
  }

  updateMeetStatus(meetId: number, status: string): Observable<MeetResponse> {
    return this.http.put<MeetResponse>(
      `${this.BASE}/meets/${meetId}/status`,
      { status },
      { headers: this.headers() }
    );
  }

  deleteMeet(meetId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.BASE}/meets/${meetId}`,
      { headers: this.headers() }
    );
  }

  // ── ALL ROLES ──────────────────────────────────────────────────────────────
  getMeetsBySession(sessionId: number): Observable<MeetResponse[]> {
    return this.http.get<MeetResponse[]>(
      `${this.BASE}/sessions/${sessionId}/meets`,
      { headers: this.headers() }
    );
  }

  getUpcomingMeets(): Observable<MeetResponse[]> {
    return this.http.get<MeetResponse[]>(
      `${this.BASE}/meets/upcoming`,
      { headers: this.headers() }
    );
  }

  getTodayMeets(): Observable<MeetResponse[]> {
    return this.http.get<MeetResponse[]>(
      `${this.BASE}/meets/today`,
      { headers: this.headers() }
    );
  }

  getCalendar(month: string): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(
      `${this.BASE}/meets/calendar?month=${month}`,
      { headers: this.headers() }
    );
  }

  // ── APPRENANT ──────────────────────────────────────────────────────────────
  recordJoin(meetId: number): Observable<void> {
    return this.http.post<void>(
      `${this.BASE}/meets/${meetId}/join`,
      {},
      { headers: this.headers() }
    );
  }
}
