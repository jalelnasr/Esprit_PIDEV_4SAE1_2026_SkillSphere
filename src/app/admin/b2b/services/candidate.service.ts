import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate, CandidateRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bCandidateService {
  private readonly base = '/b2b-api/candidates';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Candidate[]> { return this.http.get<Candidate[]>(this.base); }
  getActive(): Observable<Candidate[]> { return this.http.get<Candidate[]>(`${this.base}/active`); }
  getById(id: number): Observable<Candidate> { return this.http.get<Candidate>(`${this.base}/${id}`); }
  searchBySkill(skill: string): Observable<Candidate[]> { return this.http.get<Candidate[]>(`${this.base}/search`, { params: new HttpParams().set('skill', skill) }); }
  create(req: CandidateRequest): Observable<Candidate> { return this.http.post<Candidate>(this.base, req); }
  update(id: number, req: CandidateRequest): Observable<Candidate> { return this.http.put<Candidate>(`${this.base}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
