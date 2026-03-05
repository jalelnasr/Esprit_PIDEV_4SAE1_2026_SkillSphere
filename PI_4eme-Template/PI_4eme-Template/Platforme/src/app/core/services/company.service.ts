import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Company {
  id: number;
  name: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly base = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  /** Get all companies */
  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.base);
  }

  /** Get a single company by id */
  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.base}/${id}`);
  }
}
