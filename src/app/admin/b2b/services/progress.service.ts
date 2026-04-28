import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Progress } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bProgressService {
  private readonly base = '/b2b-api/progress';
  constructor(private http: HttpClient) {}

  getByAssignment(assignmentId: number): Observable<Progress> { return this.http.get<Progress>(`${this.base}/assignment/${assignmentId}`); }
  updateProgress(assignmentId: number, body: Progress): Observable<Progress> { return this.http.put<Progress>(`${this.base}/assignment/${assignmentId}`, body); }
  getCompanyAverage(companyId: number): Observable<number> { return this.http.get<number>(`${this.base}/company/${companyId}/average`); }
}
