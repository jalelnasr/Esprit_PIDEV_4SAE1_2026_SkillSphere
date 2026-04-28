import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, CompanyRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bCompanyService {
  private readonly base = '/b2b-api/companies';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> { return this.http.get<Company[]>(this.base); }
  getById(id: number): Observable<Company> { return this.http.get<Company>(`${this.base}/${id}`); }
  create(req: CompanyRequest): Observable<Company> { return this.http.post<Company>(this.base, req); }
  update(id: number, req: CompanyRequest): Observable<Company> { return this.http.put<Company>(`${this.base}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  getBySector(sector: string): Observable<Company[]> { return this.http.get<Company[]>(`${this.base}/sector/${sector}`); }
}
