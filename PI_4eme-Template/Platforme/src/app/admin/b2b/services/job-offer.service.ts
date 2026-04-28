import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer, JobOfferRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bJobOfferService {
  private readonly base = '/b2b-api/job-offers';
  constructor(private http: HttpClient) {}

  getAll(): Observable<JobOffer[]> { return this.http.get<JobOffer[]>(this.base); }
  getOpen(): Observable<JobOffer[]> { return this.http.get<JobOffer[]>(`${this.base}/open`); }
  getById(id: number): Observable<JobOffer> { return this.http.get<JobOffer>(`${this.base}/${id}`); }
  getByCompany(companyId: number): Observable<JobOffer[]> { return this.http.get<JobOffer[]>(`${this.base}/company/${companyId}`); }
  searchBySkill(skill: string): Observable<JobOffer[]> { return this.http.get<JobOffer[]>(`${this.base}/search`, { params: new HttpParams().set('skill', skill) }); }
  create(req: JobOfferRequest): Observable<JobOffer> { return this.http.post<JobOffer>(this.base, req); }
  update(id: number, req: JobOfferRequest): Observable<JobOffer> { return this.http.put<JobOffer>(`${this.base}/${id}`, req); }
  updateStatus(id: number, status: string): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.base}/${id}/status`, null, { params: new HttpParams().set('status', status) });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
