import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalCompetitions: number;
  activeCompetitions: number;
  completedCompetitions: number;
  totalParticipants: number;
  totalTeams: number;
  totalMessages: number;
  totalNotifications: number;
  participationRate: number;
  totalRegistrations: number;
  competitionsByType: { [key: string]: number };
  competitionsByStatus: { [key: string]: number };
  monthlyStats: MonthlyStats[];
  topCompetitions: CompetitionStats[];
  messageStats: CompetitionMessageStats[];
}

export interface MonthlyStats {
  month: string;
  competitions: number;
  participants: number;
  messages: number;
}

export interface CompetitionStats {
  competitionId: number;
  title: string;
  type: string;
  status: string;
  participantCount: number;
  teamCount: number;
  messageCount: number;
  maxParticipants: number;
  fillRate: number;
}

export interface CompetitionMessageStats {
  competitionId: number;
  competitionTitle: string;
  messageCount: number;
  uniqueParticipants: number;
}

export interface CompetitionFilter {
  searchTerm?: string;
  type?: string;
  status?: string;
  participationType?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  minParticipants?: number;
  maxParticipants?: number;
  sortBy?: string;
  sortDirection?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.competitionsApiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  filterCompetitions(filter: CompetitionFilter): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/competitions/filter`, filter);
  }

  searchCompetitions(searchTerm: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competitions/search`, {
      params: { q: searchTerm }
    });
  }
}
