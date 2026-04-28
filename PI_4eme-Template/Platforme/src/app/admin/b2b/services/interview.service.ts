import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Interview {
  id?: number;
  candidateId: number;
  recruiterId: number;
  jobOfferId: number;
  interviewDateTime: string;
  status?: string;
  location: string;
  meetingLink?: string;
  notes?: string;
  googleCalendarEventId?: string;
  reminderSent24h?: boolean;
  reminderSent1h?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:8083/api/interviews';

  constructor(private http: HttpClient) { }

  createInterview(interview: Interview): Observable<Interview> {
    return this.http.post<Interview>(this.apiUrl, interview);
  }

  getInterviewById(id: number): Observable<Interview> {
    return this.http.get<Interview>(`${this.apiUrl}/${id}`);
  }

  getInterviewsByCandidate(candidateId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/candidate/${candidateId}`);
  }

  getInterviewsByRecruiter(recruiterId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/recruiter/${recruiterId}`);
  }

  getInterviewsByJobOffer(jobOfferId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/job-offer/${jobOfferId}`);
  }

  getInterviewsBetweenDates(startDate: string, endDate: string): Observable<Interview[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Interview[]>(`${this.apiUrl}/calendar`, { params });
  }

  updateInterview(id: number, interview: Interview): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}`, interview);
  }

  cancelInterview(id: number): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  sendReminders(): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/send-reminders`, {});
  }
}
