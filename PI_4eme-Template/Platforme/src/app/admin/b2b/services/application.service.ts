import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, ApplicationRequest } from '../models/b2b.models';

export interface EmailNotification {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  status: string; // ACCEPTED or REJECTED
  message?: string; // optional custom message from RH
}

@Injectable({ providedIn: 'root' })
export class B2bApplicationService {
  private readonly base = '/b2b-api/applications';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Application[]> { return this.http.get<Application[]>(this.base); }
  getById(id: number): Observable<Application> { return this.http.get<Application>(`${this.base}/${id}`); }
  getByJobOffer(jobOfferId: number): Observable<Application[]> { return this.http.get<Application[]>(`${this.base}/job-offer/${jobOfferId}`); }
  getByCandidate(candidateId: number): Observable<Application[]> { return this.http.get<Application[]>(`${this.base}/candidate/${candidateId}`); }
  getTopByJobOffer(jobOfferId: number): Observable<Application[]> { return this.http.get<Application[]>(`${this.base}/job-offer/${jobOfferId}/top`); }
  apply(req: ApplicationRequest): Observable<Application> { return this.http.post<Application>(this.base, req); }
  updateStatus(id: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.base}/${id}/status`, null, { params: new HttpParams().set('status', status) });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }

  /** Send email notification to candidate about acceptance/rejection */
  sendNotification(notification: EmailNotification): Observable<any> {
    return this.http.post(`${this.base}/notify`, notification);
  }

  /** Update status AND send email in one call */
  updateStatusWithEmail(id: number, status: string, notification: EmailNotification): Observable<Application> {
    return this.http.put<Application>(`${this.base}/${id}/status-notify`, notification, {
      params: new HttpParams().set('status', status)
    });
  }
}
