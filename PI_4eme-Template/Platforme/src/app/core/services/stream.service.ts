import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StreamData {
  id: number;
  competitionId: number;
  streamUrl: string;
  embedUrl: string;
  platform: string;
  title: string;
  status: 'LIVE' | 'OFFLINE';
  startedAt: string;
  stoppedAt: string;
  autoExpireHours: number;
  isLive: boolean;
  canWatch: boolean;       // true si formateur ou participant
  isParticipant: boolean;  // true si inscrit à la compétition
}

@Injectable({ providedIn: 'root' })
export class StreamService {
  private apiUrl = `${environment.competitionsApiUrl}/stream`;

  constructor(private http: HttpClient) {}

  getStream(competitionId: number): Observable<StreamData> {
    return this.http.get<StreamData>(`${this.apiUrl}/competition/${competitionId}`);
  }

  createStream(competitionId: number, data: {
    streamUrl: string; title?: string; autoExpireHours?: number;
  }): Observable<StreamData> {
    return this.http.post<StreamData>(`${this.apiUrl}/competition/${competitionId}`, data);
  }

  startStream(competitionId: number): Observable<StreamData> {
    return this.http.put<StreamData>(`${this.apiUrl}/competition/${competitionId}/start`, {});
  }

  stopStream(competitionId: number): Observable<StreamData> {
    return this.http.put<StreamData>(`${this.apiUrl}/competition/${competitionId}/stop`, {});
  }

  deleteStream(competitionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/competition/${competitionId}`);
  }

  getPlatformIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      'YOUTUBE': '▶️', 'TWITCH': '🎮', 'ZOOM': '📹',
      'MEET': '📞', 'DISCORD': '💬', 'OTHER': '🔴'
    };
    return icons[platform] || '🔴';
  }
}
