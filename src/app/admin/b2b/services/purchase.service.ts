import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PackPurchase, PackPurchaseRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bPurchaseService {
  private readonly base = '/b2b-api/purchases';
  constructor(private http: HttpClient) {}

  getAll(): Observable<PackPurchase[]> { return this.http.get<PackPurchase[]>(this.base); }
  getById(id: number): Observable<PackPurchase> { return this.http.get<PackPurchase>(`${this.base}/${id}`); }
  getByCompany(companyId: number): Observable<PackPurchase[]> { return this.http.get<PackPurchase[]>(`${this.base}/company/${companyId}`); }
  purchase(req: PackPurchaseRequest): Observable<PackPurchase> { return this.http.post<PackPurchase>(this.base, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
