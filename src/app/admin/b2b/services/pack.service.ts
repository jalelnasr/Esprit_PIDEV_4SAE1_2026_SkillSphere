import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pack, PackRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bPackService {
  private readonly base = '/b2b-api/packs';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Pack[]> { return this.http.get<Pack[]>(this.base); }
  getActive(): Observable<Pack[]> { return this.http.get<Pack[]>(`${this.base}/active`); }
  getById(id: number): Observable<Pack> { return this.http.get<Pack>(`${this.base}/${id}`); }
  create(req: PackRequest): Observable<Pack> { return this.http.post<Pack>(this.base, req); }
  update(id: number, req: PackRequest): Observable<Pack> { return this.http.put<Pack>(`${this.base}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
