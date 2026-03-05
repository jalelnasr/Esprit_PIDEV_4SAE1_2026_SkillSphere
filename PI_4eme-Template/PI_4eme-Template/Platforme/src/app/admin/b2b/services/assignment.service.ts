import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, AssignmentRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bAssignmentService {
  private readonly base = '/b2b-api/assignments';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Assignment[]> { return this.http.get<Assignment[]>(this.base); }
  getById(id: number): Observable<Assignment> { return this.http.get<Assignment>(`${this.base}/${id}`); }
  getByCompany(companyId: number): Observable<Assignment[]> { return this.http.get<Assignment[]>(`${this.base}/company/${companyId}`); }
  getByEmployee(employeeId: number): Observable<Assignment[]> { return this.http.get<Assignment[]>(`${this.base}/employee/${employeeId}`); }
  create(req: AssignmentRequest): Observable<Assignment> { return this.http.post<Assignment>(this.base, req); }
  updateStatus(id: number, status: string): Observable<Assignment> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Assignment>(`${this.base}/${id}/status`, null, { params });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
