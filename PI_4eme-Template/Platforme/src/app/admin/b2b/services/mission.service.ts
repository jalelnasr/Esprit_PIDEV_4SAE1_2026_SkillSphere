import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mission, MissionRequest, MissionApplyRequest, MissionApplication } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bMissionService {
  private readonly base = '/b2b-api/missions';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Mission[]> { return this.http.get<Mission[]>(this.base); }
  getOpen(): Observable<Mission[]> { return this.http.get<Mission[]>(`${this.base}/open`); }
  getById(id: number): Observable<Mission> { return this.http.get<Mission>(`${this.base}/${id}`); }
  getByCompany(companyId: number): Observable<Mission[]> { return this.http.get<Mission[]>(`${this.base}/company/${companyId}`); }
  create(req: MissionRequest): Observable<Mission> { return this.http.post<Mission>(this.base, req); }
  apply(req: MissionApplyRequest): Observable<MissionApplication> { return this.http.post<MissionApplication>(`${this.base}/apply`, req); }
  getApplications(missionId: number): Observable<MissionApplication[]> { return this.http.get<MissionApplication[]>(`${this.base}/${missionId}/applications`); }
  getApplicationsByCandidate(candidateId: number): Observable<MissionApplication[]> { return this.http.get<MissionApplication[]>(`/b2b-api/mission-applications/candidate/${candidateId}`); }
  update(id: number, req: MissionRequest): Observable<Mission> { return this.http.put<Mission>(`${this.base}/${id}`, req); }
  updateStatus(id: number, status: string): Observable<Mission> {
    return this.http.put<Mission>(`${this.base}/${id}/status`, null, { params: new HttpParams().set('status', status) });
  }
  updateApplicationStatus(applicationId: number, status: string): Observable<MissionApplication> {
    return this.http.put<MissionApplication>(`${this.base}/applications/${applicationId}/status`, null, { params: new HttpParams().set('status', status) });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
